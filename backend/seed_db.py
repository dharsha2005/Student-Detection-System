import asyncio
from app.database import init_db
from app import models

# Sample student data
sample_students = [
    {
        "name": "John Doe",
        "email": "john.doe@university.edu",
        "major": "Computer Science",
        "enrollment_year": 2022,
        "attendance_percentage": 85.5,
        "internal_marks": 78.0,
        "assignment_scores": 82.0,
        "lab_performance": 80.0,
        "previous_gpa": 3.2,
        "study_hours": 25,
        "socio_academic_factors": {"family_income": "medium", "parent_education": "college"},
        "participation_metrics": 90.0
    },
    {
        "name": "Jane Smith",
        "email": "jane.smith@university.edu",
        "major": "Data Science",
        "enrollment_year": 2022,
        "attendance_percentage": 92.0,
        "internal_marks": 88.0,
        "assignment_scores": 85.0,
        "lab_performance": 87.0,
        "previous_gpa": 3.6,
        "study_hours": 30,
        "socio_academic_factors": {"family_income": "high", "parent_education": "graduate"},
        "participation_metrics": 95.0
    },
    {
        "name": "Bob Johnson",
        "email": "bob.johnson@university.edu",
        "major": "Information Technology",
        "enrollment_year": 2023,
        "attendance_percentage": 75.0,
        "internal_marks": 65.0,
        "assignment_scores": 70.0,
        "lab_performance": 68.0,
        "previous_gpa": 2.8,
        "study_hours": 18,
        "socio_academic_factors": {"family_income": "low", "parent_education": "high_school"},
        "participation_metrics": 75.0
    },
    {
        "name": "Alice Brown",
        "email": "alice.brown@university.edu",
        "major": "Software Engineering",
        "enrollment_year": 2021,
        "attendance_percentage": 88.0,
        "internal_marks": 82.0,
        "assignment_scores": 84.0,
        "lab_performance": 83.0,
        "previous_gpa": 3.4,
        "study_hours": 28,
        "socio_academic_factors": {"family_income": "medium", "parent_education": "college"},
        "participation_metrics": 88.0
    },
    {
        "name": "Charlie Wilson",
        "email": "charlie.wilson@university.edu",
        "major": "Computer Science",
        "enrollment_year": 2023,
        "attendance_percentage": 78.0,
        "internal_marks": 72.0,
        "assignment_scores": 75.0,
        "lab_performance": 74.0,
        "previous_gpa": 3.0,
        "study_hours": 22,
        "socio_academic_factors": {"family_income": "medium", "parent_education": "college"},
        "participation_metrics": 82.0
    }
]

async def seed_database():
    await init_db()

    # Check if data already exists
    existing_students = await models.Student.find().to_list()
    if existing_students:
        print("Database already seeded. Skipping...")
        return

    # Insert sample students
    for student_data in sample_students:
        student = models.Student(**student_data)
        await student.insert()
        print(f"Inserted student: {student.name}")

    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())