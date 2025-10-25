# Face Recognition Attendance System

## Quick Start

### 1. Setup Environment
```bash
# Create virtual environment
python -m venv torch_gpu

# Activate (Windows)
torch_gpu\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Configuration
```bash
# Copy env template
cp env.template .env

# Edit .env with your credentials
```

### 3. Initialize Database
```bash
python src/database.py
```

### 4. Run the System

**Option A: Use the startup script (Windows)**
```powershell
.\run_system.ps1
```

**Option B: Manual startup**

Terminal 1 - Backend:
```bash
python src/api_backend.py
```

Terminal 2 - Frontend:
```bash
cd ui
npm install
npm run dev
```

Terminal 3 - Face Recognition:
```bash
python run_video.py
```

## Access Points
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:5000

## Admin Features

1. **Dashboard** - View statistics and system status
2. **Attendance Log** - View and manage attendance records
   - Filter by name or roll number
   - Mark present as absent (delete record)
3. **Add Student** - Add new students
4. **Add Camera** - Add IP camera URLs
5. **Add Dataset** - Upload person images for training
   - Auto-trains after upload
   - Supports video/image files
   - Manual retrain option

## Workflow

1. Add student information
2. Upload photos for the student in Dataset tab
3. System automatically trains the model
4. Add camera IP address
5. Start face recognition with `python run_video.py`
6. View attendance in Attendance Log
7. Manage attendance (mark absent if needed)

## Login Credentials

Use the credentials from your `.env` file. Default examples:
- Email: admin@example.com
- Password: admin123
