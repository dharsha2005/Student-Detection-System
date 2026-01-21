from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict_simple

app = FastAPI(title="Student Performance ML Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_simple.router, prefix="/api", tags=["predictions"])

@app.get("/")
def read_root():
    return {"message": "Student Performance ML Service"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}