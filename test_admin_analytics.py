#!/usr/bin/env python3
"""
Test Admin Dashboard and Analytics page API endpoints
"""
import requests

def test_admin_analytics_endpoints():
    """Test that admin dashboard and analytics endpoints work correctly"""
    
    print("🔍 Testing Admin Dashboard & Analytics Endpoints")
    print("=" * 60)
    
    try:
        # Test 1: Students endpoint
        print("1️⃣ Testing Students Endpoint...")
        students_response = requests.get('http://localhost:8004/api/students/')
        
        if students_response.status_code == 200:
            students = students_response.json()
            print(f"   ✅ Students endpoint working: {len(students)} students")
        else:
            print(f"   ❌ Students endpoint failed: {students_response.status_code}")
            return
        
        # Test 2: Predictions endpoint
        print("\n2️⃣ Testing Predictions Endpoint...")
        predictions_response = requests.get('http://localhost:8004/api/predictions/')
        
        if predictions_response.status_code == 200:
            predictions = predictions_response.json()
            print(f"   ✅ Predictions endpoint working: {len(predictions)} predictions")
        else:
            print(f"   ❌ Predictions endpoint failed: {predictions_response.status_code}")
            return
        
        # Test 3: Check data matching
        print("\n3️⃣ Testing Data Matching...")
        
        # Match students with predictions
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
        
        print(f"   ✅ Matched {len(matched_predictions)} students with predictions")
        
        # Test 4: Performance distribution data
        print("\n4️⃣ Testing Performance Distribution...")
        
        performance_levels = {
            'High': 0,
            'Medium': 0, 
            'Low': 0
        }
        
        for match in matched_predictions:
            performance = match['prediction']['predicted_performance']
            if performance == 'High':
                performance_levels['High'] += 1
            elif performance == 'Medium':
                performance_levels['Medium'] += 1
            elif performance == 'Low':
                performance_levels['Low'] += 1
        
        print(f"   📊 Performance Distribution:")
        print(f"      High Performance: {performance_levels['High']} students")
        print(f"      Medium Performance: {performance_levels['Medium']} students")
        print(f"      Low Performance: {performance_levels['Low']} students")
        
        # Test 5: Risk distribution data
        print("\n5️⃣ Testing Risk Distribution...")
        
        risk_levels = {
            'Low': 0,
            'Medium': 0,
            'High': 0,
            'Critical': 0
        }
        
        for match in matched_predictions:
            risk_score = match['prediction']['risk_score']
            if risk_score >= 0.75:
                risk_levels['Critical'] += 1
            elif risk_score >= 0.6:
                risk_levels['High'] += 1
            elif risk_score >= 0.4:
                risk_levels['Medium'] += 1
            else:
                risk_levels['Low'] += 1
        
        print(f"   📊 Risk Distribution:")
        print(f"      Low Risk: {risk_levels['Low']} students")
        print(f"      Medium Risk: {risk_levels['Medium']} students")
        print(f"      High Risk: {risk_levels['High']} students")
        print(f"      Critical Risk: {risk_levels['Critical']} students")
        
        # Test 6: Sample data for charts
        print("\n6️⃣ Testing Chart Data Format...")
        
        # Performance distribution data (for Analytics page)
        performance_distribution_data = [
            {'name': 'High Performance', 'value': performance_levels['High'], 'color': '#10B981'},
            {'name': 'Medium Performance', 'value': performance_levels['Medium'], 'color': '#F59E0B'},
            {'name': 'Low Performance', 'value': performance_levels['Low'], 'color': '#EF4444'}
        ]
        performance_distribution_data = [item for item in performance_distribution_data if item['value'] > 0]
        
        # Risk distribution data (for Analytics page)
        risk_distribution_data = [
            {'name': 'Low Risk', 'value': risk_levels['Low'], 'color': '#10B981'},
            {'name': 'Medium Risk', 'value': risk_levels['Medium'], 'color': '#F59E0B'},
            {'name': 'High Risk', 'value': risk_levels['High'], 'color': '#EF4444'},
            {'name': 'Critical Risk', 'value': risk_levels['Critical'], 'color': '#DC2626'}
        ]
        risk_distribution_data = [item for item in risk_distribution_data if item['value'] > 0]
        
        print(f"   ✅ Performance Chart Data: {len(performance_distribution_data)} items")
        for item in performance_distribution_data:
            print(f"      - {item['name']}: {item['value']}")
        
        print(f"   ✅ Risk Chart Data: {len(risk_distribution_data)} items")
        for item in risk_distribution_data:
            print(f"      - {item['name']}: {item['value']}")
        
        print(f"\n🎉 All Admin & Analytics Endpoints Working!")
        print(f"📊 Ready for Admin Dashboard and Analytics page!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_admin_analytics_endpoints()
