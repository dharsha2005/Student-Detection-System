#!/usr/bin/env python3
"""
Debug the prediction generation function
"""
import requests
import json

def debug_prediction_generation():
    """Debug why prediction generation is not working"""
    
    print("🔍 Debugging Prediction Generation Function")
    print("=" * 50)
    
    # Create a test student manually
    test_student = {
        "name": "Debug Student",
        "email": "debug@example.com",
        "user_id": "debuguser123",
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
        # Step 1: Create student
        print("1️⃣ Creating student...")
        create_response = requests.post('http://localhost:8004/api/students/', json=test_student)
        
        if create_response.status_code != 200:
            print(f"❌ Failed to create student: {create_response.status_code}")
            print(f"Response: {create_response.text}")
            return
        
        created_student = create_response.json()
        student_id = created_student.get('_id')
        print(f"✅ Student created: {created_student['name']} (ID: {student_id})")
        
        # Step 2: Test ML service directly
        print("\n2️⃣ Testing ML service directly...")
        ml_request = {
            "student_id": student_id,
            "attendance_percentage": test_student["attendance_percentage"],
            "internal_marks": test_student["internal_marks"],
            "assignment_scores": test_student["assignment_scores"],
            "lab_performance": test_student["lab_performance"],
            "previous_gpa": test_student["previous_gpa"],
            "study_hours": test_student["study_hours"],
            "socio_academic_factors": test_student["socio_academic_factors"],
            "participation_metrics": test_student["participation_metrics"]
        }
        
        ml_response = requests.post('http://localhost:8002/api/predict', json=ml_request)
        
        if ml_response.status_code == 200:
            ml_result = ml_response.json()
            print(f"✅ ML Service working: {ml_result['predicted_performance']}")
        else:
            print(f"❌ ML Service failed: {ml_response.status_code}")
            print(f"Response: {ml_response.text}")
            return
        
        # Step 3: Test backend prediction creation directly
        print("\n3️⃣ Testing backend prediction creation...")
        
        # Check if prediction exists
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        student_prediction = next((p for p in predictions if p['student_id'] == student_id), None)
        
        if student_prediction:
            print(f"✅ Prediction found: {student_prediction['predicted_performance']}")
        else:
            print("❌ No prediction found - automatic generation failed")
            
            # Try to create prediction manually via backend
            print("\n4️⃣ Creating prediction manually via backend...")
            
            manual_prediction = {
                "student_id": student_id,
                "predicted_performance": ml_result["predicted_performance"],
                "risk_score": ml_result["risk_score"],
                "recommendations": ml_result["recommendations"]
            }
            
            # Try to create prediction via backend predictions endpoint
            pred_response = requests.post('http://localhost:8004/api/predictions/predict', json={
                "student_id": student_id,
                "attendance_percentage": test_student["attendance_percentage"],
                "internal_marks": test_student["internal_marks"],
                "assignment_scores": test_student["assignment_scores"],
                "lab_performance": test_student["lab_performance"],
                "previous_gpa": test_student["previous_gpa"],
                "study_hours": test_student["study_hours"],
                "socio_academic_factors": test_student["socio_academic_factors"],
                "participation_metrics": test_student["participation_metrics"]
            })
            
            if pred_response.status_code == 200:
                print("✅ Manual prediction creation successful")
            else:
                print(f"❌ Manual prediction failed: {pred_response.status_code}")
                print(f"Response: {pred_response.text}")
        
        # Cleanup
        print(f"\n5️⃣ Cleaning up...")
        delete_response = requests.delete(f'http://localhost:8004/api/students/{student_id}')
        if delete_response.status_code == 200:
            print("✅ Test student cleaned up")
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_prediction_generation()
