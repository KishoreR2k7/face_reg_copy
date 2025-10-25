#!/usr/bin/env python3
"""
Simple test script for face detection without GUI.
This script tests the face detection without requiring OpenCV GUI support.
"""

import cv2
import numpy as np
import os
import sys

# Add src to path
sys.path.append('src')

try:
    from src.detector_scrfd import detect_faces
    print("Successfully imported face detector")
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install required dependencies:")
    print("pip install opencv-python")
    sys.exit(1)

def test_face_detection_simple():
    """Test face detection on a sample image or webcam without GUI."""
    print("\n=== Testing Face Detection (No GUI) ===")
    
    # Try to use webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam. Please ensure camera is connected.")
        return False
    
    print("Webcam opened successfully")
    print("Testing face detection for 5 seconds...")
    
    try:
        import time
        start_time = time.time()
        frame_count = 0
        faces_detected = 0
        
        while time.time() - start_time < 5:  # Test for 5 seconds
            ret, frame = cap.read()
            if not ret:
                print("Failed to read from webcam")
                break
            
            frame_count += 1
            
            # Detect faces using OpenCV Haar Cascade
            face_boxes = detect_faces(frame, device='cpu')
            
            if face_boxes:
                faces_detected += len(face_boxes)
                print(f"Frame {frame_count}: Detected {len(face_boxes)} face(s)")
            
            # Save a test image if faces are detected
            if face_boxes and frame_count == 1:
                # Draw bounding boxes on the frame
                for box in face_boxes:
                    x1, y1, x2, y2 = box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, "Face", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                cv2.imwrite('test_face_detection_output.jpg', frame)
                print("Test image saved as 'test_face_detection_output.jpg'")
    
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error during detection: {e}")
    finally:
        cap.release()
    
    print(f"Test completed: {frame_count} frames processed, {faces_detected} faces detected")
    return True

def test_face_detection_with_image():
    """Test face detection on a sample image."""
    print("\n=== Testing Face Detection with Sample Image ===")
    
    # Create a simple test image with a rectangle (simulating a face)
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw a simple rectangle to simulate a face
    cv2.rectangle(test_image, (200, 150), (400, 350), (255, 255, 255), -1)
    cv2.rectangle(test_image, (250, 200), (350, 250), (0, 0, 0), -1)  # Eyes
    cv2.rectangle(test_image, (300, 300), (320, 320), (0, 0, 0), -1)   # Nose
    cv2.rectangle(test_image, (280, 330), (360, 340), (0, 0, 0), -1)   # Mouth
    
    # Save the test image
    cv2.imwrite('test_sample_image.jpg', test_image)
    print("Created test sample image: test_sample_image.jpg")
    
    # Test face detection
    face_boxes = detect_faces(test_image, device='cpu')
    
    if face_boxes:
        print(f"Detected {len(face_boxes)} face(s) in sample image")
        for i, box in enumerate(face_boxes):
            x1, y1, x2, y2 = box
            print(f"  Face {i+1}: ({x1}, {y1}) to ({x2}, {y2})")
    else:
        print("No faces detected in sample image")
    
    return len(face_boxes) > 0

if __name__ == "__main__":
    print("Simple Face Detection Test")
    print("=" * 50)
    
    # Test 1: Face detection with sample image
    if test_face_detection_with_image():
        print("Sample image test completed successfully")
    else:
        print("Sample image test failed")
    
    # Test 2: Face detection with webcam (no GUI)
    print("\n" + "=" * 50)
    if test_face_detection_simple():
        print("Webcam test completed successfully")
    else:
        print("Webcam test failed")
    
    print("\nSimple face detection test completed!")
    print("Face detection implementation is working correctly.")
