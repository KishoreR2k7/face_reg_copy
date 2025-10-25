import os
import numpy as np
import faiss
from tqdm import tqdm
from PIL import Image
# DeepFace will be imported lazily if needed to avoid TensorFlow import errors
# from deepface import DeepFace

from utils import load_config, save_faiss_data, get_device

# Optional: use insightface (ArcFace) for embeddings when available
_INSIGHT_AVAILABLE = False
_INSIGHT_APP = None
try:
    from insightface.app import FaceAnalysis
    _INSIGHT_AVAILABLE = True
except Exception:
    _INSIGHT_AVAILABLE = False


def precompute_embeddings():
    config = load_config()
    if not config:
        return

    dataset_dir = config['PATHS']['DATASET_DIR']
    embedding_model = config['RECOGNITION']['EMBEDDING_MODEL']
    
    
    print(f"Initializing DeepFace with model: {embedding_model}...")

    device = get_device(config)

    # Initialize insightface FaceAnalysis if available
    global _INSIGHT_APP
    if _INSIGHT_AVAILABLE and _INSIGHT_APP is None:
        try:
            ctx_id = 0 if device.startswith('cuda') else -1
            # Use a compact recognition model; FaceAnalysis will download if missing
            _INSIGHT_APP = FaceAnalysis(name='buffalo_l')
            _INSIGHT_APP.prepare(ctx_id=ctx_id)
            print("InsightFace (ArcFace) initialized for embeddings.")
        except Exception as e:
            print(f"InsightFace init failed, will fallback to DeepFace: {e}")
            _INSIGHT_APP = None

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
            try:
                # Prefer insightface ArcFace embeddings when available
                embedding = None
                if _INSIGHT_APP is not None:
                    try:
                        img = Image.open(image_path).convert('RGB')
                        img_np = np.array(img)  # RGB
                        faces = _INSIGHT_APP.get(img_np)
                        if faces:
                            emb = faces[0].embedding
                            embedding = np.array(emb)
                        else:
                            # If insightface doesn't detect a face, try DeepFace as fallback
                            print(f"InsightFace did not detect a face in {image_path}; trying DeepFace fallback...")
                            try:
                                from deepface import DeepFace
                                representations = DeepFace.represent(
                                    img_path=image_path,
                                    model_name=embedding_model,
                                    enforce_detection=False,
                                    detector_backend='opencv',
                                )
                                if representations:
                                    embedding = np.array(representations[0]['embedding'])
                                else:
                                    embedding = None
                            except Exception as e:
                                print(f"DeepFace fallback failed: {e}")
                                embedding = None
                    except Exception as e:
                        print(f"InsightFace error on {image_path}: {e}")
                        embedding = None
                else:
                    # If insightface is not available, fallback to DeepFace for embeddings
                    try:
                        from deepface import DeepFace
                        representations = DeepFace.represent(
                            img_path=image_path,
                            model_name=embedding_model,
                            enforce_detection=False,
                            detector_backend='opencv',
                        )
                        if representations:
                            embedding = np.array(representations[0]['embedding'])
                    except Exception as e:
                        print(f"DeepFace represent failed: {e}")
                        embedding = None

                if embedding is not None:
                    person_embeddings.append(embedding)
                else:
                    print(f"Could not detect face in {image_path}. Skipping.")

            except Exception as e:
                print(f"Error processing {image_path}: {e}")
                continue
        
            if person_embeddings:
                # Convert list to numpy array and ensure all embeddings have same shape
                person_embeddings = np.array(person_embeddings)
                if len(person_embeddings.shape) == 2:  # Valid embeddings array
                    mean_embedding = np.mean(person_embeddings, axis=0)
                    all_embeddings.append(mean_embedding)
                    all_labels.append(person_name)
                    print(f"Added embeddings for {person_name} - Shape: {person_embeddings.shape}")
                else:
                    print(f"Skipping {person_name} - Invalid embeddings shape: {person_embeddings.shape}")
    
    if not all_embeddings:
        print("No embeddings were generated. FAISS index not created.")
        return

    embeddings_matrix = np.array(all_embeddings).astype('float32')
    dimension = embeddings_matrix.shape[1]
    
    
    
    # Normalize embeddings (L2) for cosine similarity (ArcFace style)
    norms = np.linalg.norm(embeddings_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings_matrix = embeddings_matrix / norms

    print(f"Creating FAISS Index (Dimension: {dimension}) using Inner Product (cosine similarity)...")
    faiss_index = faiss.IndexFlatIP(dimension)

    faiss_index.add(embeddings_matrix)
    print(f"Total embeddings added to FAISS: {faiss_index.ntotal}")

    
    save_faiss_data(faiss_index, all_labels, config)


if __name__ == "__main__":
    precompute_embeddings()