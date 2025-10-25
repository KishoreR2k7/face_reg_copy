#!/usr/bin/env python3
"""Quick test for the face detector backends.

Usage:
  python scripts\test_detector.py [path_to_image]

If no image is provided, the script will try 'dataset/sample_person/sample_face_1.jpg'
and prints detected boxes and saves an annotated image to 'scripts/output.jpg'.
"""
import sys
import os
from pathlib import Path
import cv2

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.detector_scrfd import detect_faces


def draw_boxes(img, boxes):
    out = img.copy()
    for (x1, y1, x2, y2) in boxes:
        cv2.rectangle(out, (x1, y1), (x2, y2), (0, 255, 0), 2)
    return out


def main():
    img_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join('dataset', 'sample_person', 'sample_face_1.jpg')
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        return 1

    img = cv2.imread(img_path)
    if img is None:
        print("Failed to read image")
        return 1

    boxes = detect_faces(img)
    print(f"Detected {len(boxes)} boxes: {boxes}")

    out = draw_boxes(img, boxes)
    out_path = os.path.join('scripts', 'output.jpg')
    cv2.imwrite(out_path, out)
    print(f"Annotated image saved to: {out_path}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
