from app import schemas
from app.database import (
    get_student as db_get_student,
    get_students as db_get_students,
    create_student as db_create_student,
    update_student as db_update_student,
    delete_student as db_delete_student,
    create_prediction as db_create_prediction,
    get_predictions_by_student as db_get_predictions_by_student,
    get_user_by_email as db_get_user_by_email,
    create_user as db_create_user,
    get_user_by_id as db_get_user_by_id,
    get_users as db_get_users
)
from app.models import Student, Prediction, User
from typing import List, Optional

async def get_student(student_id: str) -> Optional[Student]:
    return await db_get_student(student_id)

async def get_students(skip: int = 0, limit: int = 100) -> List[Student]:
    return await db_get_students(skip, limit)

async def create_student(student: schemas.StudentCreate) -> Student:
    return await db_create_student(student.dict())

async def update_student(student_id: str, student: schemas.StudentUpdate) -> Optional[Student]:
    return await db_update_student(student_id, student.dict(exclude_unset=True))

async def delete_student(student_id: str) -> bool:
    return await db_delete_student(student_id)

async def create_prediction(prediction: schemas.PredictionCreate) -> Prediction:
    return await db_create_prediction(prediction.dict())

async def get_all_predictions():
    """Get all predictions"""
    return await Prediction.find().to_list(1000)

async def get_predictions_by_student(student_id: str):
    return await db_get_predictions_by_student(student_id)

# User CRUD operations
async def get_user_by_email(email: str) -> Optional[User]:
    return await db_get_user_by_email(email)

async def create_user(user_data: dict) -> User:
    return await db_create_user(user_data)

async def get_user_by_id(user_id: str) -> Optional[User]:
    return await db_get_user_by_id(user_id)

async def get_users(skip: int = 0, limit: int = 100) -> List[User]:
    return await db_get_users(skip, limit)

async def get_performance_trends():
    """Get real performance trends from database"""
    try:
        # Get all students and predictions
        students = await get_students()
        predictions = await get_all_predictions()
        
        # Group by enrollment year for trends
        trends_by_year = {}
        
        for student in students:
            year = student.enrollment_year
            if year not in trends_by_year:
                trends_by_year[year] = {
                    "total_students": 0,
                    "total_gpa": 0,
                    "total_attendance": 0,
                    "predictions": []
                }
            
            trends_by_year[year]["total_students"] += 1
            trends_by_year[year]["total_gpa"] += student.previous_gpa
            trends_by_year[year]["total_attendance"] += student.attendance_percentage
            
            # Find prediction for this student
            student_id = str(student.id)
            prediction = next((p for p in predictions if p.student_id == student_id), None)
            if prediction:
                trends_by_year[year]["predictions"].append(prediction)
        
        # Calculate averages
        trends = []
        for year in sorted(trends_by_year.keys()):
            data = trends_by_year[year]
            avg_gpa = data["total_gpa"] / data["total_students"] if data["total_students"] > 0 else 0
            avg_attendance = data["total_attendance"] / data["total_students"] if data["total_students"] > 0 else 0
            
            # Calculate performance distribution
            high_count = len([p for p in data["predictions"] if p.predicted_performance == "High"])
            medium_count = len([p for p in data["predictions"] if p.predicted_performance == "Medium"])
            low_count = len([p for p in data["predictions"] if p.predicted_performance == "Low"])
            
            trends.append({
                "year": year,
                "average_gpa": round(avg_gpa, 2),
                "attendance_rate": round(avg_attendance, 1),
                "total_students": data["total_students"],
                "performance_distribution": {
                    "high": high_count,
                    "medium": medium_count,
                    "low": low_count
                }
            })
        
        return {"trends": trends}
    except Exception as e:
        print(f"Error getting performance trends: {e}")
        return {"trends": []}

async def get_at_risk_students():
    """Get real at-risk students from database"""
    try:
        # Get all students and predictions
        students = await get_students()
        predictions = await get_all_predictions()
        
        at_risk_students = []
        
        for student in students:
            student_id = str(student.id)
            prediction = next((p for p in predictions if p.student_id == student_id), None)
            
            if prediction and prediction.risk_score >= 0.7:
                at_risk_students.append({
                    "student_id": student_id,
                    "name": student.name,
                    "email": student.email,
                    "risk_score": prediction.risk_score,
                    "predicted_performance": prediction.predicted_performance,
                    "gpa": student.previous_gpa,
                    "attendance_percentage": student.attendance_percentage,
                    "recommendations": prediction.recommendations
                })
        
        # Sort by risk score (highest first)
        at_risk_students.sort(key=lambda x: x["risk_score"], reverse=True)
        
        return at_risk_students
    except Exception as e:
        print(f"Error getting at-risk students: {e}")
        return []

async def get_cohort_comparison():
    """Get real cohort comparison data from database"""
    try:
        # Get all students and predictions
        students = await get_students()
        predictions = await get_all_predictions()
        
        # Group by enrollment year
        cohorts = {}
        
        for student in students:
            year = student.enrollment_year
            if year not in cohorts:
                cohorts[year] = {
                    "total_students": 0,
                    "total_gpa": 0,
                    "predictions": []
                }
            
            cohorts[year]["total_students"] += 1
            cohorts[year]["total_gpa"] += student.previous_gpa
            
            # Find prediction for this student
            student_id = str(student.id)
            prediction = next((p for p in predictions if p.student_id == student_id), None)
            if prediction:
                cohorts[year]["predictions"].append(prediction)
        
        # Calculate cohort statistics
        comparison = []
        for year in sorted(cohorts.keys()):
            data = cohorts[year]
            avg_gpa = data["total_gpa"] / data["total_students"] if data["total_students"] > 0 else 0
            
            # Calculate performance distribution
            high_count = len([p for p in data["predictions"] if p.predicted_performance == "High"])
            medium_count = len([p for p in data["predictions"] if p.predicted_performance == "Medium"])
            low_count = len([p for p in data["predictions"] if p.predicted_performance == "Low"])
            
            # Mock graduation rate based on performance (in real system, this would be actual data)
            high_performers_rate = (high_count + medium_count) / data["total_students"] if data["total_students"] > 0 else 0
            graduation_rate = min(95, 75 + (high_performers_rate * 20))  # Estimate based on performance
            
            comparison.append({
                "cohort": str(year),
                "average_gpa": round(avg_gpa, 2),
                "graduation_rate": round(graduation_rate, 1),
                "total_students": data["total_students"],
                "performance_distribution": {
                    "high": high_count,
                    "medium": medium_count,
                    "low": low_count
                }
            })
        
        return {"comparison": comparison}
    except Exception as e:
        print(f"Error getting cohort comparison: {e}")
        return {"comparison": []}