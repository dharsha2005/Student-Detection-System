#!/usr/bin/env python3
"""
Final test to simulate the exact frontend academic details flow
"""
import requests
import json
import time

def test_frontend_academic_details_flow():
    """Test the exact flow that happens when a user enters academic details"""
    
    print("🎓 Testing Frontend Academic Details Flow")
    print("=" * 60)
    
    # Simulate user data (like from AuthContext)
    user_data = {
        "id": "user123456",
        "name": "John Student",
        "email": "johnstudent@example.com"
    }
    
    # Simulate academic details form data
    academic_data = {
        "major": "Computer Science",
        "enrollment_year": 2024,
        "attendance_percentage": 85.0,
        "internal_marks": 78.0,
        "assignment_scores": 82.0,
        "lab_performance": 88.0,
        "previous_gpa": 3.4,
        "study_hours": 25.0,
        "participation_metrics": 75.0
    }
    
    try:
        # Step 1: Check if student exists (like frontend does)
        print("1️⃣ Checking if student exists...")
        try:
            existing_student = requests.get(f'http://localhost:8004/api/students/by-user/{user_data["id"]}')
            
            if existing_student.status_code == 200 and existing_student.json():
                print(f"   ✅ Found existing student")
                student_id = existing_student.json()['_id']
                
                # Step 2: Update existing student (like frontend does)
                print("2️⃣ Updating existing student...")
                update_data = {
                    "name": user_data["name"],
                    "email": user_data["email"],
                    **academic_data,
                    "socio_academic_factors": {
                        "family_income": "medium",
                        "parent_education": "college"
                    }
                }
                
                update_response = requests.put(f'http://localhost:8004/api/students/{student_id}', json=update_data)
                
                if update_response.status_code == 200:
                    print(f"   ✅ Student updated successfully")
                    updated_student = update_response.json()
                else:
                    print(f"   ❌ Update failed: {update_response.status_code}")
                    return
            else:
                print(f"   🆕 No existing student found - creating new one")
                
                # Step 3: Create new student (like frontend does)
                print("3️⃣ Creating new student...")
                create_data = {
                    "user_id": user_data["id"],
                    "name": user_data["name"],
                    "email": user_data["email"],
                    **academic_data,
                    "socio_academic_factors": {
                        "family_income": "medium",
                        "parent_education": "college"
                    }
                }
                
                create_response = requests.post('http://localhost:8004/api/students/', json=create_data)
                
                if create_response.status_code == 200:
                    print(f"   ✅ Student created successfully")
                    created_student = create_response.json()
                    student_id = created_student['_id']
                else:
                    print(f"   ❌ Create failed: {create_response.status_code}")
                    print(f"   Response: {create_response.text}")
                    return
        except Exception as e:
            print(f"   ❌ Error checking existing student: {e}")
            return
        
        # Step 4: Wait for automatic prediction generation
        print("\n4️⃣ Waiting for automatic AI prediction generation...")
        time.sleep(3)
        
        # Step 5: Check if prediction was generated
        print("5️⃣ Checking for AI prediction...")
        
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        student_prediction = next((p for p in predictions if p['student_id'] == student_id), None)
        
        if student_prediction:
            print(f"   ✅ AI Prediction Generated Automatically!")
            print(f"   📈 Performance: {student_prediction['predicted_performance']}")
            print(f"   ⚠️  Risk Score: {student_prediction['risk_score']}")
            print(f"   💡 Recommendations: {len(student_prediction['recommendations'])} items")
            print(f"   📅 Created: {student_prediction['created_at']}")
        else:
            print(f"   ❌ No AI Prediction Found!")
            return
        
        # Step 6: Test Admin Dashboard Data Flow
        print("\n6️⃣ Testing Admin Dashboard Data Flow...")
        
        # Get all students and predictions (admin dashboard logic)
        students_response = requests.get('http://localhost:8004/api/students/')
        students = students_response.json()
        
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        predictions = predictions_response.json()
        
        # Match students with predictions
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
            print(f"   ✅ Student appears in Admin Dashboard!")
            print(f"   👤 Student: {test_match['student']['name']} ({test_match['student']['email']})")
            print(f"   📊 Performance: {test_match['prediction']['predicted_performance']}")
            print(f"   ⚠️  Risk Level: {'High' if test_match['prediction']['risk_score'] > 0.6 else 'Medium' if test_match['prediction']['risk_score'] > 0.3 else 'Low'}")
            print(f"   💡 Has {len(test_match['prediction']['recommendations'])} recommendations")
        else:
            print(f"   ❌ Student NOT found in admin dashboard!")
        
        print(f"\n🎉 Frontend Academic Details Flow Test COMPLETED!")
        print(f"📊 Total students with predictions in admin dashboard: {len(matched_predictions)}")
        
        # Cleanup
        print(f"\n7️⃣ Cleaning up test student...")
        delete_response = requests.delete(f'http://localhost:8004/api/students/{student_id}')
        if delete_response.status_code == 200:
            print("   ✅ Test student cleaned up")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_frontend_academic_details_flow()
