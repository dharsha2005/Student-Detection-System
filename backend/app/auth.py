from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import User
from app.database import get_user_by_email
from passlib.context import CryptContext
from typing import Optional

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get the current authenticated user"""
    token = credentials.credentials
    
    # For this system, we'll use email as the token (simplified approach)
    # In production, you'd want to use proper JWT tokens
    try:
        user = await get_user_by_email(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current active user"""
    return current_user

# Alternative authentication method for chatbot that doesn't require tokens
async def get_current_user_chat(email: str = None) -> Optional[User]:
    """Get user by email for chatbot (simplified auth)"""
    if not email:
        return None
    try:
        user = await get_user_by_email(email)
        return user
    except Exception:
        return None
