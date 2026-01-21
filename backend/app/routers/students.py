from fastapi import APIRouter, HTTPException
from app import crud, models, schemas
import requests

router = APIRouter()

async def generate_prediction_for_student(student_data):
    """Generate AI prediction for a new student"""
    try:
        # Call ML service to generate prediction
        prediction_request = {
            "student_id": str(student_data.get('_id')),
            "attendance_percentage": student_data.get('attendance_percentage', 0),
            "internal_marks": student_data.get('internal_marks', 0),
            "assignment_scores": student_data.get('assignment_scores', 0),
            "lab_performance": student_data.get('lab_performance', 0),
            "previous_gpa": student_data.get('previous_gpa', 0),
            "study_hours": student_data.get('study_hours', 0),
            "socio_academic_factors": student_data.get('socio_academic_factors', {}),
            "participation_metrics": student_data.get('participation_metrics', 0)
        }
        
        response = requests.post("http://localhost:8002/api/predict", json=prediction_request, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        # Save prediction to database
        prediction_record = schemas.PredictionCreate(
            student_id=str(student_data.get('_id')),
            predicted_performance=result["predicted_performance"],
            risk_score=result["risk_score"],
            recommendations=result["recommendations"]
        )
        await crud.create_prediction(prediction=prediction_record)
        print(f"✅ Generated AI prediction for new student: {student_data.get('name')}")
        
    except Exception as e:
        print(f"⚠️  Could not generate AI prediction for {student_data.get('name')}: {e}")

@router.post("/", response_model=schemas.Student)
async def create_student(student: schemas.StudentCreate):
    # Create student first
    new_student = await crud.create_student(student=student)
    
    # Generate AI prediction for the new student
    try:
        # Convert student to dict for ML service
        student_data = {
            '_id': str(new_student.id),
            'name': new_student.name,
            'attendance_percentage': new_student.attendance_percentage,
            'internal_marks': new_student.internal_marks,
            'assignment_scores': new_student.assignment_scores,
            'lab_performance': new_student.lab_performance,
            'previous_gpa': new_student.previous_gpa,
            'study_hours': new_student.study_hours,
            'socio_academic_factors': new_student.socio_academic_factors,
            'participation_metrics': new_student.participation_metrics
        }
        
        await generate_prediction_for_student(student_data)
        print(f"✅ Generated AI prediction for new student: {new_student.name}")
    except Exception as e:
        print(f"⚠️  Could not generate AI prediction for {new_student.name}: {e}")
    
    return new_student

@router.get("/{student_id}", response_model=schemas.Student)
async def read_student(student_id: str):
    db_student = await crud.get_student(student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student

@router.get("/by-user/{user_id}", response_model=schemas.Student)
async def get_student_by_user_id(user_id: str):
    # Find student by user_id
    students = await crud.get_students()
    student = next((s for s in students if s.user_id == user_id), None)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/", response_model=list[schemas.Student])
async def read_students(skip: int = 0, limit: int = 100):
    students = await crud.get_students(skip=skip, limit=limit)
    return students

@router.put("/{student_id}", response_model=schemas.Student)
async def update_student(student_id: str, student: schemas.StudentUpdate):
    db_student = await crud.update_student(student_id=student_id, student=student)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Generate AI prediction for the updated student
    try:
        # Convert student to dict for ML service
        student_data = {
            '_id': str(db_student.id),
            'name': db_student.name,
            'attendance_percentage': db_student.attendance_percentage,
            'internal_marks': db_student.internal_marks,
            'assignment_scores': db_student.assignment_scores,
            'lab_performance': db_student.lab_performance,
            'previous_gpa': db_student.previous_gpa,
            'study_hours': db_student.study_hours,
            'socio_academic_factors': db_student.socio_academic_factors,
            'participation_metrics': db_student.participation_metrics
        }
        
        await generate_prediction_for_student(student_data)
        print(f"✅ Generated AI prediction for updated student: {db_student.name}")
    except Exception as e:
        print(f"⚠️  Could not generate AI prediction for updated student {db_student.name}: {e}")
    
    return db_student

@router.delete("/{student_id}")
async def delete_student(student_id: str):
    success = await crud.delete_student(student_id=student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted"}

@router.get("/count")
async def get_students_count():
    students = await crud.get_students()
    return {"count": len(students)}