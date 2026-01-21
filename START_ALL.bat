@echo off
title Student Detection System - All Services
color 0A

echo ========================================
echo   Student Detection System Startup
echo ========================================
echo.
echo Starting all services...
echo.

:: Start ML Service
echo [1/3] Starting ML Service on port 8002...
start "ML Service" cmd /k "cd /d \"%~dp0ml_service\" && python -m uvicorn app.main:app --port 8002 --host 0.0.0.0"
timeout /t 2 /nobreak >nul

:: Start Backend
echo [2/3] Starting Backend on port 8004...
start "Backend Service" cmd /k "cd /d \"%~dp0backend\" && python run.py"
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [3/3] Starting Frontend on port 3000...
start "Frontend Service" cmd /k "cd /d \"%~dp0frontend\" && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Services:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8004
echo - ML Service: http://localhost:8002
echo.
echo Press any key to open the application in browser...
pause >nul

:: Open browser
start http://localhost:3000

echo.
echo ========================================
echo   Application Ready!
echo ========================================
echo.
echo Note: Keep all service windows open for the application to work
echo Closing any service window will stop that service
echo.
pause
