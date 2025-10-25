# Face Attendance System - Complete Setup

A comprehensive face recognition attendance system with separate admin and user interfaces, background camera processing, and real-time face recognition.

## 🏗️ Architecture

```
face_reg_copy/
├── admin-frontend/          # Admin dashboard (React) - Port 3000
├── user-frontend/           # User portal (React) - Port 3001  
├── camera-service/          # Background camera processing
├── backend-api/            # Flask API server - Port 5000
├── dataset/                # Student images/videos
├── models/                 # Trained models
└── embeddings/             # FAISS index files
```

## 🚀 Quick Start

### Option 1: Start All Services (Recommended)
```bash
# Run the complete startup script
START_ALL_SERVICES.bat
```

This will start:
- Backend API Server (Port 5000)
- Camera Service (Background)
- Admin Frontend (Port 3000)
- User Frontend (Port 3001)

### Option 2: Manual Startup

#### 1. Start Backend API
```bash
python api_backend.py
```

#### 2. Start Camera Service
```bash
cd camera-service
python start_camera_service.py
```

#### 3. Start Admin Frontend
```bash
cd admin-frontend
npm install
npm run dev
```

#### 4. Start User Frontend
```bash
cd user-frontend
npm install
npm run dev
```

## 🔐 Login Credentials

### Admin Portal (http://localhost:3000)
- **Username:** `admin`
- **Password:** `admin123`

### Student Portal (http://localhost:3001)
- **Roll Number:** `CS001`
- **Password:** `student123`

## 📱 Features

### Admin Portal Features:
- **Dashboard**: Overview with metrics and charts
- **Training Center**: Add students with video/image upload and train models
- **Attendance Log**: View and manually override attendance records
- **Camera Management**: Add/remove cameras and monitor status
- **Student Management**: Manage student information

### Student Portal Features:
- **My Attendance**: View personal attendance records and statistics
- **My Profile**: Manage personal information
- **Export Data**: Download attendance records as CSV

### Background Camera Service:
- **Real-time Processing**: Continuous face recognition from multiple cameras
- **Multi-camera Support**: Process multiple camera streams simultaneously
- **Automatic Recognition**: Detects faces and marks attendance automatically
- **API Integration**: Sends recognition results to backend API

## 🎯 Workflow

### Adding New Students:
1. **Admin Portal** → **Training Center**
2. **Fill Form**: Name, Roll Number, Email, Department, Year
3. **Upload Media**: 5-10 photos or videos of the student
4. **Click Train**: System processes media and trains face recognition model
5. **Automatic Recognition**: Student is now recognized by cameras

### Camera Management:
1. **Admin Portal** → **Add Camera**
2. **Configure**: Camera name, URL/RTSP stream, credentials
3. **Test Connection**: Verify camera is accessible
4. **Start Processing**: Camera begins background face recognition
5. **Monitor**: View camera status and recognition results

### Attendance Management:
1. **Automatic**: Cameras detect faces and mark attendance
2. **Manual Override**: Admin can change Present/Absent status
3. **Student View**: Students can view their attendance records
4. **Export**: Download attendance data as CSV

## 🔧 Configuration

### Camera Sources (config.yaml):
```yaml
CAMERA_SOURCES:
- name: Webcam
  source: 0
- name: IP Camera
  source: rtsp://192.168.1.100:554/stream
- name: HTTP Stream
  source: http://192.168.1.100:8080/video
```

### Recognition Settings:
```yaml
RECOGNITION:
  EMBEDDING_MODEL: VGG-Face
  DISTANCE_METRIC: cosine
  VERIFICATION_THRESHOLD: 0.68
```

## 📊 API Endpoints

### Backend API (Port 5000):
- `GET /api/dashboard/summary` - Dashboard metrics
- `GET /api/attendance` - Attendance records
- `POST /api/attendance/manual` - Manual attendance override
- `POST /api/students` - Add new student
- `POST /api/train` - Train face recognition model
- `GET /api/cameras` - List cameras
- `POST /api/cameras` - Add new camera
- `POST /api/attendance/recognize` - Receive recognition results

## 🛠️ Development

### Prerequisites:
- Python 3.8+
- Node.js 16+
- OpenCV
- FAISS
- DeepFace
- React 18

### Dependencies:
```bash
# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd admin-frontend && npm install
cd user-frontend && npm install
```

## 📁 File Structure

### Admin Frontend:
- `src/pages/admin/Dashboard.jsx` - Main dashboard
- `src/pages/admin/TrainingCenter.jsx` - Student training interface
- `src/pages/admin/AttendanceLog.jsx` - Attendance management
- `src/pages/admin/AddCamera.jsx` - Camera configuration
- `src/pages/admin/CamerasList.jsx` - Camera monitoring

### User Frontend:
- `src/pages/user/UserAttendance.jsx` - Student attendance view
- `src/pages/user/UserProfile.jsx` - Student profile management

### Camera Service:
- `camera_service.py` - Main camera processing service
- `start_camera_service.py` - Service startup script

## 🔍 Troubleshooting

### Common Issues:

1. **Camera not detected**: Check camera permissions and drivers
2. **Face recognition not working**: Ensure FAISS index is created
3. **Frontend not loading**: Check if ports 3000/3001 are available
4. **API errors**: Verify backend is running on port 5000

### Logs:
- Camera Service: `camera-service/camera-service.log`
- Backend API: Console output
- Frontend: Browser console

## 🚀 Production Deployment

### Docker Support:
```bash
# Build and run with Docker
docker-compose up -d
```

### Environment Variables:
```bash
# Backend
export FLASK_ENV=production
export DATABASE_URL=sqlite:///attendance.db

# Frontend
export VITE_API_URL=http://localhost:5000
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the logs for error details
