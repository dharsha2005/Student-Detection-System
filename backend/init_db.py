from app.database import engine, Base
from app import models  # Import models to ensure tables are created

# Create all tables
Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")