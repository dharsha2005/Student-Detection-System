import requests
import asyncio
import sys
import os

# Add backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import init_db, create_prediction
from app.schemas import PredictionCreate

async def generate_predictions_for_all_students():
    """Generate AI predictions for all students"""
    
    await init_db()
    
    # Get all students
    students_response = requests.get('http://localhost:8004/api/students/')
    students = students_response.json()
    
    print(f"🎯 Generating predictions for {len(students)} students...")
    
    # Get existing predictions to avoid duplicates
    existing_predictions_response = requests.get('http://localhost:8004/api/predictions/')
    existing_predictions = existing_predictions_response.json()
    existing_student_ids = {p['student_id'] for p in existing_predictions}
    
    print(f"📋 Found {len(existing_predictions)} existing predictions")
    
    generated_count = 0
    
    for i, student in enumerate(students):
        student_id = student.get('_id')
        
        # Skip if prediction already exists
        if student_id in existing_student_ids:
            print(f"⏭️  Skipping {student['name']} - prediction already exists")
            continue
        
        # Generate prediction based on student data
        gpa = student.get('previous_gpa', 0)
        attendance = student.get('attendance_percentage', 0)
        
        # Simple rule-based prediction logic
        if gpa >= 3.5 and attendance >= 90:
            performance = "High"
            risk_score = 0.1 + (i * 0.05)  # Slight variation
            recommendations = [
                "Excellent performance! Keep up the good work.",
                "Consider leadership roles or advanced courses.",
                "Mentor other students in challenging subjects."
            ]
        elif gpa >= 3.0 and attendance >= 75:
            performance = "Medium"
            risk_score = 0.3 + (i * 0.05)
            recommendations = [
                "Maintain current study habits and attendance.",
                "Consider joining study groups for peer learning.",
                "Explore additional learning resources."
            ]
        elif gpa >= 2.5 and attendance >= 60:
            performance = "Medium"
            risk_score = 0.5 + (i * 0.05)
            recommendations = [
                "Focus on improving consistency in assignments.",
                "Increase study hours by 5-10 hours per week.",
                "Schedule regular meetings with professors."
            ]
        else:
            performance = "Low"
            risk_score = 0.7 + (i * 0.02)
            recommendations = [
                "Improve attendance by attending all classes regularly.",
                "Increase study hours to at least 20 hours per week.",
                "Focus on improving grades in core subjects.",
                "Schedule a meeting with academic advisor for personalized guidance.",
                "Consider tutoring support for challenging subjects."
            ]
        
        # Create prediction
        prediction_data = PredictionCreate(
            student_id=student_id,
            predicted_performance=performance,
            risk_score=min(risk_score, 0.95),  # Cap at 95%
            recommendations=recommendations
        )
        
        try:
            result = await create_prediction(prediction_data.model_dump())
            generated_count += 1
            print(f"✅ Generated prediction for {student['name']}: {performance} (Risk: {risk_score:.2f})")
        except Exception as e:
            print(f"❌ Error creating prediction for {student['name']}: {e}")
    
    print(f"\n🎉 Successfully generated {generated_count} new predictions!")
    print(f"📊 Total predictions: {len(existing_predictions) + generated_count}")

if __name__ == "__main__":
    asyncio.run(generate_predictions_for_all_students())
