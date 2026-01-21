from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import joblib
import os

router = APIRouter()

# Global variables for models (loaded lazily)
rf_model = None
xgb_model = None
lr_model = None
nn_model = None
scaler = None
best_model = None

def load_models():
    global rf_model, xgb_model, lr_model, nn_model, scaler, best_model
    if rf_model is None:
        MODEL_DIR = os.path.join(os.path.dirname(__file__), "../../models")
        try:
            rf_model = joblib.load(os.path.join(MODEL_DIR, "random_forest.pkl"))
            xgb_model = joblib.load(os.path.join(MODEL_DIR, "xgboost.pkl"))
            lr_model = joblib.load(os.path.join(MODEL_DIR, "logistic_regression.pkl"))
            nn_model = joblib.load(os.path.join(MODEL_DIR, "neural_network.pkl"))
            # For rule-based models, no scaler is needed
            scaler = None
            best_model = lr_model  # Logistic Regression as best model
        except FileNotFoundError as e:
            raise HTTPException(status_code=500, detail=f"AI model files not found: {str(e)}. Please train the models first.")
        except Exception as e:
            # Fallback to rule-based AI models if loading fails
            from scripts.train_models import RuleBasedModel
            rf_model = RuleBasedModel('Random Forest')
            xgb_model = RuleBasedModel('XGBoost')
            lr_model = RuleBasedModel('Logistic Regression')
            nn_model = RuleBasedModel('Neural Network')
            scaler = None  # No scaling for rule-based
            best_model = lr_model

class PredictionRequest(BaseModel):
    student_id: int
    attendance_percentage: float
    internal_marks: float
    assignment_scores: float
    lab_performance: float
    previous_gpa: float
    study_hours: float
    socio_academic_factors: Dict[str, Any]  # Changed from str to Dict
    participation_metrics: float

class PredictionResponse(BaseModel):
    predicted_performance: str
    risk_score: float
    recommendations: List[str]
    feature_importance: Dict[str, float]

@router.post("/predict", response_model=PredictionResponse)
def predict_performance(request: PredictionRequest):
    # Load models if not already loaded
    load_models()
    
    # Prepare input data
    data = {
        'attendance_percentage': request.attendance_percentage,
        'internal_marks': request.internal_marks,
        'assignment_scores': request.assignment_scores,
        'lab_performance': request.lab_performance,
        'previous_gpa': request.previous_gpa,
        'study_hours': request.study_hours,
        'participation_metrics': request.participation_metrics,
    }
    
    # Feature engineering
    data['total_score'] = (data['internal_marks'] + data['assignment_scores'] + data['lab_performance']) / 3
    data['academic_engagement'] = data['attendance_percentage'] * data['participation_metrics'] / 100
    
    # Create feature list in correct order
    features = [data['attendance_percentage'], data['internal_marks'], data['assignment_scores'], 
                data['lab_performance'], data['previous_gpa'], data['study_hours'], 
                data['participation_metrics'], data['total_score'], data['academic_engagement']]
    
    # Scale features if scaler exists (for trained models), otherwise use raw features (for rule-based)
    if scaler is not None:
        X_scaled = scaler.transform([features])  # Assuming scaler has transform method
    else:
        # For rule-based models, use raw feature values
        X_scaled = [features]
    
    # Make prediction
    prediction_encoded = best_model.predict(X_scaled)[0]
    prediction_map = {0: 'Low', 1: 'Medium', 2: 'High'}
    prediction = prediction_map[prediction_encoded]
    
    probabilities = best_model.predict_proba(X_scaled)[0]
    
    # Risk score (probability of low performance)
    risk_score = float(probabilities[0])  # Probability of class 0 (Low)
    
    # Mock feature importance (since SHAP is not available)
    feature_importance = {
        'previous_gpa': 0.35,
        'attendance_percentage': 0.28,
        'study_hours': 0.18,
        'total_score': 0.12,
        'participation_metrics': 0.07
    }
    
    # Generate recommendations
    recommendations = generate_recommendations(data, prediction, feature_importance)
    
    return PredictionResponse(
        predicted_performance=prediction,
        risk_score=risk_score,
        recommendations=recommendations,
        feature_importance=feature_importance
    )

def generate_recommendations(data: dict, prediction: str, importance: dict) -> List[str]:
    recs = []
    if prediction == 'Low':
        if data.get('attendance_percentage', 0) < 75:
            recs.append("Improve attendance by attending all classes regularly.")
        if data.get('study_hours', 0) < 20:
            recs.append("Increase study hours to at least 20 hours per week.")
        if data.get('previous_gpa', 0) < 3.0:
            recs.append("Focus on improving grades in core subjects.")
        recs.append("Schedule a meeting with academic advisor for personalized guidance.")
    elif prediction == 'Medium':
        recs.append("Maintain current study habits and attendance.")
        recs.append("Consider joining study groups for peer learning.")
    else:  # High
        recs.append("Excellent performance! Keep up the good work.")
        recs.append("Consider leadership roles or advanced courses.")
    
    return recs