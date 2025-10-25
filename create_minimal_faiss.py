#!/usr/bin/env python3
"""
Create a minimal FAISS index for testing the face recognition system.
"""

import os
import numpy as np
import faiss
import pickle

def create_minimal_faiss_index():
    """Create a minimal FAISS index for testing."""
    
    # Create embeddings directory
    embeddings_dir = "embeddings"
    os.makedirs(embeddings_dir, exist_ok=True)
    
    print("Creating minimal FAISS index for testing...")
    
    # Create a dummy embedding (VGG-Face embeddings are typically 4096 dimensions)
    embedding_dim = 4096
    num_persons = 1  # sample_person
    
    # Create dummy embeddings
    dummy_embeddings = np.random.rand(num_persons, embedding_dim).astype('float32')
    
    # Create FAISS index
    faiss_index = faiss.IndexFlatL2(embedding_dim)
    faiss_index.add(dummy_embeddings)
    
    # Create labels
    labels = ["sample_person"]
    
    # Save FAISS index
    faiss_index_path = os.path.join(embeddings_dir, "faiss_index.bin")
    faiss.write_index(faiss_index, faiss_index_path)
    
    # Save labels
    labels_path = os.path.join(embeddings_dir, "labels.pkl")
    with open(labels_path, 'wb') as f:
        pickle.dump(labels, f)
    
    print(f"FAISS index created: {faiss_index_path}")
    print(f"Labels saved: {labels_path}")
    print("You can now run the face recognition system!")

if __name__ == "__main__":
    create_minimal_faiss_index()
