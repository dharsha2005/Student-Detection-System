#!/usr/bin/env python3
"""
Test automatic AI prediction generation for new students
"""
import requests
import json

def test_new_student_prediction():
    """Test if new students get AI predictions automatically"""
    
    print("🧪 Testing Automatic AI Prediction Generation...")
    print("=" * 60)
    
    # Test student data
    new_student = {
        "name": "Test Student Auto",
        "email": "testauto@example.com",
        "user_id": "testuser123",
        "enrollment_year": 2024,
        "major": "Computer Science",
        "attendance_percentage": 85.0,
        "internal_marks": 78.0,
        "assignment_scores": 82.0,
        "lab_performance": 88.0,
        "previous_gpa": 3.4,
        "study_hours": 25.0,
        "socio_academic_factors": {"family_support": "high", "extracurricular": 2},
        "participation_metrics": 75.0
    }
    
    try:
        # 1. Create new student
        print("1️⃣ Creating new student...")
        response = requests.post('http://localhost:8004/api/students/', json=new_student)
        
        if response.status_code == 200:
            created_student = response.json()
            student_id = created_student.get('_id') or created_student.get('id')
            print(f"✅ Student created: {created_student['name']} (ID: {student_id})")
        else:
            print(f"❌ Failed to create student: {response.status_code}")
            print(f"Response: {response.text}")
            return
        
        # 2. Check if prediction was generated automatically
        print("\n2️⃣ Checking for automatic AI prediction...")
        import time
        time.sleep(2)  # Give it time to generate prediction
        
        # Get all predictions
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        # Find prediction for our test student
        student_prediction = next((p for p in predictions if p['student_id'] == student_id), None)
        
        if student_prediction:
            print(f"✅ AI Prediction generated automatically!")
            print(f"   Performance: {student_prediction['predicted_performance']}")
            print(f"   Risk Score: {student_prediction['risk_score']}")
            print(f"   Recommendations: {len(student_prediction['recommendations'])} items")
        else:
            print("❌ No AI prediction found - automatic generation failed")
            
            # Try manual prediction as fallback
            print("\n3️⃣ Testing manual AI prediction...")
            manual_request = {
                "student_id": student_id,
                "attendance_percentage": new_student["attendance_percentage"],
                "internal_marks": new_student["internal_marks"],
                "assignment_scores": new_student["assignment_scores"],
                "lab_performance": new_student["lab_performance"],
                "previous_gpa": new_student["previous_gpa"],
                "study_hours": new_student["study_hours"],
                "socio_academic_factors": new_student["socio_academic_factors"],
                "participation_metrics": new_student["participation_metrics"]
            }
            
            ml_response = requests.post('http://localhost:8002/api/predict', json=manual_request)
            
            if ml_response.status_code == 200:
                print("✅ Manual AI prediction works - issue is in backend automation")
                print(f"   ML Response: {ml_response.json()['predicted_performance']}")
            else:
                print(f"❌ Manual prediction also failed: {ml_response.status_code}")
        
        # 4. Cleanup test student
        print(f"\n4️⃣ Cleaning up test student...")
        delete_response = requests.delete(f'http://localhost:8004/api/students/{student_id}')
        if delete_response.status_code == 200:
            print("✅ Test student cleaned up")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    test_new_student_prediction()
