
"""Face detector wrapper with multiple backends.

This module exposes `detect_faces(image, device='cpu')` and will try the
following in order:
 1. InsightFace / SCRFD (if available and model file provided)
 2. YOLOv8 face model (if `ultralytics` is installed and model file present)
 3. OpenCV Haar Cascade fallback (fast but less accurate)

The function accepts a BGR numpy image (as returned by OpenCV) or a path to
an image file and returns a list of bounding boxes in (x1, y1, x2, y2) format.
"""

from typing import List, Tuple, Union
import cv2
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
_LOG = logging.getLogger("detector")


def _load_haar_detector():
	haar_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
	if os.path.exists(haar_path):
		return cv2.CascadeClassifier(haar_path)
	return None


_HAAR_DETECTOR = _load_haar_detector()


# Try to import Ultralytics YOLO (for yolov8n-face.pt)
_YOLO_AVAILABLE = False
_YOLO_MODEL = None
try:
	from ultralytics import YOLO
	_YOLO_AVAILABLE = True
except Exception:
	_YOLO_AVAILABLE = False


def _try_load_yolo_model(model_path: str):
	global _YOLO_MODEL
	if not _YOLO_AVAILABLE:
		return False
	try:
		if os.path.exists(model_path):
			_LOG.info(f"Loading YOLO model from: {model_path}")
			_YOLO_MODEL = YOLO(model_path)
			return True
	except Exception as e:
		_LOG.warning(f"Failed to load YOLO model: {e}")
	return False


# Try to import insightface detector (optional)
_INSIGHT_AVAILABLE = False
_INSIGHT_DET = None
try:
	import insightface
	from insightface import model_zoo
	_INSIGHT_AVAILABLE = True
except Exception:
	_INSIGHT_AVAILABLE = False


def _try_load_scrfd(model_path: str, device: str = 'cpu'):
	global _INSIGHT_DET
	if not _INSIGHT_AVAILABLE:
		return False
	try:
		# If an onnx model path is provided, insightface can load it via model_zoo
		if os.path.exists(model_path):
			_LOG.info(f"Loading SCRFD from: {model_path}")
			# insightface model_zoo can load by path
			_INSIGHT_DET = model_zoo.get_model(model_path)
			# prepare may be required depending on the model type
			try:
				ctx_id = 0 if device.startswith('cuda') else -1
				_INSIGHT_DET.prepare(ctx_id=ctx_id)
			except Exception:
				pass
			return True
	except Exception as e:
		_LOG.warning(f"Failed to load SCRFD via insightface: {e}")
	return False


def _ensure_models_loaded():
	"""Attempt to find and load available detector models in the repo models/ folder."""
	repo_models = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
	yolo_path = os.path.join(repo_models, 'yolov8n-face.pt')
	scrfd_path = os.path.join(repo_models, 'scrfd_500m.onnx')

	# Prefer SCRFD if insightface available and model present
	if scrfd_path and os.path.exists(scrfd_path) and _INSIGHT_AVAILABLE and _INSIGHT_DET is None:
		_try_load_scrfd(scrfd_path)

	# Try YOLO if available and model present
	if yolo_path and os.path.exists(yolo_path) and _YOLO_MODEL is None:
		_try_load_yolo_model(yolo_path)


def detect_faces(image: Union[np.ndarray, str], device: str = 'cpu') -> List[Tuple[int, int, int, int]]:
	"""Detect faces in an image and return bounding boxes.

	Returns a list of (x1, y1, x2, y2).
	"""
	# Load image if a path was provided
	if isinstance(image, str):
		img = cv2.imread(image)
		if img is None:
			_LOG.error(f"Could not load image from path: {image}")
			return []
	else:
		img = image

	if img is None or not hasattr(img, 'shape'):
		_LOG.error("Input image is invalid or not a numpy array.")
		return []

	_ensure_models_loaded()

	h, w = img.shape[:2]

	# 1) Try insightface SCRFD if loaded
	if _INSIGHT_AVAILABLE and _INSIGHT_DET is not None:
		try:
			rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
			dets = _INSIGHT_DET.detect(rgb)
			boxes = []
			for det in dets:
				if isinstance(det, (list, tuple)) and len(det) >= 4:
					x1, y1, x2, y2 = map(int, det[:4])
				elif hasattr(det, 'bbox'):
					x1, y1, x2, y2 = map(int, det.bbox)
				else:
					continue
				boxes.append((max(0, x1), max(0, y1), min(w, x2), min(h, y2)))
			if boxes:
				_LOG.info(f"SCRFD detected {len(boxes)} face(s)")
				return boxes
		except Exception as e:
			_LOG.warning(f"SCRFD detection failed: {e}")

	# 2) Try YOLOv8 if loaded
	if _YOLO_AVAILABLE and _YOLO_MODEL is not None:
		try:
			results = _YOLO_MODEL(img)
			boxes = []
			for r in results:
				xyxy = r.boxes.xyxy.cpu().numpy() if hasattr(r, 'boxes') else None
				if xyxy is None:
					continue
				for box in xyxy:
					x1, y1, x2, y2 = map(int, box[:4])
					boxes.append((max(0, x1), max(0, y1), min(w, x2), min(h, y2)))
			if boxes:
				_LOG.info(f"YOLOv8 detected {len(boxes)} face(s)")
				return boxes
		except Exception as e:
			_LOG.warning(f"YOLO detection failed: {e}")

	# 3) Fallback: Haar Cascade (less accurate)
	gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

	boxes = []
	if _HAAR_DETECTOR is not None:
		faces = _HAAR_DETECTOR.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=4, minSize=(40, 40))
		for (x, y, bw, bh) in faces:
			boxes.append((int(x), int(y), int(x + bw), int(y + bh)))
		if boxes:
			_LOG.info(f"Haar Cascade detected {len(boxes)} face(s)")
		else:
			_LOG.warning("Haar Cascade did not detect any faces.")
	else:
		try:
			proto = os.path.join(cv2.data.haarcascades, '..', 'deploy.prototxt')
			model = os.path.join(cv2.data.haarcascades, '..', 'res10_300x300_ssd_iter_140000.caffemodel')
			if os.path.exists(proto) and os.path.exists(model):
				net = cv2.dnn.readNetFromCaffe(proto, model)
				blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 1.0,
											 (300, 300), (104.0, 177.0, 123.0))
				net.setInput(blob)
				detections = net.forward()
				for i in range(0, detections.shape[2]):
					confidence = detections[0, 0, i, 2]
					if confidence > 0.5:
						box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
						(startX, startY, endX, endY) = box.astype("int")
						boxes.append((int(startX), int(startY), int(endX), int(endY)))
				if boxes:
					_LOG.info(f"DNN face detector found {len(boxes)} face(s)")
				else:
					_LOG.warning("DNN face detector did not detect any faces.")
		except Exception as e:
			_LOG.error(f"OpenCV DNN face detector failed: {e}")

	if not boxes:
		_LOG.error("No faces detected. Please check model files and input image quality.")
	return boxes


if __name__ == '__main__':
	# Quick local test: load an example image path if provided as argv
	import sys
	if len(sys.argv) > 1:
		img_path = sys.argv[1]
		bboxes = detect_faces(img_path)
		print(f"Detected boxes: {bboxes}")
