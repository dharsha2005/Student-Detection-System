#!/usr/bin/env python3
"""
Test script to verify AI prediction fixes
"""
import requests
import json

def test_ml_service_prediction():
    """Test the ML service prediction endpoint"""
    
    # Test data matching the frontend structure
    test_data = {
        "student_id": "123",  # Changed to string
        "attendance_percentage": 85.0,
        "internal_marks": 78.0,
        "assignment_scores": 82.0,
        "lab_performance": 88.0,
        "previous_gpa": 3.5,
        "study_hours": 25.0,
        "socio_academic_factors": {
            "family_support": "high",
            "extracurricular": 2
        },
        "participation_metrics": 75.0
    }
    
    try:
        # Test direct ML service call
        print("Testing ML service prediction...")
        response = requests.post(
            "http://localhost:8002/api/predict",
            json=test_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ ML Service Prediction Successful!")
            print(f"Performance: {result.get('predicted_performance')}")
            print(f"Risk Score: {result.get('risk_score')}")
            print(f"Recommendations: {result.get('recommendations')}")
            return True
        else:
            print(f"❌ ML Service Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ML Service not running on port 8002")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_backend_prediction():
    """Test the backend prediction endpoint"""
    
    test_data = {
        "student_id": "123",
        "attendance_percentage": 85.0,
        "internal_marks": 78.0,
        "assignment_scores": 82.0,
        "lab_performance": 88.0,
        "previous_gpa": 3.5,
        "study_hours": 25.0,
        "socio_academic_factors": {
            "family_support": "high",
            "extracurricular": 2
        },
        "participation_metrics": 75.0
    }
    
    try:
        print("\nTesting Backend prediction endpoint...")
        response = requests.post(
            "http://localhost:8004/api/predictions/predict",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Backend Prediction Successful!")
            print(f"Performance: {result.get('predicted_performance')}")
            print(f"Risk Score: {result.get('risk_score')}")
            print(f"Recommendations: {result.get('recommendations')}")
            return True
        else:
            print(f"❌ Backend Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend Service not running on port 8004")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing AI Prediction Fixes...")
    print("=" * 50)
    
    ml_success = test_ml_service_prediction()
    backend_success = test_backend_prediction()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"ML Service: {'✅ PASS' if ml_success else '❌ FAIL'}")
    print(f"Backend Service: {'✅ PASS' if backend_success else '❌ FAIL'}")
    
    if ml_success and backend_success:
        print("\n🎉 All tests passed! AI prediction should work correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the service logs.")
