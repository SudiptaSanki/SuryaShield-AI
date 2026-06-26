@echo off
title SuryaShield AI Launcher
color 0B

echo.
echo  ============================================
echo    SuryaShield AI - Solar Flare Prediction
echo    Predicting the Sun's storms before they 
echo    strike Earth.
echo  ============================================
echo.

REM Get the directory where this bat file lives
set "PROJECT_DIR=%~dp0"

echo [1/2] Starting Backend (FastAPI + PyTorch)...
start "SuryaShield Backend" cmd /k "cd /d "%PROJECT_DIR%backend" && call venv\Scripts\activate.bat && echo Backend starting on http://localhost:8000 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (Next.js + Three.js)...
start "SuryaShield Frontend" cmd /k "cd /d "%PROJECT_DIR%frontend" && echo Frontend starting on http://localhost:3000 && npm run dev"

REM Wait 5 seconds for frontend to compile
timeout /t 5 /nobreak > nul

echo.
echo  ============================================
echo    Both services are starting!
echo.
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    Dashboard: http://localhost:3000/dashboard
echo  ============================================
echo.
echo  Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo  Press any key to close this launcher window.
pause > nul
