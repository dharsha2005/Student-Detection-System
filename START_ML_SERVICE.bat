@echo off
echo Starting ML Service...
cd /d "C:\Student Detection System\ml_service"
python -m uvicorn app.main:app --port 8002 --host 0.0.0.0
pause
