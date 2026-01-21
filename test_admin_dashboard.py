import requests

# Test admin dashboard data flow
print("🔍 Testing Admin Dashboard Data Flow...")
print("=" * 50)

# 1. Get students
students_response = requests.get('http://localhost:8004/api/students/')
students = students_response.json()
print(f"✅ Found {len(students)} students")

# 2. Get predictions  
predictions_response = requests.get('http://localhost:8004/api/predictions/')
predictions = predictions_response.json()
print(f"✅ Found {len(predictions)} predictions")

# 3. Match students with predictions (same logic as admin dashboard)
matched_predictions = []
for student in students:
    student_id = student.get('_id')
    prediction = next((p for p in predictions if p['student_id'] == student_id), None)
    
    if prediction:
        matched_predictions.append({
            'studentId': student_id,
            'student': student,
            'prediction': prediction
        })

print(f"✅ Matched {len(matched_predictions)} students with predictions")

# 4. Show matches
print("\n📊 Student-Prediction Matches:")
for match in matched_predictions[:4]:
    student = match['student']
    prediction = match['prediction']
    print(f"- {student['name']}: {prediction['predicted_performance']} (Risk: {prediction['risk_score']})")

# 5. Calculate stats like admin dashboard
total_students = len(students)
at_risk = len([p for p in matched_predictions if p['prediction']['risk_score'] >= 0.6])
high_performers = len([p for p in matched_predictions if p['prediction']['predicted_performance'] == 'High'])

print(f"\n📈 Admin Dashboard Stats:")
print(f"- Total Students: {total_students}")
print(f"- At-Risk Students: {at_risk}")
print(f"- High Performers: {high_performers}")

print(f"\n🎉 Admin Dashboard is ready to show AI predictions!")
