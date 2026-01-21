from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_data():
    """Get dashboard data with students and their predictions"""
    from app import crud
    
    # Get all students
    students = await crud.get_students()
    
    # Get all predictions
    predictions = await crud.get_all_predictions()
    
    # Match students with predictions
    dashboard_data = []
    for student in students:
        student_id = str(student.id)
        prediction = next((p for p in predictions if p.student_id == student_id), None)
        
        dashboard_data.append({
            "student": {
                "id": student_id,
                "name": student.name,
                "email": student.email,
                "enrollment_year": student.enrollment_year,
                "major": student.major,
                "attendance_percentage": student.attendance_percentage,
                "internal_marks": student.internal_marks,
                "assignment_scores": student.assignment_scores,
                "lab_performance": student.lab_performance,
                "previous_gpa": student.previous_gpa,
                "study_hours": student.study_hours,
                "participation_metrics": student.participation_metrics
            },
            "prediction": {
                "predicted_performance": prediction.predicted_performance if prediction else None,
                "risk_score": prediction.risk_score if prediction else None,
                "recommendations": prediction.recommendations if prediction else []
            } if prediction else None
        })
    
    # Calculate stats
    total_students = len(students)
    students_with_predictions = len([d for d in dashboard_data if d["prediction"]])
    at_risk = len([d for d in dashboard_data if d["prediction"] and d["prediction"]["risk_score"] >= 0.6])
    high_performers = len([d for d in dashboard_data if d["prediction"] and d["prediction"]["predicted_performance"] == "High"])
    
    return {
        "students": dashboard_data,
        "stats": {
            "total_students": total_students,
            "students_with_predictions": students_with_predictions,
            "at_risk_students": at_risk,
            "high_performers": high_performers
        }
    }

@router.get("/performance-trends")
async def get_performance_trends():
    # Aggregate data for trends
    from app import crud
    trends = await crud.get_performance_trends()
    return trends

@router.get("/risk-analysis")
async def get_risk_analysis():
    # At-risk students
    from app import crud
    at_risk = await crud.get_at_risk_students()
    return at_risk

@router.get("/cohort-comparison")
async def get_cohort_comparison():
    # Compare different cohorts
    from app import crud
    comparison = await crud.get_cohort_comparison()
    return comparison