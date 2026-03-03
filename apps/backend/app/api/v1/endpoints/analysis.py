"""
Analysis API endpoints.

GET  /api/v1/analyses/latest — return the most recent audit result for the authenticated user
POST /api/v1/analyses/audit  — run a heuristic ATS audit of a resume against a job description
GET  /api/v1/analyses/{id}   — retrieve a previously computed audit result by ID
"""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.schemas.analysis_schema import AuditRequest, AnalysisResultRead
from app.services.analysis_service import run_audit, get_audit_result, get_latest_audit_result, list_audit_results

router = APIRouter()


@router.get(
    "",
    response_model=list[AnalysisResultRead],
    status_code=status.HTTP_200_OK,
    summary="List audit results",
    description="Return a paginated list of ATS audit results for the authenticated user, newest first.",
)
async def list_audit_results_endpoint(
    skip: int = Query(0, ge=0, description="Number of results to skip."),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results to return."),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[AnalysisResultRead]:
    return list_audit_results(user_id=current_user_id, db=db, skip=skip, limit=limit)


@router.get(
    "/latest",
    response_model=AnalysisResultRead | None,
    status_code=status.HTTP_200_OK,
    summary="Get latest audit result",
    description="Return the most recent ATS audit result for the authenticated user, or null if none exist.",
)
async def get_latest_audit_result_endpoint(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> AnalysisResultRead | None:
    return get_latest_audit_result(user_id=current_user_id, db=db)


@router.post(
    "/audit",
    response_model=AnalysisResultRead,
    status_code=status.HTTP_200_OK,
    summary="Run ATS audit",
    description=(
        "Analyse a resume against a job description using rule-based heuristics. "
        "Returns keyword, section, and formatting scores together with actionable suggestions. "
        "Identical (resume, job description) combinations return a cached result."
    ),
)
async def run_audit_endpoint(
    payload: AuditRequest,
    ai_enhance: bool = Query(
        False,
        description="Set to true to enable opt-in LLM-powered career-coach feedback.",
    ),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> AnalysisResultRead:
    return run_audit(
        user_id=current_user_id,
        resume_id=payload.resume_id,
        job_description_text=payload.job_description,
        job_title=payload.job_title,
        db=db,
        ai_enhance=ai_enhance,
    )


@router.get(
    "/{result_id}",
    response_model=AnalysisResultRead,
    status_code=status.HTTP_200_OK,
    summary="Get audit result",
    description="Retrieve a previously computed ATS audit result by its ID.",
)
async def get_audit_result_endpoint(
    result_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> AnalysisResultRead:
    return get_audit_result(
        result_id=result_id,
        user_id=current_user_id,
        db=db,
    )
