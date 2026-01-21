@echo off
title Service Status Checker
color 0B

echo ========================================
echo   Service Status Checker
echo ========================================
echo.

echo Checking service status...

:: Check ML Service (port 8002)
echo [1/3] ML Service (port 8002):
netstat -ano | find ":8002" >nul
if %errorlevel% == 0 (
    echo    ✅ RUNNING
) else (
    echo    ❌ STOPPED
)

:: Check Backend Service (port 8004)
echo [2/3] Backend Service (port 8004):
netstat -ano | find ":8004" >nul
if %errorlevel% == 0 (
    echo    ✅ RUNNING
) else (
    echo    ❌ STOPPED
)

:: Check Frontend Service (port 3000)
echo [3/3] Frontend Service (port 3000):
netstat -ano | find ":3000" >nul
if %errorlevel% == 0 (
    echo    ✅ RUNNING
) else (
    echo    ❌ STOPPED
)

echo.
echo ========================================
echo   URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8004
echo   ML Service: http://localhost:8002
echo ========================================
echo.
pause
