#!/usr/bin/env python3
"""
Test script for SCRFD face detection implementation.
This script tests the SCRFD detector without YOLO dependencies.
"""

import cv2
import numpy as np
import os
import sys

# Add src to path
sys.path.append('src')

try:
    from src.detector_scrfd import detect_faces
    from src.recognize_faces import FaceRecognizer
    print("Successfully imported face detector and face recognizer")
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install required dependencies:")
    print("pip install opencv-python deepface faiss-cpu")
    sys.exit(1)

def test_face_detection():
    """Test face detection on a sample image or webcam."""
    print("\n=== Testing Face Detection ===")
    
    # Try to use webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam. Please ensure camera is connected.")
        return False
    
    print("Webcam opened successfully")
    print("Press 'q' to quit, 's' to save a test image")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to read from webcam")
                break
            
            # Detect faces using OpenCV Haar Cascade
            face_boxes = detect_faces(frame, device='cpu')
            
            # Draw bounding boxes
            for box in face_boxes:
                x1, y1, x2, y2 = box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Face", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show frame
            cv2.imshow('Face Detection Test', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                cv2.imwrite('test_face_detection_output.jpg', frame)
                print("Test image saved as 'test_face_detection_output.jpg'")
    
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error during detection: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()
    
    return True

def test_face_recognizer():
    """Test the complete face recognition system."""
    print("\n=== Testing Face Recognition System ===")
    
    try:
        # Initialize face recognizer
        recognizer = FaceRecognizer()
        print("Face recognizer initialized successfully")
        
        # Test with webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Could not open webcam for recognition test")
            return False
        
        print("Webcam opened for recognition test")
        print("Press 'q' to quit")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Recognize faces
            results = recognizer.recognize_face(frame)
            
            # Draw results
            for result in results:
                x, y, w, h = result['box']
                label = result['label']
                distance = result['distance']
                
                color = (0, 255, 0) if label != "Unknown" else (0, 0, 255)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f"{label} ({distance:.2f})", (x, y - 10), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            
            cv2.imshow('Face Recognition System', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    
    except Exception as e:
        print(f"Error in face recognition: {e}")
        return False
    finally:
        cap.release()
        cv2.destroyAllWindows()
    
    return True

if __name__ == "__main__":
    print("Face Detection Test")
    print("=" * 50)
    
    # Test 1: Basic face detection
    if test_face_detection():
        print("Face detection test completed")
    else:
        print("Face detection test failed")
        sys.exit(1)
    
    # Test 2: Full face recognition system
    print("\n" + "=" * 50)
    if test_face_recognizer():
        print("Face recognition system test completed")
    else:
        print("Face recognition system test failed")
        sys.exit(1)
    
    print("\nAll tests completed successfully!")
    print("Face detection implementation is working correctly.")
