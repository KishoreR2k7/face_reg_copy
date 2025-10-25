import cv2
import sys
import os
# Ensure project root is on path so imports like `src.*` work when run from scripts/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.recognize_faces import FaceRecognizer

if __name__ == '__main__':
    rec = FaceRecognizer()
    img = cv2.imread('dataset/sample_person/sample_face_1.jpg')
    res = rec.recognize_face(img)
    print('Recognition results:', res)
