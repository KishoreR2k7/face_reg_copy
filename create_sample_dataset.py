#!/usr/bin/env python3
"""
Create a sample dataset for testing the face recognition system.
"""

import cv2
import numpy as np
import os

def create_sample_dataset():
    """Create a simple sample dataset for testing."""
    
    # Create dataset directory
    dataset_dir = "dataset"
    sample_person_dir = os.path.join(dataset_dir, "sample_person")
    os.makedirs(sample_person_dir, exist_ok=True)
    
    print("Creating sample dataset...")
    
    # Create a simple face-like image
    def create_face_image(width=200, height=200):
        # Create a white background
        img = np.ones((height, width, 3), dtype=np.uint8) * 255
        
        # Draw a simple face
        # Face outline (oval)
        cv2.ellipse(img, (width//2, height//2), (width//3, height//3), 0, 0, 360, (200, 200, 200), -1)
        
        # Eyes
        cv2.circle(img, (width//2 - 30, height//2 - 20), 8, (0, 0, 0), -1)
        cv2.circle(img, (width//2 + 30, height//2 - 20), 8, (0, 0, 0), -1)
        
        # Nose
        cv2.circle(img, (width//2, height//2 + 5), 5, (150, 150, 150), -1)
        
        # Mouth
        cv2.ellipse(img, (width//2, height//2 + 30), (20, 10), 0, 0, 180, (0, 0, 0), 2)
        
        return img
    
    # Create multiple sample images
    for i in range(3):
        img = create_face_image()
        filename = f"sample_face_{i+1}.jpg"
        filepath = os.path.join(sample_person_dir, filename)
        cv2.imwrite(filepath, img)
        print(f"Created: {filepath}")
    
    print(f"Sample dataset created in {sample_person_dir}")
    print("You can now run: python src/precompute_embeddings.py")

if __name__ == "__main__":
    create_sample_dataset()
