from fastapi import APIRouter

from app.api.v1.endpoints import user_api
from app.api.v1.endpoints import resumes
from app.api.v1.endpoints import analysis
from app.api.v1.endpoints import jobs

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

# 3. Register Analysis Router
api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["analysis"]
)

# 4. Register Jobs Router
api_router.include_router(
    jobs.router,
    prefix="/jobs",
    tags=["jobs"]
)