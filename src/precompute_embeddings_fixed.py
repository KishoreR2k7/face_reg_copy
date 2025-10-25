import os
import numpy as np
import faiss
from tqdm import tqdm
from PIL import Image
from deepface import DeepFace
from utils import load_config, save_faiss_data, get_device

# Optional: use insightface (ArcFace) for embeddings when available
_INSIGHT_AVAILABLE = False
_INSIGHT_APP = None
try:
    from insightface.app import FaceAnalysis
    _INSIGHT_AVAILABLE = True
except Exception:
    _INSIGHT_AVAILABLE = False

def get_face_embedding(image_path, embedding_model):
    """Get face embedding using DeepFace (more reliable for detection)."""
    try:
        representations = DeepFace.represent(
            img_path=image_path,
            model_name=embedding_model,
            enforce_detection=False,
            detector_backend='opencv',
        )
        if representations and len(representations) > 0:
            return np.array(representations[0]['embedding']).astype('float32')
    except Exception as e:
        print(f"Error getting embedding for {image_path}: {e}")
    return None

def precompute_embeddings():
    config = load_config()
    if not config:
        return

    dataset_dir = config['PATHS']['DATASET_DIR']
    embedding_model = config['RECOGNITION']['EMBEDDING_MODEL']
    
    print(f"Using DeepFace with model: {embedding_model} for consistent embeddings...")
    device = get_device(config)

    all_embeddings = []
    all_labels = []
    
    person_folders = [f.name for f in os.scandir(dataset_dir) if f.is_dir()]
    
    if not person_folders:
        print(f"No person folders found in {dataset_dir}. Check your folder structure.")
        return

    print(f"Found {len(person_folders)} persons to process.")

    for person_name in tqdm(person_folders, desc="Generating Embeddings"):
        person_dir = os.path.join(dataset_dir, person_name)
        image_files = [f for f in os.listdir(person_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]

        if not image_files:
            print(f"Warning: No images found for {person_name}. Skipping.")
            continue

        person_embeddings = []
        
        for image_name in image_files:
            image_path = os.path.join(person_dir, image_name)
            embedding = get_face_embedding(image_path, embedding_model)
            if embedding is not None:
                person_embeddings.append(embedding)

        if person_embeddings:
            # Convert list to numpy array
            person_embeddings = np.array(person_embeddings)
            if len(person_embeddings.shape) == 2:
                mean_embedding = np.mean(person_embeddings, axis=0)
                print(f"Added embeddings for {person_name} - Shape: {person_embeddings.shape}")
                all_embeddings.append(mean_embedding)
                all_labels.append(person_name)
            else:
                print(f"Skipping {person_name} - Invalid embeddings shape: {person_embeddings.shape}")

    if not all_embeddings:
        print("No embeddings were generated. FAISS index not created.")
        return

    embeddings_matrix = np.array(all_embeddings).astype('float32')
    dimension = embeddings_matrix.shape[1]

    # Normalize embeddings (L2) for cosine similarity
    norms = np.linalg.norm(embeddings_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings_matrix = embeddings_matrix / norms

    print(f"Creating FAISS Index (Dimension: {dimension}) using Inner Product (cosine similarity)...")
    faiss_index = faiss.IndexFlatIP(dimension)
    faiss_index.add(embeddings_matrix)
    print(f"Total embeddings added to FAISS: {faiss_index.ntotal}")
    
    save_faiss_data(faiss_index, all_labels, config)
    print(f"Labels saved: {all_labels}")


if __name__ == "__main__":
    precompute_embeddings()