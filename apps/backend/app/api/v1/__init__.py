from fastapi import APIRouter

from app.api.v1.endpoints import user_api
from app.api.v1.endpoints import resumes  

api_router = APIRouter()

# 1. Register Users Router
api_router.include_router(
    user_api.router, 
    prefix="/users", 
    tags=["users"]
)

# 2. Register Resumes Router
api_router.include_router(
    resumes.router, 
    prefix="/resumes", 
    tags=["resumes"]
)