#!/usr/bin/env python3
"""Quick test for the full recognition pipeline (detection + embedding + FAISS search).

Usage:
  python scripts\test_recognizer.py [path_to_image]

Outputs detections and recognition results.
"""
import sys
from pathlib import Path
import cv2

ROOT = Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0, str(ROOT))

from src.recognize_faces import FaceRecognizer, draw_results


def main():
    img_path = sys.argv[1] if len(sys.argv) > 1 else None
    if img_path is None:
        # try a sample from dataset
        img_path = str(Path('dataset').glob('**/*.*').__iter__().__next__())

    img = cv2.imread(img_path)
    if img is None:
        print(f"Cannot read image: {img_path}")
        return 1

    recognizer = FaceRecognizer()
    results = recognizer.recognize_face(img)
    print(f"Recognition results: {results}")

    annotated = draw_results(img, results)
    out_path = Path('scripts') / 'recognizer_output.jpg'
    cv2.imwrite(str(out_path), annotated)
    print(f"Annotated saved to: {out_path}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
