from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from datetime import datetime
from app.models import Student, Prediction, User

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/student_performance")

client = AsyncIOMotorClient(MONGODB_URL)
database = client.student_performance

async def init_db():
    """Initialize MongoDB connection and Beanie ODM"""
    print("Connecting to MongoDB...")
    try:
        # Test the connection
        await client.admin.command('ping')
        await init_beanie(database=database, document_models=[Student, Prediction, User])
        print("MongoDB connected successfully!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        print("Continuing without database connection...")
        # Don't raise exception, let the app start without DB

# Database CRUD operations
async def get_student(student_id: str):
    return await Student.get(student_id)

async def get_students(skip: int = 0, limit: int = 100):
    return await Student.find().skip(skip).limit(limit).to_list()

async def create_student(student_data):
    student = Student(**student_data)
    await student.insert()
    return student

async def update_student(student_id: str, update_data):
    student = await Student.get(student_id)
    if student:
        for key, value in update_data.items():
            setattr(student, key, value)
        student.updated_at = datetime.utcnow()
        await student.save()
    return student

async def delete_student(student_id: str):
    student = await Student.get(student_id)
    if student:
        await student.delete()
        return True
    return False

async def create_prediction(prediction_data):
    prediction = Prediction(**prediction_data)
    await prediction.insert()
    return prediction

async def get_predictions_by_student(student_id: str):
    return await Prediction.find(Prediction.student_id == student_id).to_list()

# User CRUD operations
async def get_user_by_email(email: str):
    return await User.find_one(User.email == email)

async def create_user(user_data):
    user = User(**user_data)
    await user.insert()
    return user

async def get_user_by_id(user_id: str):
    return await User.get(user_id)

async def get_users(skip: int = 0, limit: int = 100):
    return await User.find().skip(skip).limit(limit).to_list()

def get_database():
    """Return database instance for chatbot"""
    return database
