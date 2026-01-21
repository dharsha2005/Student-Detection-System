#!/usr/bin/env python3
"""
Script to clear old predictions and generate test data for admin dashboard
"""
import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import init_db, create_prediction
from app.schemas import PredictionCreate

async def clear_and_generate_predictions():
    """Clear old predictions and generate new test data"""
    
    # Initialize database
    await init_db()
    
    # Clear existing predictions
    print("🗑️  Clearing existing predictions...")
    try:
        from app.models import Prediction
        existing = await Prediction.find().to_list()
        for pred in existing:
            await pred.delete()
        print(f"Cleared {len(existing)} old predictions")
    except Exception as e:
        print(f"Error clearing predictions: {e}")
    
    # Test student data (matching frontend structure)
    test_students = [
        {
            "student_id": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": "john@example.com",
            "predicted_performance": "High",
            "risk_score": 0.15,
            "recommendations": [
                "Excellent performance! Keep up the good work.",
                "Consider leadership roles or advanced courses."
            ]
        },
        {
            "student_id": "507f1f77bcf86cd799439012", 
            "name": "Jane Smith",
            "email": "jane@example.com",
            "predicted_performance": "Medium",
            "risk_score": 0.45,
            "recommendations": [
                "Maintain current study habits and attendance.",
                "Consider joining study groups for peer learning."
            ]
        },
        {
            "student_id": "507f1f77bcf86cd799439013",
            "name": "Bob Johnson", 
            "email": "bob@example.com",
            "predicted_performance": "Low",
            "risk_score": 0.85,
            "recommendations": [
                "Improve attendance by attending all classes regularly.",
                "Increase study hours to at least 20 hours per week.",
                "Focus on improving grades in core subjects.",
                "Schedule a meeting with academic advisor for personalized guidance."
            ]
        },
        {
            "student_id": "507f1f77bcf86cd799439014",
            "name": "Alice Brown",
            "email": "alice@example.com", 
            "predicted_performance": "Medium",
            "risk_score": 0.35,
            "recommendations": [
                "Maintain current study habits and attendance.",
                "Consider joining study groups for peer learning."
            ]
        }
    ]
    
    print("🗑️  Clearing old predictions and generating new test data...")
    
    # Create new predictions
    for student_data in test_students:
        try:
            prediction = PredictionCreate(
                student_id=student_data["student_id"],
                predicted_performance=student_data["predicted_performance"],
                risk_score=student_data["risk_score"],
                recommendations=student_data["recommendations"]
            )
            
            result = await create_prediction(prediction.dict())
            print(f"✅ Created prediction for {student_data['name']}")
            
        except Exception as e:
            print(f"❌ Error creating prediction for {student_data['name']}: {e}")
    
    print("\n🎉 Test predictions generated successfully!")
    print("Admin dashboard should now show AI predictions for students.")

if __name__ == "__main__":
    asyncio.run(clear_and_generate_predictions())
