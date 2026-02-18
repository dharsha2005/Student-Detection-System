# 🚀 Student Detection System - Setup Guide

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8+ (Backend & ML Service)
- **Node.js**: 16+ (Frontend)
- **MongoDB**: 4.4+ (Database)
- **Git**: For cloning repository

### Software Dependencies
- **Python**: pip package manager
- **Node.js**: npm package manager
- **MongoDB**: Database service

## 🗂️ Project Structure

```
Student Detection System/
├── backend/                    # FastAPI Backend Service
│   ├── requirements.txt         # Python dependencies
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # Database operations
│   │   └── routers/           # API endpoints
│   └── run.py                # Backend startup script
├── ml_service/                 # ML Prediction Service
│   ├── requirements.txt         # ML dependencies
│   ├── app/
│   │   ├── main.py            # ML service entry point
│   │   └── routers/
│   │       └── predict.py      # Prediction endpoint
│   └── models/                # Trained ML models
├── frontend/                   # React Frontend
│   ├── package.json           # Node.js dependencies
│   └── src/
│       ├── pages/             # React components
│       ├── components/         # Reusable components
│       └── contexts/          # React contexts
├── START_ALL.bat              # Start all services
├── STOP_ALL.bat               # Stop all services
├── CHECK_STATUS.bat           # Check service status
└── README.md                 # Project documentation
```

## 🛠️ Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Student Detection System"
```

### 2. Database Setup (MongoDB)
```bash
# Option 1: Install MongoDB locally
# Download and install MongoDB from https://www.mongodb.com/try/download/community

# Option 2: Use MongoDB Atlas (Cloud)
# Create free account at https://www.mongodb.com/atlas
# Get connection string and update backend/app/database.py

# Option 3: Use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Backend Setup (Python)
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python run.py
```

### 4. ML Service Setup (Python)
```bash
cd ml_service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start ML service
python -m uvicorn app.main:app --port 8002 --host 0.0.0.0
```

### 5. Frontend Setup (Node.js)
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

## 🚀 Quick Start (Windows)

### Method 1: Use Batch Files
```bash
# Double-click START_ALL.bat to start all services
# Double-click STOP_ALL.bat to stop all services
# Double-click CHECK_STATUS.bat to check service status
```

### Method 2: Manual Startup
```bash
# Open 3 separate terminals:

# Terminal 1 - Backend
cd backend
python run.py

# Terminal 2 - ML Service
cd ml_service
python -m uvicorn app.main:app --port 8002 --host 0.0.0.0

# Terminal 3 - Frontend
cd frontend
npm start
```

## 📊 Service URLs & Ports

| Service | Port | URL | Health Check |
|----------|------|-----|---------------|
| Frontend | 3000 | http://localhost:3000 | - |
| Backend | 8004 | http://localhost:8004 | http://localhost:8004/health |
| ML Service | 8002 | http://localhost:8002 | http://localhost:8002/health |

## 🔧 Configuration Files

### Environment Variables (Optional)
Create `.env` files in each service directory:

**Backend/.env**
```env
MONGODB_URL=mongodb://localhost:27017/student_performance
SECRET_KEY=your-secret-key-here
DEBUG=True
```

**Frontend/.env**
```env
REACT_APP_API_URL=http://localhost:8004
REACT_APP_ML_URL=http://localhost:8002
```

**ML Service/.env**
```env
MODEL_PATH=./models
DEBUG=True
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Find process using port
netstat -ano | findstr ":8004"

# Kill process
taskkill /F /PID <process-id>

# Or use STOP_ALL.bat
```

#### 2. MongoDB Connection Failed
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB service
net start MongoDB
```

#### 3. Python Module Not Found
```bash
# Install missing dependencies
pip install -r requirements.txt

# Check virtual environment
pip list
```

#### 4. Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. ML Model Loading Errors
```bash
# Check model files exist
ls -la ml_service/models/

# Train new models if needed
cd ml_service/scripts
python train_models.py
```

## 📝 Development Notes

### Database Initialization
- MongoDB collections auto-create on first run
- Sample data populated automatically
- Indexes created for performance

### API Endpoints
- **Backend**: http://localhost:8004/docs (Swagger UI)
- **ML Service**: http://localhost:8002/docs (Swagger UI)

### Testing
```bash
# Backend tests
cd backend && pytest

# ML service tests
cd ml_service && pytest

# Frontend tests
cd frontend && npm test
```

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build images
docker build -t student-backend ./backend
docker build -t student-ml ./ml_service
docker build -t student-frontend ./frontend

# Run with docker-compose
docker-compose up -d
```

### Environment Variables for Production
```env
MONGODB_URL=mongodb://your-production-db-url
SECRET_KEY=production-secret-key
DEBUG=False
NODE_ENV=production
```

## 📚 Documentation

- **API Documentation**: http://localhost:8004/docs
- **Project README**: README.md
- **Architecture**: docs/architecture.md
- **ML Models**: docs/models.md

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow coding standards

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 Quick Verification

After setup, verify all services are running:

1. **Frontend**: http://localhost:3000
2. **Backend Health**: http://localhost:8004/health
3. **ML Service Health**: http://localhost:8002/health

All should return status 200 OK!

## 🆘 Support

For issues:
1. Check this setup guide
2. Review API documentation
3. Check existing GitHub issues
4. Create new issue with detailed error logs

---

**🎉 Happy Coding! The Student Detection System is now ready for development and deployment!**
