from fastapi import APIRouter, HTTPException
import requests
from app import crud, models, schemas

router = APIRouter()

ML_SERVICE_URL = "http://localhost:8002"  # ML microservice URL

@router.post("/predict", response_model=schemas.PredictionResponse)
async def predict_performance(prediction: schemas.PredictionRequest):
    # Call ML service
    try:
        response = requests.post(f"{ML_SERVICE_URL}/api/predict", json=prediction.dict())
        response.raise_for_status()
        result = response.json()

        # Save prediction to DB
        prediction_record = schemas.PredictionCreate(
            student_id=prediction.student_id,
            predicted_performance=result["predicted_performance"],
            risk_score=result["risk_score"],
            recommendations=result["recommendations"]
        )
        await crud.create_prediction(prediction=prediction_record)

        return result
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ML service error: {str(e)}")

@router.get("/", response_model=list[schemas.Prediction])
async def get_all_predictions():
    """Get all predictions"""
    predictions = await crud.get_all_predictions()
    return predictions

@router.get("/history/{student_id}", response_model=list[schemas.Prediction])
async def get_prediction_history(student_id: str):
    return await crud.get_predictions_by_student(student_id=student_id)