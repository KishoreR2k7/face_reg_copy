#!/usr/bin/env python3
"""
Test the complete face recognition system without GUI.
This script tests the system end-to-end including automatic training.
"""

import os
import sys
import time
import requests
import json

# Add src to path
sys.path.append('src')

def test_system_initialization():
    """Test if the system can initialize properly."""
    print("=== Testing System Initialization ===")
    
    try:
        from src.recognize_faces import FaceRecognizer
        recognizer = FaceRecognizer()
        print("Face recognizer initialized successfully")
        return True
    except Exception as e:
        print(f"Face recognizer initialization failed: {e}")
        return False

def test_api_backend():
    """Test if the API backend can start."""
    print("\n=== Testing API Backend ===")
    
    try:
        # Start the API backend in a subprocess
        import subprocess
        import threading
        
        # Start the backend
        backend_process = subprocess.Popen([
            sys.executable, 'src/api_backend.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a bit for the server to start
        time.sleep(3)
        
        # Test if the server is running
        try:
            response = requests.get('http://localhost:5000/', timeout=5)
            if response.status_code == 200:
                print("API backend is running")
                backend_process.terminate()
                return True
            else:
                print(f"API backend returned status {response.status_code}")
                backend_process.terminate()
                return False
        except requests.exceptions.RequestException:
            print("API backend is not responding")
            backend_process.terminate()
            return False
            
    except Exception as e:
        print(f"API backend test failed: {e}")
        return False

def test_dataset_upload():
    """Test dataset upload and automatic training."""
    print("\n=== Testing Dataset Upload and Training ===")
    
    # Create a test image
    import cv2
    import numpy as np
    
    # Create a simple test image
    test_image = np.ones((200, 200, 3), dtype=np.uint8) * 255
    cv2.rectangle(test_image, (50, 50), (150, 150), (0, 0, 0), -1)
    cv2.imwrite('test_upload_image.jpg', test_image)
    
    try:
        # Test upload endpoint
        files = {'images': open('test_upload_image.jpg', 'rb')}
        data = {'label': 'test_person'}
        
        response = requests.post('http://localhost:5000/dataset/upload', 
                               files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Upload successful: {result.get('message', '')}")
            if result.get('training_completed'):
                print("Automatic training completed successfully")
            else:
                print(f"Training failed: {result.get('training_error', 'Unknown error')}")
            return result.get('training_completed', False)
        else:
            print(f"Upload failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Upload test failed: {e}")
        return False
    finally:
        # Clean up
        if os.path.exists('test_upload_image.jpg'):
            os.remove('test_upload_image.jpg')

def test_face_detection():
    """Test face detection functionality."""
    print("\n=== Testing Face Detection ===")
    
    try:
        from src.detector_scrfd import detect_faces
        import cv2
        import numpy as np
        
        # Create a test image with a simple face-like pattern
        test_image = np.ones((480, 640, 3), dtype=np.uint8) * 255
        # Draw a simple face
        cv2.circle(test_image, (320, 240), 100, (200, 200, 200), -1)
        cv2.circle(test_image, (300, 220), 10, (0, 0, 0), -1)  # Left eye
        cv2.circle(test_image, (340, 220), 10, (0, 0, 0), -1)  # Right eye
        cv2.ellipse(test_image, (320, 260), (20, 10), 0, 0, 180, (0, 0, 0), 2)  # Mouth
        
        # Test face detection
        faces = detect_faces(test_image)
        
        if faces:
            print(f"Face detection working - detected {len(faces)} face(s)")
            return True
        else:
            print("No faces detected in test image")
            return False
            
    except Exception as e:
        print(f"Face detection test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Complete System Test")
    print("=" * 50)
    
    tests = [
        ("System Initialization", test_system_initialization),
        ("Face Detection", test_face_detection),
        ("API Backend", test_api_backend),
        ("Dataset Upload & Training", test_dataset_upload),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"{test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nPassed: {passed}/{len(results)} tests")
    
    if passed == len(results):
        print("All tests passed! System is working correctly.")
    else:
        print("Some tests failed. Please check the errors above.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
