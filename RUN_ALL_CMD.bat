@echo off
echo ============================================================
echo    Face Recognition System - Starting All Components
echo ============================================================
echo.

REM Activate conda environment
call conda activate face_reg

REM Set environment variable for OpenMP
set KMP_DUPLICATE_LIB_OK=TRUE

echo Starting 3 components in separate windows...
echo.

REM Start Backend API in new window
echo [1/3] Launching Backend API...
start "Backend API - Port 5000" cmd /k "conda activate face_reg && cd /d %~dp0 && echo ============================================================ && echo    BACKEND API SERVER && echo ============================================================ && echo. && echo Running at: http://localhost:5000 && echo Press Ctrl+C to stop && echo. && python src\api_backend.py"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Face Recognition in new window
echo [2/3] Launching Face Recognition...
start "Face Recognition" cmd /k "conda activate face_reg && cd /d %~dp0 && set KMP_DUPLICATE_LIB_OK=TRUE && echo ============================================================ && echo    FACE RECOGNITION SYSTEM && echo ============================================================ && echo. && echo Webcam will open shortly... && echo Press Q in video window to stop && echo. && python run_video.py"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Frontend in new window
echo [3/3] Launching Frontend Dashboard...
start "Frontend Dashboard - Port 5173" cmd /k "cd /d %~dp0ui && echo ============================================================ && echo    FRONTEND DASHBOARD && echo ============================================================ && echo. && echo Dashboard at: http://localhost:5173 && echo Press Ctrl+C to stop && echo. && echo Login: admin@facerecognition.com / Admin@123 && echo. && npm run dev"

echo.
echo ============================================================
echo    All Components Started!
echo ============================================================
echo.
echo 3 new windows opened:
echo   1. Backend API       -^> http://localhost:5000
echo   2. Face Recognition  -^> Webcam window (press Q to quit)
echo   3. Frontend Dashboard-^> http://localhost:5173
echo.
echo Login to Frontend:
echo   Email: admin@facerecognition.com
echo   Password: Admin@123
echo.
echo To stop: Close each window or press Ctrl+C in each
echo.
pause
