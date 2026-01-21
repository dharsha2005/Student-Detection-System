from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import students, predictions, analytics, auth, chatbot
from app.database import init_db
import asyncio

app = FastAPI(title="Student Performance Detection System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:57475"],  # React frontend and browser preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("Database initialization completed")

@app.get("/")
def read_root():
    return {"message": "Student Performance Detection System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}