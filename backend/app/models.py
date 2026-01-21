from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class User(Document):
    name: str
    email: str = Field(unique=True)
    password: str  # Hashed password
    role: str = Field(default="student")  # "student" or "admin"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

class Student(Document):
    name: str
    email: str = Field(unique=True)
    user_id: str  # Reference to User document ID
    enrollment_year: int
    major: str
    attendance_percentage: float
    internal_marks: float
    assignment_scores: float
    lab_performance: float
    previous_gpa: float
    study_hours: float
    socio_academic_factors: Dict[str, Any]  # JSON object
    participation_metrics: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "students"

class Prediction(Document):
    student_id: str  # Reference to Student document ID
    predicted_performance: str  # e.g., "High", "Medium", "Low"
    risk_score: float
    recommendations: List[str]  # List of recommendation strings
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "predictions"