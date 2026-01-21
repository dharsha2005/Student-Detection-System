from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app import crud
from app.models import User
from datetime import datetime

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime

def hash_password(password: str):
    print(f"Original password length: {len(password)}")
    # Truncate password to 72 characters max for bcrypt
    if len(password) > 72:
        print(f"Truncating password from {len(password)} to 72")
        password = password[:72]
    print(f"Final password length: {len(password)}")
    print(f"Final password: '{password}'")
    try:
        result = pwd_context.hash(password)
        print(f"Hash successful, length: {len(result)}")
        return result
    except Exception as e:
        print(f"Hash error: {e}")
        print(f"Error type: {type(e)}")
        # If bcrypt still fails, use a simple hash for testing
        import hashlib
        fallback_hash = hashlib.sha256(password.encode()).hexdigest()
        print(f"Using fallback hash: {fallback_hash[:20]}...")
        return fallback_hash

def verify_password(plain_password: str, hashed_password: str):
    try:
        # Try bcrypt first
        return pwd_context.verify(plain_password, hashed_password)
    except:
        # If bcrypt fails, try SHA256 fallback
        import hashlib
        sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        return sha256_hash == hashed_password

@router.get("/test")
async def test_endpoint():
    return {"message": "Auth router is working"}

@router.post("/register")
async def register(user: UserCreate):
    print(f"Registering user: {user.email}")
    print(f"Password length: {len(user.password)}")
    
    # Use real MongoDB database
    try:
        # Check if user already exists
        existing_user = await crud.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password with length limit
        hashed_password = hash_password(user.password)
        print(f"Hashed password length: {len(hashed_password)}")
        
        # Create user in database
        user_data = {
            "name": user.name,
            "email": user.email,
            "password": hashed_password,
            "role": user.role
        }
        
        db_user = await crud.create_user(user_data)
        print(f"User created with ID: {db_user.id}")
        
        return UserResponse(
            id=str(db_user.id),
            name=db_user.name,
            email=db_user.email,
            role=db_user.role,
            created_at=db_user.created_at
        )
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(user: UserLogin):
    print(f"Login attempt for email: {user.email}")
    # Use real MongoDB database
    try:
        # Find user by email
        print(f"Looking up user in database...")
        db_user = await crud.get_user_by_email(user.email)
        print(f"User lookup result: {bool(db_user)}")
        
        if not db_user:
            print(f"User not found: {user.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(f"User found: {db_user.name}")
        print(f"Verifying password...")
        
        # Verify password
        password_valid = verify_password(user.password, db_user.password)
        print(f"Password verification result: {password_valid}")
        
        if not password_valid:
            print(f"Invalid password for user: {user.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(f"Login successful for: {user.email}")
        
        return UserResponse(
            id=str(db_user.id),
            name=db_user.name,
            email=db_user.email,
            role=db_user.role,
            created_at=db_user.created_at
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        print(f"Login error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/me")
async def get_current_user(user_id: str):
    user = await crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user.created_at
    )
