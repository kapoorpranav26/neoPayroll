@echo off
title NeoPayroll Launcher
echo ===================================================
echo Starting NeoPayroll System (Backend + Frontend)...
echo ===================================================

cd /d "%~dp0"

start "NeoPayroll - Backend Server (FastAPI)" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000"
start "NeoPayroll - Frontend Server (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo - Frontend UI will be ready at: http://localhost:5173
echo - Backend API and Swagger Docs: http://127.0.0.1:8000/docs
echo.
echo Keep those windows open while testing.
echo ===================================================
pause
