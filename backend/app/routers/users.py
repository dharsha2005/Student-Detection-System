from fastapi import APIRouter, HTTPException
from app import crud, models, schemas

router = APIRouter()

@router.get("/", response_model=list[schemas.User])
async def read_users(skip: int = 0, limit: int = 100):
    users = await crud.get_users(skip=skip, limit=limit)
    return users