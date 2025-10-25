# ============================================================
# Face Recognition Project - Run ALL Components
# Launches Backend, Frontend, and Face Recognition in 3 windows
# ============================================================

$ErrorActionPreference = 'Continue'
$ProjectRoot = $PSScriptRoot

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   Face Recognition System - Starting All Components" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Set environment variable for OpenMP
$env:KMP_DUPLICATE_LIB_OK = "TRUE"

Write-Host "Starting 3 components in separate windows..." -ForegroundColor Yellow
Write-Host ""

# ============================================================
# TERMINAL 1: Backend API (Flask)
# ============================================================
Write-Host "[1/3] Launching Backend API..." -ForegroundColor Green
$backendScript = @"
`$host.UI.RawUI.WindowTitle = 'Backend API - Port 5000'
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host '   BACKEND API SERVER' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Activating conda environment...' -ForegroundColor Yellow
& conda activate face_reg 2>`$null
if (`$LASTEXITCODE -ne 0) {
    Write-Host 'ERROR: Could not activate conda environment' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit
}
Write-Host 'Running at: http://localhost:5000' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow
Write-Host ''
cd '$ProjectRoot'
& python src\api_backend.py
Read-Host 'Press Enter to close this window'
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Start-Sleep -Seconds 2

# ============================================================
# TERMINAL 2: Face Recognition (Video Stream)
# ============================================================
Write-Host "[2/3] Launching Face Recognition..." -ForegroundColor Green
$videoScript = @"
`$host.UI.RawUI.WindowTitle = 'Face Recognition - Video Stream'
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host '   FACE RECOGNITION SYSTEM' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Activating conda environment...' -ForegroundColor Yellow
& conda activate face_reg 2>`$null
if (`$LASTEXITCODE -ne 0) {
    Write-Host 'ERROR: Could not activate conda environment' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit
}
Write-Host 'Webcam will open shortly...' -ForegroundColor Green
Write-Host 'Press Q in the video window to stop' -ForegroundColor Yellow
Write-Host ''
cd '$ProjectRoot'
`$env:KMP_DUPLICATE_LIB_OK = 'TRUE'
& python run_video.py
Read-Host 'Press Enter to close this window'
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $videoScript

Start-Sleep -Seconds 2

# ============================================================
# TERMINAL 3: Frontend (React Dashboard)
# ============================================================
Write-Host "[3/3] Checking Frontend..." -ForegroundColor Green

# Check if Node.js is installed
$nodeInstalled = $false
try {
    $null = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $nodeInstalled = $true
    }
} catch {
    $nodeInstalled = $false
}

if ($nodeInstalled) {
    Write-Host "  Launching Frontend Dashboard..." -ForegroundColor Green
    $frontendScript = @"
`$host.UI.RawUI.WindowTitle = 'Frontend Dashboard - Port 5173'
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host '   FRONTEND DASHBOARD' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Dashboard will open at: http://localhost:5173' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Login Credentials:' -ForegroundColor White
Write-Host '  Email: admin@facerecognition.com' -ForegroundColor Cyan
Write-Host '  Password: Admin@123' -ForegroundColor Cyan
Write-Host ''
cd '$ProjectRoot\ui'
npm run dev
Read-Host 'Press Enter to close this window'
"@
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
} else {
    Write-Host "  SKIPPED - Node.js not installed" -ForegroundColor Yellow
    Write-Host "  Frontend requires Node.js to run" -ForegroundColor Gray
    Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Gray
}

# ============================================================
# Summary
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Components Started!" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

if ($nodeInstalled) {
    Write-Host "3 new windows opened:" -ForegroundColor White
    Write-Host "  1. Backend API       -> http://localhost:5000" -ForegroundColor Green
    Write-Host "  2. Face Recognition  -> Webcam window (press Q to quit)" -ForegroundColor Green
    Write-Host "  3. Frontend Dashboard-> http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "2 new windows opened:" -ForegroundColor White
    Write-Host "  1. Backend API       -> http://localhost:5000" -ForegroundColor Green
    Write-Host "  2. Face Recognition  -> Webcam window (press Q to quit)" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Frontend NOT started (Node.js required)" -ForegroundColor Yellow
    Write-Host "  Install Node.js from: https://nodejs.org/" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Login to Frontend:" -ForegroundColor Yellow
Write-Host "  Email: admin@facerecognition.com" -ForegroundColor Cyan
Write-Host "  Password: Admin@123" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all:" -ForegroundColor Yellow
Write-Host "  - Close each terminal window, OR" -ForegroundColor Gray
Write-Host "  - Press Ctrl+C in each window" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this launcher window..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
