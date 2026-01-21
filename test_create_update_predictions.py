#!/usr/bin/env python3
"""
Test both CREATE and UPDATE operations for automatic AI prediction generation
"""
import requests
import json
import time

def test_create_and_update_predictions():
    """Test that both CREATE and UPDATE generate AI predictions"""
    
    print("🧪 Testing CREATE and UPDATE AI Prediction Generation")
    print("=" * 70)
    
    # Test student data
    test_student = {
        "name": "Test Student Create",
        "email": "testcreate@example.com",
        "user_id": "testcreate123",
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
        # TEST 1: CREATE new student
        print("\n1️⃣ Testing CREATE operation...")
        create_response = requests.post('http://localhost:8004/api/students/', json=test_student)
        
        if create_response.status_code == 200:
            created_student = create_response.json()
            student_id = created_student.get('_id')
            print(f"   ✅ Student Created: {created_student['name']} (ID: {student_id})")
        else:
            print(f"   ❌ Failed to create student: {create_response.status_code}")
            return
        
        # Wait for prediction generation
        time.sleep(2)
        
        # Check if prediction was created
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        create_prediction = next((p for p in predictions if p['student_id'] == student_id), None)
        
        if create_prediction:
            print(f"   ✅ CREATE Prediction Generated: {create_prediction['predicted_performance']}")
        else:
            print(f"   ❌ CREATE Prediction NOT generated")
        
        # TEST 2: UPDATE existing student
        print("\n2️⃣ Testing UPDATE operation...")
        
        # Update student data
        update_data = {
            "attendance_percentage": 95.0,
            "internal_marks": 92.0,
            "previous_gpa": 3.8,
            "study_hours": 30.0
        }
        
        update_response = requests.put(f'http://localhost:8004/api/students/{student_id}', json=update_data)
        
        if update_response.status_code == 200:
            updated_student = update_response.json()
            print(f"   ✅ Student Updated: {updated_student['name']}")
        else:
            print(f"   ❌ Failed to update student: {update_response.status_code}")
        
        # Wait for prediction generation
        time.sleep(2)
        
        # Check if new prediction was generated for update
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        updated_predictions = predictions_response.json()
        
        # Find the latest prediction for this student
        student_predictions = [p for p in updated_predictions if p['student_id'] == student_id]
        
        if len(student_predictions) > 1:
            print(f"   ✅ UPDATE Prediction Generated! Total predictions: {len(student_predictions)}")
            latest_prediction = max(student_predictions, key=lambda x: x.get('created_at', ''))
            print(f"   📈 Latest Performance: {latest_prediction['predicted_performance']}")
        elif len(student_predictions) == 1:
            print(f"   ⚠️  Only 1 prediction found - UPDATE may not have generated new one")
            print(f"   📈 Performance: {student_predictions[0]['predicted_performance']}")
        else:
            print(f"   ❌ No predictions found after update")
        
        # TEST 3: Admin Dashboard Data Flow
        print("\n3️⃣ Testing Admin Dashboard Data Flow...")
        
        # Get students and predictions
        students_response = requests.get('http://localhost:8004/api/students/')
        students = students_response.json()
        
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        # Match students with predictions (admin dashboard logic)
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
        
        # Find our test student
        test_match = next((m for m in matched_predictions if m['studentId'] == student_id), None)
        
        if test_match:
            print(f"   ✅ Student found in admin dashboard!")
            print(f"   📊 Performance: {test_match['prediction']['predicted_performance']}")
            print(f"   ⚠️  Risk Score: {test_match['prediction']['risk_score']}")
        else:
            print(f"   ❌ Student NOT found in admin dashboard data!")
        
        # Cleanup
        print(f"\n4️⃣ Cleaning up test student...")
        delete_response = requests.delete(f'http://localhost:8004/api/students/{student_id}')
        if delete_response.status_code == 200:
            print("   ✅ Test student cleaned up")
        
        print(f"\n🎉 Test completed!")
        print(f"📊 Total matched predictions in system: {len(matched_predictions)}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_create_and_update_predictions()
