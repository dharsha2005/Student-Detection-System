# How to Start the Application

## Prerequisites
1. Make sure MongoDB is running (or the app will continue without it)
2. Python 3.x installed with required packages
3. Node.js and npm installed for frontend

## Starting the Backend

### Option 1: Using the batch file (Windows)
Double-click `START_BACKEND.bat` or run:
```bash
START_BACKEND.bat
```

### Option 2: Using PowerShell script
```powershell
.\START_BACKEND.ps1
```

### Option 3: Manual start
```bash
cd backend
python run.py
```

The backend will start on **http://localhost:8003**

## Starting the Frontend

Open a new terminal and run:
```bash
cd frontend
npm start
```

The frontend will start on **http://localhost:3000**

## Verify Backend is Running

Once the backend starts, you should see:
- "Connecting to MongoDB..."
- "MongoDB connected successfully!" (or "MongoDB connection failed" if MongoDB isn't running - app will still work)
- "Database initialization completed"
- Server running message from uvicorn

You can also test by visiting: http://localhost:8003/health

## Troubleshooting

### Backend won't start
1. Check if port 8003 is already in use
2. Make sure all Python dependencies are installed: `pip install -r backend/requirements.txt`
3. Check for any import errors in the console output

### Connection Refused Error
- Make sure the backend is running before starting the frontend
- Verify the backend is on port 8003 (check the console output)
- Check firewall settings

### MongoDB Connection Issues
- The app will continue to work even if MongoDB isn't running
- To use MongoDB, make sure it's installed and running on localhost:27017
- Or set the MONGODB_URL environment variable

