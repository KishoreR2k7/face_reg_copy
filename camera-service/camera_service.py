#!/usr/bin/env python3
"""
Background Camera Service
Handles real-time face recognition from multiple cameras
"""

import os
import sys
import time
import json
import threading
import cv2
import requests
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from utils import load_config, load_faiss_data
from recognize_faces import FaceRecognizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('camera-service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CameraService:
    def __init__(self):
        self.config = load_config()
        if not self.config:
            logger.error("Failed to load configuration")
            sys.exit(1)
        
        # Initialize face recognizer
        self.recognizer = FaceRecognizer()
        logger.info("Face recognizer initialized")
        
        # Camera threads
        self.camera_threads: Dict[str, threading.Thread] = {}
        self.camera_running: Dict[str, bool] = {}
        
        # API endpoint for sending recognition results
        self.api_base_url = "http://localhost:5000"
        
        logger.info("Camera service initialized")

    def start_camera(self, camera_id: str, camera_config: dict):
        """Start processing a specific camera"""
        if camera_id in self.camera_threads and self.camera_threads[camera_id].is_alive():
            logger.warning(f"Camera {camera_id} is already running")
            return
        
        self.camera_running[camera_id] = True
        thread = threading.Thread(
            target=self._process_camera,
            args=(camera_id, camera_config),
            daemon=True
        )
        self.camera_threads[camera_id] = thread
        thread.start()
        logger.info(f"Started camera {camera_id}")

    def stop_camera(self, camera_id: str):
        """Stop processing a specific camera"""
        if camera_id in self.camera_running:
            self.camera_running[camera_id] = False
            logger.info(f"Stopped camera {camera_id}")

    def _process_camera(self, camera_id: str, camera_config: dict):
        """Process video stream from a camera"""
        camera_name = camera_config.get('name', camera_id)
        camera_source = camera_config.get('source', 0)
        
        logger.info(f"Processing camera {camera_id} ({camera_name}) from source {camera_source}")
        
        # Initialize camera
        cap = cv2.VideoCapture(camera_source)
        if not cap.isOpened():
            logger.error(f"Failed to open camera {camera_id} from source {camera_source}")
            return
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        frame_count = 0
        last_recognition_time = 0
        recognition_cooldown = 2  # seconds between recognitions
        
        try:
            while self.camera_running.get(camera_id, False):
                ret, frame = cap.read()
                if not ret:
                    logger.warning(f"Failed to read frame from camera {camera_id}")
                    time.sleep(0.1)
                    continue
                
                frame_count += 1
                current_time = time.time()
                
                # Process every 30th frame (1 second at 30fps)
                if frame_count % 30 == 0 and (current_time - last_recognition_time) > recognition_cooldown:
                    try:
                        # Perform face recognition
                        results = self.recognizer.recognize_faces(frame)
                        
                        if results:
                            for result in results:
                                self._send_recognition_result(camera_id, camera_name, result)
                            
                            last_recognition_time = current_time
                            logger.info(f"Camera {camera_id}: Recognized {len(results)} faces")
                    
                    except Exception as e:
                        logger.error(f"Error processing frame from camera {camera_id}: {e}")
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.033)  # ~30 FPS
        
        except Exception as e:
            logger.error(f"Error in camera {camera_id} processing: {e}")
        
        finally:
            cap.release()
            logger.info(f"Camera {camera_id} processing stopped")

    def _send_recognition_result(self, camera_id: str, camera_name: str, result: dict):
        """Send recognition result to the API"""
        try:
            data = {
                'camera_id': camera_id,
                'camera_name': camera_name,
                'student_name': result.get('name', 'Unknown'),
                'roll_no': result.get('roll_no', 'Unknown'),
                'confidence': result.get('confidence', 0.0),
                'timestamp': datetime.now().isoformat(),
                'status': 'present'
            }
            
            response = requests.post(
                f"{self.api_base_url}/api/attendance/recognize",
                json=data,
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info(f"Sent recognition result for {result.get('name', 'Unknown')}")
            else:
                logger.warning(f"Failed to send recognition result: {response.status_code}")
        
        except Exception as e:
            logger.error(f"Error sending recognition result: {e}")

    def get_camera_status(self) -> Dict[str, dict]:
        """Get status of all cameras"""
        status = {}
        for camera_id in self.camera_running:
            status[camera_id] = {
                'running': self.camera_running.get(camera_id, False),
                'thread_alive': self.camera_threads.get(camera_id, {}).is_alive() if camera_id in self.camera_threads else False
            }
        return status

    def start_all_cameras(self):
        """Start all configured cameras"""
        cameras = self.config.get('CAMERA_SOURCES', [])
        for camera_config in cameras:
            camera_id = camera_config.get('name', f"camera_{len(self.camera_threads)}")
            self.start_camera(camera_id, camera_config)
        
        logger.info(f"Started {len(cameras)} cameras")

    def stop_all_cameras(self):
        """Stop all cameras"""
        for camera_id in list(self.camera_running.keys()):
            self.stop_camera(camera_id)
        
        # Wait for threads to finish
        for thread in self.camera_threads.values():
            if thread.is_alive():
                thread.join(timeout=5)
        
        logger.info("Stopped all cameras")

def main():
    """Main function to run the camera service"""
    logger.info("Starting Camera Service...")
    
    service = CameraService()
    
    try:
        # Start all configured cameras
        service.start_all_cameras()
        
        # Keep the service running
        logger.info("Camera service is running. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
            
            # Check camera status periodically
            status = service.get_camera_status()
            for camera_id, camera_status in status.items():
                if not camera_status['running'] and camera_status['thread_alive']:
                    logger.warning(f"Camera {camera_id} thread is alive but marked as stopped")
    
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    
    except Exception as e:
        logger.error(f"Camera service error: {e}")
    
    finally:
        service.stop_all_cameras()
        logger.info("Camera service stopped")

if __name__ == "__main__":
    main()
