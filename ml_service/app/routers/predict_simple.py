from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class PredictionRequest(BaseModel):
    student_id: str
    attendance_percentage: Optional[float] = 75.0
    internal_marks: Optional[float] = 70.0
    assignment_scores: Optional[float] = 75.0
    lab_performance: Optional[float] = 70.0
    previous_gpa: Optional[float] = 3.0
    study_hours: Optional[float] = 20.0
    socio_academic_factors: Optional[Dict[str, Any]] = {}
    participation_metrics: Optional[float] = 75.0

class PredictionResponse(BaseModel):
    predicted_performance: str
    risk_score: float
    recommendations: List[str]
    feature_importance: Dict[str, float]

@router.post("/predict", response_model=PredictionResponse)
def predict_performance(request: PredictionRequest):
    # Simple rule-based prediction without ML libraries
    data = {
        'attendance_percentage': request.attendance_percentage,
        'internal_marks': request.internal_marks,
        'assignment_scores': request.assignment_scores,
        'lab_performance': request.lab_performance,
        'previous_gpa': request.previous_gpa,
        'study_hours': request.study_hours,
        'participation_metrics': request.participation_metrics,
    }
    
    # Simple scoring logic
    total_score = (data['internal_marks'] + data['assignment_scores'] + data['lab_performance']) / 3
    academic_engagement = data['attendance_percentage'] * data['participation_metrics'] / 100
    
    # Rule-based prediction
    if data['previous_gpa'] >= 3.5 and data['attendance_percentage'] >= 90 and total_score >= 80:
        prediction = 'High'
        risk_score = 0.1
    elif data['previous_gpa'] >= 2.5 and data['attendance_percentage'] >= 75 and total_score >= 60:
        prediction = 'Medium'
        risk_score = 0.4
    else:
        prediction = 'Low'
        risk_score = 0.8
    
    # Feature importance
    feature_importance = {
        'previous_gpa': 0.35,
        'attendance_percentage': 0.28,
        'study_hours': 0.18,
        'total_score': 0.12,
        'participation_metrics': 0.07
    }
    
    # Generate recommendations
    recommendations = []
    if prediction == 'Low':
        if data.get('attendance_percentage', 0) < 75:
            recommendations.append("Improve attendance by attending all classes regularly.")
        if data.get('study_hours', 0) < 20:
            recommendations.append("Increase study hours to at least 20 hours per week.")
        if data.get('previous_gpa', 0) < 3.0:
            recommendations.append("Focus on improving grades in core subjects.")
        recommendations.append("Schedule a meeting with academic advisor for personalized guidance.")
    elif prediction == 'Medium':
        recommendations.append("Maintain current study habits and attendance.")
        recommendations.append("Consider joining study groups for peer learning.")
    else:  # High
        recommendations.append("Excellent performance! Keep up the good work.")
        recommendations.append("Consider leadership roles or advanced courses.")
    
    return PredictionResponse(
        predicted_performance=prediction,
        risk_score=risk_score,
        recommendations=recommendations,
        feature_importance=feature_importance
    )
