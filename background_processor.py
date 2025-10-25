import cv2
import sqlite3
import threading
import time
import requests
import numpy as np
from src.recognize_faces import FaceRecognizer
from src.utils import load_config

# --- Configuration ---
DB_PATH = "attendance_system.db"
API_URL = "http://localhost:5000/attendance/mark"
CONFIG = load_config()
RECOGNITION_COOLDOWN = 60 * 5  # 5 minutes cooldown per person per camera

# --- Global Variables ---
active_threads = {}  # {camera_id: thread_object}
stop_flags = {}  # {camera_id: stop_flag}
face_recognizer = None

# --- Database & API Functions ---

def get_active_cameras():
    """Fetches all active cameras from the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT camera_id, name, ip_address FROM cameras WHERE is_active = 1")
        cameras = [{'camera_id': row[0], 'name': row[1], 'ip_address': row[2]} for row in c.fetchall()]
        conn.close()
        return cameras
    except Exception as e:
        print(f"❌ [DB Error] Could not fetch cameras: {e}")
        return []

def mark_attendance(roll_no, camera_id):
    """Marks attendance by calling the backend API."""
    try:
        payload = {'roll_no': roll_no, 'camera_id': camera_id}
        response = requests.post(API_URL, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"✅ [Attendance] Marked for {roll_no} from camera {camera_id}. Message: {response.json().get('message')}")
            return True
        else:
            print(f"⚠️ [API Warning] Failed to mark attendance for {roll_no}. Status: {response.status_code}, Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ [API Error] Could not connect to backend: {e}")
        return False

# --- Camera Processing Thread ---

def process_camera_feed(camera_info, stop_event):
    """
    Processes a single camera feed in a dedicated thread.
    Detects and recognizes faces, then marks attendance.
    """
    global face_recognizer
    camera_id = camera_info['camera_id']
    camera_name = camera_info['name']
    camera_source = camera_info['ip_address']
    
    # Cooldown management for recognized faces
    recognition_timestamps = {}

    print(f"🚀 [Thread Start] Starting processor for camera: {camera_name} ({camera_source})")

    while not stop_event.is_set():
        cap = cv2.VideoCapture(camera_source)
        if not cap.isOpened():
            print(f"❌ [Capture Error] Cannot open camera: {camera_name}. Retrying in 30 seconds...")
            time.sleep(30)
            continue

        print(f"🟢 [Capture] Camera feed opened successfully for: {camera_name}")

        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                print(f"⚠️ [Capture Warning] Lost connection to camera: {camera_name}. Reconnecting...")
                break  # Break inner loop to reconnect

            try:
                # Perform face detection and recognition
                recognition_results = face_recognizer.recognize_face(frame)

                for result in recognition_results:
                    name = result['label']
                    score = result['score']
                    
                    if name != "Unknown":
                        current_time = time.time()
                        last_seen = recognition_timestamps.get(name, 0)

                        # Check if cooldown has passed
                        if current_time - last_seen > RECOGNITION_COOLDOWN:
                            print(f"🎯 [Recognition] Recognized {name} on camera {camera_name} with score {score:.2f}")
                            if mark_attendance(name, camera_id):
                                # Update timestamp only on successful marking
                                recognition_timestamps[name] = current_time
                        else:
                            # Optional: log that the user is on cooldown
                            # print(f"⏳ [Cooldown] {name} was recently recognized. Skipping attendance marking.")
                            pass

            except Exception as e:
                print(f"❌ [Processing Error] An error occurred in camera {camera_name}: {e}")
            
            # Give other threads a chance to run
            time.sleep(0.05)

        cap.release()
        if not stop_event.is_set():
            time.sleep(5) # Wait before attempting to reconnect

    print(f"🛑 [Thread Stop] Stopping processor for camera: {camera_name}")

# --- Main Control Loop ---

def main():
    """
    Main function to manage camera processing threads.
    Periodically checks for changes in active cameras.
    """
    global face_recognizer, active_threads, stop_flags
    
    print("Initializing Face Recognition System...")
    while face_recognizer is None:
        try:
            # Initialize the recognizer once
            face_recognizer = FaceRecognizer()
            print("✅ Face Recognition System Initialized.")
        except Exception as e:
            print(f"⏳ [Waiting] Face recognizer not ready yet: {e}. Retrying in 30 seconds...")
            time.sleep(30)
            
    print("Starting Background Processor...")
    
    try:
        while True:
            # Get the desired state from the database
            active_cameras = get_active_cameras()
            active_camera_ids = {cam['camera_id'] for cam in active_cameras}
            
            # Get the current state of running threads
            running_camera_ids = set(active_threads.keys())
            
            # --- Start new threads for newly activated cameras ---
            cameras_to_start = active_camera_ids - running_camera_ids
            for camera_id in cameras_to_start:
                camera_info = next((cam for cam in active_cameras if cam['camera_id'] == camera_id), None)
                if camera_info:
                    stop_event = threading.Event()
                    thread = threading.Thread(target=process_camera_feed, args=(camera_info, stop_event))
                    thread.daemon = True
                    thread.start()
                    
                    active_threads[camera_id] = thread
                    stop_flags[camera_id] = stop_event

            # --- Stop threads for deactivated cameras ---
            cameras_to_stop = running_camera_ids - active_camera_ids
            for camera_id in cameras_to_stop:
                if camera_id in stop_flags:
                    print(f"⏳ [Shutdown] Signaling stop for camera ID: {camera_id}")
                    stop_flags[camera_id].set()
                    active_threads[camera_id].join(timeout=10) # Wait for thread to finish
                    
                    # Clean up
                    del active_threads[camera_id]
                    del stop_flags[camera_id]

            print(f"ℹ️ [Status] System running. Active cameras being processed: {len(active_threads)}")
            time.sleep(30) # Check for camera changes every 30 seconds

    except KeyboardInterrupt:
        print("\nGracefully shutting down all camera processors...")
        for camera_id in list(active_threads.keys()):
            stop_flags[camera_id].set()
            active_threads[camera_id].join(timeout=10)
        print("✅ All threads stopped. Exiting.")
    except Exception as e:
        print(f"❌ [Fatal] An unexpected error occurred in the main loop: {e}")

if __name__ == '__main__':
    main()
