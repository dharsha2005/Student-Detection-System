import requests

# Get actual students and their IDs
students_response = requests.get('http://localhost:8004/api/students/')
students = students_response.json()

print("Actual Student IDs:")
for i, student in enumerate(students[:4]):
    print(f"{i+1}. {student['name']} - ID: {student.get('_id')} or {student.get('id')}")

# Create predictions for the first 4 real students
print("\nCreating predictions for real students...")

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import init_db, create_prediction
from app.schemas import PredictionCreate

async def create_predictions_for_real_students():
    """Create predictions for real students"""
    
    await init_db()
    
    # Get first 4 students
    test_students = students[:4]
    
    for i, student in enumerate(test_students):
        student_id = student.get('_id') or student.get('id')
        
        # Create prediction based on student performance
        if i == 0:  # BPT - High performer
            prediction_data = PredictionCreate(
                student_id=student_id,
                predicted_performance="High",
                risk_score=0.15,
                recommendations=[
                    "Excellent performance! Keep up the good work.",
                    "Consider leadership roles or advanced courses."
                ]
            )
        elif i == 1:  # Dharshan - Medium performer
            prediction_data = PredictionCreate(
                student_id=student_id,
                predicted_performance="Medium",
                risk_score=0.45,
                recommendations=[
                    "Maintain current study habits and attendance.",
                    "Consider joining study groups for peer learning."
                ]
            )
        elif i == 2:  # Synthetic Student 1 - Low performer
            prediction_data = PredictionCreate(
                student_id=student_id,
                predicted_performance="Low",
                risk_score=0.85,
                recommendations=[
                    "Improve attendance by attending all classes regularly.",
                    "Increase study hours to at least 20 hours per week.",
                    "Focus on improving grades in core subjects."
                ]
            )
        else:  # Synthetic Student 2 - Medium performer
            prediction_data = PredictionCreate(
                student_id=student_id,
                predicted_performance="Medium",
                risk_score=0.35,
                recommendations=[
                    "Maintain current study habits and attendance.",
                    "Consider joining study groups for peer learning."
                ]
            )
        
        try:
            result = await create_prediction(prediction_data.model_dump())
            print(f"✅ Created prediction for {student['name']} (ID: {student_id})")
        except Exception as e:
            print(f"❌ Error creating prediction for {student['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(create_predictions_for_real_students())
