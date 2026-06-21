@echo off
echo Starting SuryaShield AI Backend...
start cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload"

echo Starting SuryaShield AI Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services are starting. 
echo Frontend will be available at http://localhost:3000
echo Backend API will be available at http://localhost:8000
