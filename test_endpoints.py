import requests

# Test students endpoint
students_response = requests.get('http://localhost:8004/api/students/')
print(f"Students Status: {students_response.status_code}")

if students_response.status_code == 200:
    students = students_response.json()
    print(f"Found {len(students)} students:")
    for s in students[:4]:
        print(f"- {s['name']} ({s['email']})")
else:
    print("Error fetching students")

print("\n" + "="*50)

# Test predictions endpoint
predictions_response = requests.get('http://localhost:8004/api/predictions/')
print(f"Predictions Status: {predictions_response.status_code}")

if predictions_response.status_code == 200:
    predictions = predictions_response.json()
    print(f"Found {len(predictions)} predictions:")
    for p in predictions[:2]:
        print(f"- {p['student_id']}: {p['predicted_performance']} (Risk: {p['risk_score']})")
else:
    print("Error fetching predictions")
