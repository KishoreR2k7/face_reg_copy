# Face Recognition Attendance System - Startup Script
# Run this script to start the complete system

Write-Host "Starting Face Recognition Attendance System..." -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "torch_gpu")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv torch_gpu
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\torch_gpu\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
python src/database.py

# Start backend API
Write-Host "Starting backend API on http://127.0.0.1:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\torch_gpu\Scripts\Activate.ps1; python src/api_backend.py"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location ui
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Set-Location ..

Write-Host "`nSystem started!" -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nTo start face recognition, run:" -ForegroundColor Yellow
Write-Host "python run_video.py" -ForegroundColor White
