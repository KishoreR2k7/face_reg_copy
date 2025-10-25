import numpy as np
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.utils import load_config, load_faiss_data
from deepface import DeepFace
import cv2

config = load_config()
index, labels = load_faiss_data(config)
img_path = 'dataset/sample_person/sample_face_1.jpg'
print('Computing embedding for', img_path)
rep = DeepFace.represent(img_path=img_path, model_name=config['RECOGNITION']['EMBEDDING_MODEL'], enforce_detection=False, detector_backend='opencv')
if rep:
    emb = np.array(rep[0]['embedding']).astype('float32')
    # normalize
    q = emb / (np.linalg.norm(emb) if np.linalg.norm(emb)!=0 else 1.0)
    D, I = index.search(q[np.newaxis,:], 3)
    print('Distances(similarities):', D)
    print('Indices:', I)
    for i, idx in enumerate(I[0]):
        print(i, 'label:', labels[idx], 'score:', float(D[0][i]))
else:
    print('No representation')
