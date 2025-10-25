import os
import cv2
import numpy as np
from PIL import Image
_INSIGHT_AVAILABLE = False
_INSIGHT_APP = None
try:
    from insightface.app import FaceAnalysis
    _INSIGHT_AVAILABLE = True
except Exception:
    _INSIGHT_AVAILABLE = False

try:
    from src.utils import load_config, load_faiss_data, get_device
    from src.detector_scrfd import detect_faces
except ImportError:
    try:
        from utils import load_config, load_faiss_data, get_device
        from detector_scrfd import detect_faces
    except ImportError:
        # If running from the project root, add current directory to path
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from utils import load_config, load_faiss_data, get_device
        from detector_scrfd import detect_faces


class FaceRecognizer:
    def __init__(self):
        try:
            print("Step 1: Loading configuration...")
            self.config = load_config()
            if not self.config:
                raise Exception("Failed to load project configuration.")
            print("Configuration loaded")
                
            print("Step 2: Getting device...")
            self.device = get_device(self.config)
            print(f"Device set to: {self.device}")

            print("Step 3: Loading FAISS Index and Labels...")
            # 1. Load FAISS Index and Labels


            self.faiss_index, self.labels = load_faiss_data(self.config)
            if self.faiss_index is None:
                raise Exception("FAISS index not loaded. Run precompute_embeddings.py first.")
            print(f"FAISS index loaded with {len(self.labels)} persons: {self.labels}")

            print("Step 4: Loading SCRFD Face Detector...")
            # 2. Load SCRFD Face Detector (For bounding box on live/new images)
            print(f"   Using SCRFD detector with device: {self.device}")
            print(f"SCRFD Face Detector ready on {self.device}")
            print("Step 5: Configuring DeepFace/Embedding model...")

            # 3. DeepFace Model Configuration (Used for generating the embedding)
            self.embedding_model_name = self.config['RECOGNITION']['EMBEDDING_MODEL']
            self.recognition_threshold = self.config['RECOGNITION']['VERIFICATION_THRESHOLD']
            self.distance_metric = self.config['RECOGNITION']['DISTANCE_METRIC']
            # Initialize insightface FaceAnalysis if available
            self.insight_app = None
            if _INSIGHT_AVAILABLE:
                try:
                    ctx_id = 0 if self.device.startswith('cuda') else -1
                    self.insight_app = FaceAnalysis(name='buffalo_l')
                    self.insight_app.prepare(ctx_id=0 if ctx_id == 0 else -1)
                    print("Using InsightFace (ArcFace) for embeddings")
                except Exception as e:
                    self.insight_app = None
                    print(f"InsightFace init failed, falling back to DeepFace: {e}")
            
            
            print(f"DeepFace Embedding Model: {self.embedding_model_name}")
            print("\nFaceRecognizer initialized successfully!\n")
            
        except Exception as e:
            import traceback
            print(f"\nError during initialization at one of the steps:")
            print(f"   {str(e)}")
            print("\nFull traceback:")
            traceback.print_exc()
            raise


    def recognize_face(self, frame: np.ndarray):

        results = []
        
        # Use SCRFD/YOLO for face detection
        face_boxes = detect_faces(frame, device=self.device)

        # If insightface is available, run it once on the full frame to get embeddings and boxes
        insight_faces = []
        if hasattr(self, 'insight_app') and self.insight_app is not None:
            try:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                insight_faces = self.insight_app.get(rgb_frame)
            except Exception:
                insight_faces = []

        # If no detector boxes and no insight results, try DeepFace on the full frame as a fallback
        if not face_boxes and not insight_faces:
            try:
                from deepface import DeepFace
                import tempfile, uuid
                tmp_path = os.path.join(tempfile.gettempdir(), f"frame_{uuid.uuid4().hex}.jpg")
                cv2.imwrite(tmp_path, frame)
                reps = DeepFace.represent(
                    img_path=tmp_path,
                    model_name=self.embedding_model_name,
                    enforce_detection=False,
                    detector_backend='opencv'
                )
                if reps:
                    emb = np.array(reps[0]['embedding']).astype('float32')
                    # normalize
                    qnorm = np.linalg.norm(emb)
                    if qnorm == 0:
                        qnorm = 1.0
                    emb = (emb / qnorm).astype('float32')
                    k = 1
                    similarities, indices = self.faiss_index.search(emb[np.newaxis, :], k)
                    sim = float(similarities[0][0])
                    best_match_index = int(indices[0][0])
                    person_name = self.labels[best_match_index] if sim >= float(self.recognition_threshold) else 'Unknown'
                    results.append({
                        'box': (0, 0, frame.shape[1], frame.shape[0]),
                        'label': person_name,
                        'score': sim
                    })
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass
                    return results
            except Exception:
                pass

        def _box_iou(a, b):
            # a and b are (x1,y1,x2,y2)
            ax1, ay1, ax2, ay2 = a
            bx1, by1, bx2, by2 = b
            inter_x1 = max(ax1, bx1)
            inter_y1 = max(ay1, by1)
            inter_x2 = min(ax2, bx2)
            inter_y2 = min(ay2, by2)
            if inter_x2 <= inter_x1 or inter_y2 <= inter_y1:
                return 0.0
            inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
            a_area = (ax2 - ax1) * (ay2 - ay1)
            b_area = (bx2 - bx1) * (by2 - by1)
            union = a_area + b_area - inter_area
            return inter_area / union if union > 0 else 0.0

        for box in face_boxes:
            x1, y1, x2, y2 = box
            
            # Add padding to face crop
            padding = 10 
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(frame.shape[1], x2 + padding)
            y2 = min(frame.shape[0], y2 + padding)
            
            # Extract face crop
            face_crop = frame[y1:y2, x1:x2]
            
            # Initialize recognition variables
            person_name = "Unknown"
            min_distance = float('inf')
            
            try:
                # Generate embedding for the face - prefer insightface ArcFace when available
                query_embedding = None
                # Try to match detector box to insightface results (if available)
                if insight_faces:
                    best_idx = None
                    best_iou = 0.0
                    for i, inf in enumerate(insight_faces):
                        # inf.bbox might be (x1,y1,x2,y2) or (x,y,w,h) depending on version
                        try:
                            ib = getattr(inf, 'bbox', None)
                            if ib is None:
                                # Some insightface versions use .kps or .bbox
                                continue
                            ib = list(map(int, ib))
                            # If bbox is (x,y,w,h) convert
                            if len(ib) == 4 and (ib[2] - ib[0] < 0 or ib[3] - ib[1] < 0):
                                # try interpreting as x,y,w,h
                                x_i, y_i, w_i, h_i = ib
                                ib = [x_i, y_i, x_i + w_i, y_i + h_i]
                        except Exception:
                            continue
                        iou = _box_iou((x1, y1, x2, y2), (ib[0], ib[1], ib[2], ib[3]))
                        if iou > best_iou:
                            best_iou = iou
                            best_idx = i
                    # If IoU is reasonable, take that embedding
                    if best_idx is not None and best_iou > 0.2:
                        try:
                            query_embedding = np.array(insight_faces[best_idx].embedding).astype('float32')
                        except Exception:
                            query_embedding = None

                if query_embedding is None:
                    # Lazy-import DeepFace only if insightface did not provide embedding
                    try:
                        from deepface import DeepFace
                        # DeepFace.represent expects a file path or a proper image input.
                        # If we have a numpy array crop, write it to a temporary file first.
                        rep_path = None
                        tmp_created = False
                        try:
                            if isinstance(face_crop, np.ndarray):
                                import tempfile, uuid
                                rep_path = os.path.join(tempfile.gettempdir(), f"face_{uuid.uuid4().hex}.jpg")
                                cv2.imwrite(rep_path, face_crop)
                                tmp_created = True
                            else:
                                rep_path = face_crop

                            representations = DeepFace.represent(
                                img_path=rep_path,
                                model_name=self.embedding_model_name,
                                enforce_detection=False,
                                detector_backend='opencv'
                            )
                            if representations:
                                query_embedding = np.array(representations[0]['embedding']).astype('float32')
                        finally:
                            if tmp_created and rep_path and os.path.exists(rep_path):
                                try:
                                    os.remove(rep_path)
                                except Exception:
                                    pass
                    except Exception:
                        query_embedding = None

                if query_embedding is not None:
                    # Normalize query embedding for cosine similarity
                    try:
                        qnorm = np.linalg.norm(query_embedding)
                        if qnorm == 0:
                            qnorm = 1.0
                        query_embedding = (query_embedding / qnorm).astype('float32')
                    except Exception:
                        pass

                    # Search in FAISS index (Inner Product as similarity)
                    k = 1
                    similarities, indices = self.faiss_index.search(query_embedding[np.newaxis, :], k)

                    sim = float(similarities[0][0])
                    best_match_index = int(indices[0][0])

                    # Check against the verification threshold (higher is better for cosine)
                    if sim >= float(self.recognition_threshold):
                        person_name = self.labels[best_match_index]

            except Exception:
                pass # Keep label as "Unknown"

            results.append({
                'box': (x1, y1, x2 - x1, y2 - y1), # (x, y, w, h) format
                'label': person_name,
                'score': sim if 'sim' in locals() else 0.0
            })
                
        return results


def draw_results(frame, recognition_results):
    for result in recognition_results:
        x, y, w, h = result['box']
        label = result['label']
        score = result.get('score', 0.0)

        color = (0, 255, 0) if label != "Unknown" else (0, 0, 255) # Green for known, Red for unknown
        
        # Draw bounding box
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        
        # Draw label text (similarity score)
        text = f"{label} ({score:.2f})"
        cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
    return frame


if __name__ == "__main__":
    
    try:
        recognizer = FaceRecognizer()
        print("FaceRecognizer initialized successfully!")
        print(f"Loaded {len(recognizer.labels)} persons: {recognizer.labels}")
    except Exception as e:
        print(f"Failed to initialize FaceRecognizer: {e}")
        print("Please ensure:")
        print("  1. Dataset is populated in 'dataset/' folder")
        print("  2. Run 'python src/precompute_embeddings.py' first")
        exit()