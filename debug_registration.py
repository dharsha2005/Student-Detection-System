#!/usr/bin/env python3
"""
Debug script to test student registration and AI prediction generation
"""
import requests
import json
import time

def debug_student_registration():
    """Debug the complete student registration and prediction flow"""
    
    print("🔍 DEBUGGING Student Registration & AI Prediction Flow")
    print("=" * 70)
    
    # Test student data
    new_student = {
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
        # Step 1: Create new student
        print("1️⃣ Creating new student...")
        create_response = requests.post('http://localhost:8004/api/students/', json=new_student)
        
        print(f"   Status Code: {create_response.status_code}")
        
        if create_response.status_code == 200:
            created_student = create_response.json()
            student_id = created_student.get('_id') or created_student.get('id')
            print(f"   ✅ Student Created: {created_student['name']}")
            print(f"   📋 Student ID: {student_id}")
            print(f"   📊 Student Data: {json.dumps(created_student, indent=2)}")
        else:
            print(f"   ❌ Failed to create student")
            print(f"   📄 Response: {create_response.text}")
            return
        
        # Step 2: Wait a moment for prediction generation
        print("\n2️⃣ Waiting for automatic AI prediction generation...")
        time.sleep(3)
        
        # Step 3: Check if prediction was created
        print("3️⃣ Checking for AI prediction...")
        
        # Get all predictions and look for our student
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        print(f"   📊 Total predictions in DB: {len(predictions)}")
        
        # Find prediction for our student
        student_prediction = None
        for i, pred in enumerate(predictions):
            if pred.get('student_id') == student_id:
                student_prediction = pred
                print(f"   🔍 Found prediction at index {i}")
                break
        
        if student_prediction:
            print(f"   ✅ AI Prediction Found!")
            print(f"   📈 Performance: {student_prediction['predicted_performance']}")
            print(f"   ⚠️  Risk Score: {student_prediction['risk_score']}")
            print(f"   💡 Recommendations: {len(student_prediction['recommendations'])} items")
            print(f"   📅 Created: {student_prediction.get('created_at')}")
        else:
            print(f"   ❌ No AI Prediction Found!")
            print(f"   🔍 Student ID to search: {student_id}")
            print(f"   📋 Available Student IDs in predictions:")
            for i, pred in enumerate(predictions[:5]):  # Show first 5
                print(f"      {i+1}. {pred.get('student_id')}")
        
        # Step 4: Test admin dashboard data flow
        print("\n4️⃣ Testing Admin Dashboard Data Flow...")
        
        # Get students
        students_response = requests.get('http://localhost:8004/api/students/')
        students = students_response.json()
        
        # Match students with predictions (same logic as admin dashboard)
        matched_predictions = []
        for student in students:
            student_db_id = student.get('_id')
            prediction = next((p for p in predictions if p['student_id'] == student_db_id), None)
            
            if prediction:
                matched_predictions.append({
                    'studentId': student_db_id,
                    'student': student,
                    'prediction': prediction
                })
        
        # Find our debug student in matches
        debug_match = next((m for m in matched_predictions if m['studentId'] == student_id), None)
        
        if debug_match:
            print(f"   ✅ Student found in admin dashboard data!")
            print(f"   📊 Matched Performance: {debug_match['prediction']['predicted_performance']}")
        else:
            print(f"   ❌ Student NOT found in admin dashboard data!")
            print(f"   🔍 Total matched predictions: {len(matched_predictions)}")
        
        # Step 5: Cleanup
        print(f"\n5️⃣ Cleaning up debug student...")
        delete_response = requests.delete(f'http://localhost:8004/api/students/{student_id}')
        if delete_response.status_code == 200:
            print("   ✅ Debug student cleaned up")
        
    except Exception as e:
        print(f"❌ Debug failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_student_registration()
