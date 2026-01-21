#!/usr/bin/env python3
"""
Create test students that match the prediction IDs
"""
import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import init_db, create_student
from app.schemas import StudentCreate

async def create_test_students():
    """Create test students that match prediction IDs"""
    
    # Initialize database
    await init_db()
    
    # Test students matching the prediction IDs
    test_students = [
        StudentCreate(
            name="John Doe",
            email="john@example.com",
            user_id="user123",
            enrollment_year=2022,
            major="Computer Science",
            attendance_percentage=95.0,
            internal_marks=88.0,
            assignment_scores=92.0,
            lab_performance=90.0,
            previous_gpa=3.8,
            study_hours=30.0,
            socio_academic_factors={"family_support": "high", "extracurricular": 2},
            participation_metrics=85.0
        ),
        StudentCreate(
            name="Jane Smith",
            email="jane@example.com",
            user_id="user456",
            enrollment_year=2021,
            major="Data Science",
            attendance_percentage=80.0,
            internal_marks=75.0,
            assignment_scores=78.0,
            lab_performance=82.0,
            previous_gpa=3.2,
            study_hours=20.0,
            socio_academic_factors={"family_support": "medium", "extracurricular": 1},
            participation_metrics=70.0
        ),
        StudentCreate(
            name="Bob Johnson",
            email="bob@example.com",
            user_id="user789",
            enrollment_year=2023,
            major="Information Technology",
            attendance_percentage=60.0,
            internal_marks=65.0,
            assignment_scores=62.0,
            lab_performance=58.0,
            previous_gpa=2.4,
            study_hours=15.0,
            socio_academic_factors={"family_support": "low", "extracurricular": 0},
            participation_metrics=45.0
        ),
        StudentCreate(
            name="Alice Brown",
            email="alice@example.com",
            user_id="user101",
            enrollment_year=2022,
            major="Cybersecurity",
            attendance_percentage=85.0,
            internal_marks=80.0,
            assignment_scores=83.0,
            lab_performance=87.0,
            previous_gpa=3.5,
            study_hours=25.0,
            socio_academic_factors={"family_support": "high", "extracurricular": 2},
            participation_metrics=75.0
        )
    ]
    
    print("👥 Creating test students...")
    
    for i, student_data in enumerate(test_students):
        try:
            # Use the same IDs as predictions
            student_ids = ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
            
            # Create student with specific ID
            student_dict = student_data.model_dump()
            student_dict['_id'] = student_ids[i]
            
            result = await create_student(student_dict)
            print(f"✅ Created student: {student_data.name}")
            
        except Exception as e:
            print(f"❌ Error creating student {student_data.name}: {e}")
    
    print("\n🎉 Test students created successfully!")
    print("Admin dashboard should now show students with AI predictions.")

if __name__ == "__main__":
    asyncio.run(create_test_students())
