@echo off
title Stop All Services
color 0C

echo ========================================
echo   Stop All Student Detection Services
echo ========================================
echo.

echo Stopping all services...

:: Kill processes on ports 8002, 8004, and 3000
echo [1/3] Stopping ML Service (port 8002)...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8002"') do taskkill /F /PID %%a >nul 2>&1

echo [2/3] Stopping Backend Service (port 8004)...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8004"') do taskkill /F /PID %%a >nul 2>&1

echo [3/3] Stopping Frontend Service (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000"') do taskkill /F /PID %%a >nul 2>&1

:: Also kill any remaining node/python processes
echo Cleaning up remaining processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo.
echo ========================================
echo   All Services Stopped!
echo ========================================
echo.
pause
