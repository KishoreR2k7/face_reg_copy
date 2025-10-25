# SCRFD Face Detection Implementation

This document describes the implementation of SCRFD (Selective Convolutional Response Feature Detection) face detection to replace YOLO in the face recognition attendance system.

## Overview

The system has been updated to use SCRFD for face detection instead of YOLO, providing:
- More accurate face detection
- Better performance on various face orientations
- Reduced dependencies
- Admin interface for dataset management with immediate training

## Key Changes

### 1. Face Detection Engine
- **Replaced**: YOLOv8 face detection
- **With**: SCRFD face detection using InsightFace
- **Benefits**: Better accuracy, faster inference, smaller model size

### 2. Dependencies Updated
```bash
# Removed
ultralytics==8.3.25

# Added
insightface==0.7.3
onnxruntime==1.16.3
```

### 3. Configuration Changes
- Updated `config.yaml` to use SCRFD model path
- Removed YOLO model references
- Added SCRFD-specific configuration

### 4. Admin Interface Enhancements
- New "Manage Dataset" page in the admin interface
- Upload multiple images for a person
- Automatic model retraining after dataset changes
- Delete persons from dataset
- Manual retrain option

## File Structure

```
src/
├── detector_scrfd.py          # SCRFD face detection implementation
├── recognize_faces.py         # Updated to use SCRFD instead of YOLO
├── api_backend.py            # Enhanced with dataset management APIs
└── precompute_embeddings.py  # Unchanged, still used for training

ui/
├── pages/
│   └── ManageDatasetPage.tsx  # New admin page for dataset management
├── types.ts                  # Updated with DatasetPerson interface
├── App.tsx                   # Updated routing
└── components/
    └── Sidebar.tsx           # Updated with dataset management link
```

## API Endpoints

### Dataset Management
- `POST /dataset/upload` - Upload images for a person (with automatic training)
- `GET /dataset/list` - List all persons in dataset
- `DELETE /dataset/<person_name>` - Delete a person and retrain
- `POST /dataset/train` - Manual model retraining

### Authentication
All dataset management endpoints require authentication via JWT token.

## Usage Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Test SCRFD Implementation
```bash
python test_scrfd.py
```

### 3. Start the System
```bash
# Backend
python src/api_backend.py

# Frontend (in another terminal)
cd ui
npm install
npm run dev
```

### 4. Admin Dataset Management
1. Navigate to "Manage Dataset" in the admin interface
2. Add new person with multiple images
3. System automatically retrains the model
4. View all persons in dataset
5. Delete persons if needed
6. Manual retrain option available

## Technical Details

### SCRFD Implementation
- Uses InsightFace's FaceAnalysis with SCRFD models
- Supports both CPU and GPU inference
- Automatic fallback to CPU if GPU fails
- Configurable detection size (640x640 by default)

### Face Recognition Pipeline
1. **Face Detection**: SCRFD detects faces in the frame
2. **Face Cropping**: Extract face regions with padding
3. **Embedding Generation**: DeepFace generates face embeddings
4. **Similarity Search**: FAISS searches for similar embeddings
5. **Recognition**: Match against threshold for identification

### Dataset Structure
```
dataset/
├── person1/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── person2/
│   ├── image1.jpg
│   └── ...
└── ...
```

## Performance Considerations

### SCRFD vs YOLO
- **Accuracy**: SCRFD typically provides better face detection accuracy
- **Speed**: Faster inference on CPU, comparable on GPU
- **Model Size**: Smaller model footprint
- **Memory**: Lower memory usage

### Training Process
- Automatic retraining after dataset changes
- Uses mean embedding for each person
- FAISS index rebuilt on each training
- Supports incremental updates

## Troubleshooting

### Common Issues

1. **ImportError: insightface not found**
   ```bash
   pip install insightface onnxruntime
   ```

2. **CUDA/GPU Issues**
   - System automatically falls back to CPU
   - Check CUDA installation if GPU is preferred

3. **Training Failures**
   - Check dataset structure
   - Ensure images contain detectable faces
   - Verify file permissions

### Testing
Run the test script to verify implementation:
```bash
python test_scrfd.py
```

## Migration from YOLO

The system has been designed for seamless migration:
1. All existing datasets remain compatible
2. API endpoints maintain backward compatibility
3. Frontend interface enhanced with new features
4. Configuration automatically updated

## Future Enhancements

- Support for more face detection models
- Batch processing capabilities
- Advanced dataset augmentation
- Real-time performance monitoring
- Cloud storage integration

## Support

For issues or questions regarding the SCRFD implementation:
1. Check the test script output
2. Verify all dependencies are installed
3. Review the configuration files
4. Check the system logs for detailed error messages
