@echo off
echo ============================================================
echo   FACE ATTENDANCE SYSTEM - COMPLETE STARTUP
echo ============================================================
echo.

echo Starting all services...
echo.

REM Start Backend API Server
echo [1/4] Starting Backend API Server...
start "Backend API" cmd /k "cd /d %~dp0 && python api_backend.py"
timeout /t 3 /nobreak >nul

REM Start Camera Service
echo [2/4] Starting Camera Service...
start "Camera Service" cmd /k "cd /d %~dp0camera-service && python start_camera_service.py"
timeout /t 3 /nobreak >nul

REM Start Admin Frontend
echo [3/4] Starting Admin Frontend...
start "Admin Frontend" cmd /k "cd /d %~dp0admin-frontend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start User Frontend
echo [4/4] Starting User Frontend...
start "User Frontend" cmd /k "cd /d %~dp0user-frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   ALL SERVICES STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo Services running on:
echo   Backend API:     http://localhost:5000
echo   Admin Frontend:  http://localhost:3000
echo   User Frontend:   http://localhost:3001
echo   Camera Service:  Background processing
echo.
echo Login Credentials:
echo   Admin:  admin / admin123
echo   Student: CS001 / student123
echo.
echo Press any key to exit...
pause >nul
