from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from beanie import PydanticObjectId

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "student"

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: PydanticObjectId = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            PydanticObjectId: lambda v: str(v)
        }

class StudentBase(BaseModel):
    name: str
    email: str
    user_id: str
    enrollment_year: int
    major: str
    attendance_percentage: float
    internal_marks: float
    assignment_scores: float
    lab_performance: float
    previous_gpa: float
    study_hours: float
    socio_academic_factors: Dict[str, Any]
    participation_metrics: float

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    user_id: Optional[str] = None
    enrollment_year: Optional[int] = None
    major: Optional[str] = None
    attendance_percentage: Optional[float] = None
    internal_marks: Optional[float] = None
    assignment_scores: Optional[float] = None
    lab_performance: Optional[float] = None
    previous_gpa: Optional[float] = None
    study_hours: Optional[float] = None
    socio_academic_factors: Optional[Dict[str, Any]] = None
    participation_metrics: Optional[float] = None

class Student(StudentBase):
    id: PydanticObjectId = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            PydanticObjectId: lambda v: str(v)
        }

class PredictionRequest(BaseModel):
    student_id: str
    attendance_percentage: float
    internal_marks: float
    assignment_scores: float
    lab_performance: float
    previous_gpa: float
    study_hours: float
    socio_academic_factors: Dict[str, Any]
    participation_metrics: float

class PredictionResponse(BaseModel):
    predicted_performance: str
    risk_score: float
    recommendations: List[str]
    feature_importance: Optional[Dict[str, Any]] = None

class PredictionBase(BaseModel):
    student_id: str
    predicted_performance: str
    risk_score: float
    recommendations: List[str]

class PredictionCreate(PredictionBase):
    pass

class Prediction(PredictionBase):
    id: PydanticObjectId = Field(alias="_id")
    created_at: datetime

    class Config:
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            PydanticObjectId: lambda v: str(v)
        }