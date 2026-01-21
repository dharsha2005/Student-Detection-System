#!/usr/bin/env python3
"""
Script to generate AI predictions for students who don't have them yet
"""
import requests
import asyncio
import sys
import os

# Add backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import init_db, create_prediction
from app.schemas import PredictionCreate

async def generate_missing_predictions():
    """Generate AI predictions for students without predictions"""
    
    await init_db()
    
    # Get all students
    students_response = requests.get('http://localhost:8000/api/students/')
    students = students_response.json()
    
    # Get existing predictions
    predictions_response = requests.get('http://localhost:8000/api/predictions/')
    existing_predictions = predictions_response.json()
    existing_student_ids = {p['student_id'] for p in existing_predictions}
    
    print(f"🎯 Checking for missing predictions...")
    print(f"📊 Total students: {len(students)}")
    print(f"🔮 Existing predictions: {len(existing_predictions)}")
    
    missing_predictions = []
    for student in students:
        student_id = student.get('_id')
        if student_id not in existing_student_ids:
            missing_predictions.append(student)
    
    print(f"❌ Students missing predictions: {len(missing_predictions)}")
    
    if not missing_predictions:
        print("✅ All students have predictions!")
        return
    
    # Generate predictions for missing students
    generated_count = 0
    
    for i, student in enumerate(missing_predictions):
        student_id = student.get('_id')
        
        # Prepare data for ML service
        prediction_request = {
            "student_id": student_id,
            "attendance_percentage": student.get('attendance_percentage', 75.0),
            "internal_marks": student.get('internal_marks', 70.0),
            "assignment_scores": student.get('assignment_scores', 75.0),
            "lab_performance": student.get('lab_performance', 70.0),
            "previous_gpa": student.get('previous_gpa', 3.0),
            "study_hours": student.get('study_hours', 20.0),
            "socio_academic_factors": student.get('socio_academic_factors', {}),
            "participation_metrics": student.get('participation_metrics', 75.0)
        }
        
        try:
            # Call ML service
            ml_response = requests.post('http://localhost:8002/api/predict', json=prediction_request, timeout=10)
            ml_response.raise_for_status()
            result = ml_response.json()
            
            # Create prediction
            prediction_data = PredictionCreate(
                student_id=student_id,
                predicted_performance=result["predicted_performance"],
                risk_score=result["risk_score"],
                recommendations=result["recommendations"]
            )
            
            await create_prediction(prediction_data.model_dump())
            generated_count += 1
            print(f"✅ Generated AI prediction for {student['name']}: {result['predicted_performance']} (Risk: {result['risk_score']:.2f})")
        except Exception as e:
            print(f"❌ Error generating prediction for {student['name']}: {e}")
    
    print(f"\n🎉 Successfully generated {generated_count} new predictions!")
    print(f"📊 Total predictions now: {len(existing_predictions) + generated_count}")
    print("\n🔄 Refresh the admin dashboard to see new predictions!")

if __name__ == "__main__":
    asyncio.run(generate_missing_predictions())
