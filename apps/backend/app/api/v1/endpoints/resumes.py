import re
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, BackgroundTasks, Response
from sqlmodel import Session
from uuid import UUID
from typing import List

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.logging_config import log_info, log_error, log_warning
from app.db.session import get_db
from app.models.analysis_model import AnalysisResult, Suggestion, SuggestionInteraction, SkillCorrection
from app.models.resume_model import (
    Resume,
    ResumeExperience,
    ResumeEducation,
    ResumeSkill,
    ResumeCertification,
    ResumeProject,
    ResumeCustomSection,
)
from app.schemas.resume_schema import (
    ResumeParseStatusResponse,
    ResumeRead,
    ResumeListItem,
    ResumeCreate,
    ResumeUpdate,
    ResumeComplete,
    ExperienceRead,
    EducationRead,
    SkillRead,
    CertificationRead,
    ProjectRead,
)
from app.services.storage_service import upload_file, delete_file
from app.services.resume_service import (
    parse_resume_background,
    get_parse_status,
    get_active_resume,
    get_resume_complete,
    create_resume,
    duplicate_resume,
)
from app.services.pdf_service import generate_resume_pdf
from sqlmodel import select

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

@router.post("", response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
async def create_resume_endpoint(
    resume_data: ResumeCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new resume with manual data input.
    
    Creates a resume without file upload, allowing manual entry of resume data.
    The resume is immediately marked as "Completed" since no parsing is required.
    Version names must be unique per user.
    
    Requires authentication and user can only create resumes for themselves.
    """
    
    # Ensure user can only create resumes for themselves
    if resume_data.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create resumes for yourself"
        )
    
    try:
        resume = create_resume(db, resume_data)
        log_info(f"Resume created successfully: id={resume.id}, user_id={current_user_id}")
        return resume
    
    except Exception as e:
        error_msg = str(e)
        
        # Handle version name uniqueness violation
        if "Version name already exists" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A resume with this version name already exists. Please choose a different name."
            )
        
        log_error(f"Failed to create resume: user_id={current_user_id}, error={error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create resume"
        )


@router.get("", response_model=List[ResumeListItem], status_code=status.HTTP_200_OK)
async def list_user_resumes(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    """
    Get all resumes for the authenticated user (paginated, lightweight).
    
    Returns a lightweight list of resumes (no raw_text/error_message)
    ordered by creation date (most recent first).
    
    Query params:
        limit: max results (default 50, max 100)
        offset: pagination offset
    """
    limit = min(limit, 100)  # Cap at 100
    try:
        statement = (
            select(Resume)
            .where(
                Resume.user_id == current_user_id,
                Resume.deleted_at.is_(None)
            )
            .order_by(Resume.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        
        resumes = db.exec(statement).all()
        
        log_info(f"Retrieved {len(resumes)} resumes for user: {current_user_id}")
        return resumes
        
    except Exception as e:
        log_error(f"Failed to retrieve resumes for user {current_user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve resumes"
        )


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Uploads a resume file (PDF or DOCX) to Supabase storage and saves metadata to database.
    Triggers background parsing task to extract resume information.
    Requires authentication.
    """
    
    # 1. Validate Size (Before reading content to prevent OOM)
    # Convert MB to Bytes
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    try:
        # Check file size without loading into memory
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
            )
            
        # 2. Read file content
        file_content = await file.read()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read file content"
        )

    # 3. Validate Type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and DOCX are allowed."
        )

    # 4. Generate Unique Path
    # We use UUID to ensure filenames never collide
    file_ext = ".pdf" if file.content_type == "application/pdf" else ".docx"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    destination_path = f"resumes/{unique_filename}"

    # 5. Upload to Storage
    # This helper function (created in Phase 3) handles the Supabase connection
    try:
        log_info(f"Uploading resume: user={current_user_id}, file={file.filename}, size={len(file_content)} bytes")
        
        public_url = upload_file(
            file_data=file_content,
            destination_path=destination_path,
            content_type=file.content_type
        )
        
        log_info(f"Storage upload successful: {destination_path}")
    except Exception as e:
        log_error(f"Storage upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage service"
        )

    # 6. Save Resume Record to Database
    try:
        resume = Resume(
            user_id=current_user_id,
            version_name=file.filename or "Uploaded Resume",
            full_name=None,
            email=None,
            file_path=destination_path,
            file_url=public_url,
            processing_status="Pending"
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
    except Exception as e:
        log_error(f"Database save failed: {str(e)}")
        
        try:
            delete_file(destination_path)
            log_info(f"Cleaned up orphaned file: {destination_path}")
        except Exception as cleanup_error:
            log_error(f"Failed to cleanup file after DB error: {str(cleanup_error)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume metadata to database"
        )

    # 7. Trigger Background Parsing Task
    background_tasks.add_task(
        parse_resume_background,
        resume_id=str(resume.id),
        file_path=destination_path
    )
    log_info(f"Background parsing task queued: resume_id={resume.id}")

    # 8. Return Success Response
    return {
        "id": str(resume.id),
        "url": public_url,
        "filename": file.filename,
        "stored_name": unique_filename,
        "user_id": str(current_user_id),
        "processing_status": "Pending",
        "message": "Resume uploaded successfully. Processing in background."
    }


@router.get(
    "/{resume_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download resume as PDF",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Generated PDF file of the resume",
        }
    },
)
async def download_resume_pdf(
    resume_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Response:
    """
    Generate and download a resume as a PDF document.

    Fetches all structured resume data (personal info, experience,
    education, skills, certifications, projects) and renders it into
    a professionally formatted PDF.

    Args:
        resume_id: UUID of the resume to download
        current_user_id: Authenticated user's ID (from token)
        db: Database session

    Returns:
        PDF file as an attachment with Content-Type: application/pdf

    Raises:
        404: Resume not found or user doesn't have access
        500: PDF generation failed
    """
    # Fetch complete resume data (includes ownership check)
    resume_data = get_resume_complete(
        resume_id=resume_id,
        user_id=current_user_id,
        db=db,
    )

    if not resume_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied",
        )

    try:
        pdf_bytes = generate_resume_pdf(resume_data)
    except Exception as e:
        log_error(f"PDF generation failed for resume {resume_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF",
        )

    # Build a safe filename from the resume's version_name
    resume_obj = resume_data["resume"]
    raw_name = getattr(resume_obj, "version_name", "") or "resume"
    safe_name = re.sub(r'[^\w\s-]', '', raw_name).strip().replace(" ", "_") or "resume"
    filename = f"resume_{safe_name}.pdf"

    log_info(f"Serving PDF download for resume {resume_id} as {filename}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.delete(
    "/all",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete all resumes for current user (TESTING ONLY)"
)
async def delete_all_resumes(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete ALL resumes for the authenticated user (TESTING ONLY).
    
    This is a destructive operation that permanently removes all resumes
    and their associated data (experiences, education, skills, etc.) 
    for the current user. Use with caution!
    
    Args:
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Raises:
        500: Database error during deletion
    """
    try:
        # Get all resume IDs for the user
        resume_stmt = select(Resume.id).where(
            Resume.user_id == current_user_id,
            Resume.deleted_at.is_(None)
        )
        resume_ids = [row for row in db.exec(resume_stmt).all()]
        
        if not resume_ids:
            log_info(f"No resumes to delete for user: {current_user_id}")
            return
        
        # Use bulk delete for better performance
        from sqlmodel import delete as sql_delete
        
        # Delete analysis chain first (interactions → suggestions → analysis results)
        analysis_stmt = select(AnalysisResult.id).where(AnalysisResult.resume_id.in_(resume_ids))
        analysis_ids = [row for row in db.exec(analysis_stmt).all()]
        
        if analysis_ids:
            suggestion_stmt = select(Suggestion.id).where(Suggestion.analysis_id.in_(analysis_ids))
            suggestion_ids = [row for row in db.exec(suggestion_stmt).all()]
            
            if suggestion_ids:
                db.exec(sql_delete(SuggestionInteraction).where(SuggestionInteraction.suggestion_id.in_(suggestion_ids)))
            
            db.exec(sql_delete(Suggestion).where(Suggestion.analysis_id.in_(analysis_ids)))
            db.exec(sql_delete(AnalysisResult).where(AnalysisResult.resume_id.in_(resume_ids)))
        
        # Delete all resume child records in bulk
        db.exec(sql_delete(SkillCorrection).where(SkillCorrection.resume_id.in_(resume_ids)))
        db.exec(sql_delete(ResumeExperience).where(ResumeExperience.resume_id.in_(resume_ids)))
        db.exec(sql_delete(ResumeEducation).where(ResumeEducation.resume_id.in_(resume_ids)))
        db.exec(sql_delete(ResumeSkill).where(ResumeSkill.resume_id.in_(resume_ids)))
        db.exec(sql_delete(ResumeCertification).where(ResumeCertification.resume_id.in_(resume_ids)))
        db.exec(sql_delete(ResumeProject).where(ResumeProject.resume_id.in_(resume_ids)))
        db.exec(sql_delete(ResumeCustomSection).where(ResumeCustomSection.resume_id.in_(resume_ids)))
        
        # Get file paths for cleanup before deleting resumes
        file_stmt = select(Resume.file_path).where(
            Resume.user_id == current_user_id,
            Resume.file_path.is_not(None)
        )
        file_paths = [row for row in db.exec(file_stmt).all()]
        
        # Delete all resumes
        db.exec(sql_delete(Resume).where(Resume.user_id == current_user_id))
        
        db.commit()
        
        # Clean up files after successful DB commit
        deleted_files = 0
        for file_path in file_paths:
            try:
                delete_file(file_path)
                deleted_files += 1
            except Exception as file_error:
                log_warning(f"Failed to delete file {file_path}: {str(file_error)}")
        
        log_info(f"Deleted all resumes for user {current_user_id}: {len(resume_ids)} resumes, {deleted_files} files")
        
    except Exception as e:
        db.rollback()
        log_error(f"Failed to delete all resumes for user {current_user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete all resumes"
        )


# IMPORTANT: /active must be defined BEFORE /{resume_id} so FastAPI doesn't
# treat "active" as a UUID path parameter.
@router.get(
    "/active",
    response_model=ResumeRead,
    status_code=status.HTTP_200_OK,
    summary="Get active resume for current user"
)
async def get_active_resume_endpoint(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> ResumeRead:
    """
    Retrieve the most recently uploaded resume for the authenticated user.
    This is the 'active' resume based on the latest created_at timestamp.
    """
    resume = get_active_resume(
        user_id=current_user_id,
        db=db
    )
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found for user"
        )
    
    return resume


@router.get(
    "/{resume_id}",
    response_model=ResumeRead,
    status_code=status.HTTP_200_OK,
    summary="Get resume by ID"
)
async def get_resume(
    resume_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> ResumeRead:
    """
    Retrieve a resume by its ID.
    """
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == current_user_id
    )
    result = db.exec(statement)
    resume = result.first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    return resume


@router.put(
    "/{resume_id}",
    response_model=ResumeRead,
    status_code=status.HTTP_200_OK,
    summary="Update resume"
)
async def update_resume(
    resume_id: UUID,
    resume_update: ResumeUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> ResumeRead:
    """
    Update an existing resume.
    
    Args:
        resume_id: UUID of the resume to update
        resume_update: Resume update data
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeRead with updated resume data
        
    Raises:
        404: Resume not found or user doesn't have access
    """
    # Fetch existing resume
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == current_user_id
    )
    result = db.exec(statement)
    resume = result.first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Update only provided fields
    update_data = resume_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(resume, field, value)
    
    try:
        db.add(resume)
        db.commit()
        db.refresh(resume)
        log_info(f"Resume updated: resume_id={resume_id}, user_id={current_user_id}")
    except Exception as e:
        db.rollback()
        log_error(f"Failed to update resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update resume"
        )
    
    return resume


@router.post(
    "/{resume_id}/duplicate",
    response_model=ResumeRead,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate resume with all sections"
)
async def duplicate_resume_endpoint(
    resume_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    new_version_name: str | None = None
) -> ResumeRead:
    """
    Create a complete duplicate of an existing resume.
    
    Copies all resume data including experiences, education, skills,
    projects, and certifications with new UUIDs. The duplicate is
    automatically marked as non-primary and gets a unique version name.
    
    Args:
        resume_id: UUID of the resume to duplicate
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        new_version_name: Optional custom name for the duplicate
    
    Returns:
        ResumeRead with the new duplicated resume data
    
    Raises:
        404: Original resume not found or user doesn't have access
        500: Database error during duplication
    """
    try:
        new_resume = duplicate_resume(
            resume_id=resume_id,
            user_id=current_user_id,
            db=db,
            new_version_name=new_version_name
        )
        
        if not new_resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found or access denied"
            )
        
        log_info(f"Resume duplicated via API: original_id={resume_id}, new_id={new_resume.id}, user_id={current_user_id}")
        return new_resume
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(f"API: Failed to duplicate resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to duplicate resume"
        )


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete resume with cascading cleanup"
)
async def delete_resume(
    resume_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Permanently delete a resume and all its related child records.
    
    Args:
        resume_id: UUID of the resume to delete
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Raises:
        404: Resume not found or user doesn't have access
        500: Database error during deletion
    """
    # Verify resume exists and user has access
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == current_user_id,
        Resume.deleted_at.is_(None)  # Only allow deletion of non-soft-deleted resumes
    )
    result = db.exec(statement)
    resume = result.first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    try:
        # Cascading delete using bulk SQL DELETEs (much faster than row-by-row)
        from sqlmodel import delete as sql_delete
        
        # First, handle analysis chain: interactions → suggestions → analysis results
        analysis_stmt = select(AnalysisResult.id).where(AnalysisResult.resume_id == resume_id)
        analysis_ids = [row for row in db.exec(analysis_stmt).all()]
        
        if analysis_ids:
            suggestion_stmt = select(Suggestion.id).where(Suggestion.analysis_id.in_(analysis_ids))
            suggestion_ids = [row for row in db.exec(suggestion_stmt).all()]
            
            if suggestion_ids:
                db.exec(sql_delete(SuggestionInteraction).where(SuggestionInteraction.suggestion_id.in_(suggestion_ids)))
            
            db.exec(sql_delete(Suggestion).where(Suggestion.analysis_id.in_(analysis_ids)))
        
        db.exec(sql_delete(AnalysisResult).where(AnalysisResult.resume_id == resume_id))
        
        # Bulk delete all resume child records
        db.exec(sql_delete(SkillCorrection).where(SkillCorrection.resume_id == resume_id))
        db.exec(sql_delete(ResumeExperience).where(ResumeExperience.resume_id == resume_id))
        db.exec(sql_delete(ResumeEducation).where(ResumeEducation.resume_id == resume_id))
        db.exec(sql_delete(ResumeSkill).where(ResumeSkill.resume_id == resume_id))
        db.exec(sql_delete(ResumeCertification).where(ResumeCertification.resume_id == resume_id))
        db.exec(sql_delete(ResumeProject).where(ResumeProject.resume_id == resume_id))
        db.exec(sql_delete(ResumeCustomSection).where(ResumeCustomSection.resume_id == resume_id))
        
        # Delete the file if it exists
        if resume.file_path:
            try:
                delete_file(resume.file_path)
                log_info(f"Deleted resume file: {resume.file_path}")
            except Exception as file_error:
                log_warning(f"Failed to delete resume file {resume.file_path}: {str(file_error)}")
                # Continue with database deletion even if file deletion fails
        
        # Finally, delete the resume itself
        db.delete(resume)
        db.commit()
        
        log_info(f"Resume and all related data deleted: resume_id={resume_id}, user_id={current_user_id}")
        
    except Exception as e:
        db.rollback()
        log_error(f"Failed to delete resume {resume_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume"
        )


@router.get(
    "/parse-status/{resume_id}",
    response_model=ResumeParseStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get resume parsing status"
)
async def get_resume_parse_status(
    resume_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> ResumeParseStatusResponse:
    """
    Get the parsing status of a specific resume.
    
    Returns the current processing status and any error messages
    for a resume that was uploaded for parsing.
    
    Args:
        resume_id: UUID of the resume to check parsing status for
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeParseStatusResponse with parsing status and metadata
        
    Raises:
        404: Resume not found or user doesn't have access
    """
    # Verify the resume belongs to the user before returning parsing status
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == current_user_id
    )
    result = db.exec(statement)
    resume = result.first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Use the service layer to get parse status
    status_response = get_parse_status(
        resume_id=resume_id,
        user_id=current_user_id,
        db=db
    )
    
    return status_response


@router.get(
    "/{resume_id}/complete",
    response_model=ResumeComplete,
    status_code=status.HTTP_200_OK,
    summary="Get complete resume with all sections"
)
async def get_resume_complete_endpoint(
    resume_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> ResumeComplete:
    """
    Get a complete resume with all its sections (experiences, education, skills, etc).
    
    This endpoint returns the full representation of a resume including all
    related data from child tables in a single response.
    
    Args:
        resume_id: UUID of the resume to retrieve
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeComplete with all resume data and sections
        
    Raises:
        404: Resume not found or user doesn't have access
    """
    # Single call to service layer — handles auth check + data fetch (no double query)
    complete_resume_data = get_resume_complete(
        resume_id=resume_id,
        user_id=current_user_id,
        db=db
    )
    
    if not complete_resume_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    resume = complete_resume_data["resume"]
    
    # Build the complete response
    return ResumeComplete(
        id=resume.id,
        user_id=resume.user_id,
        version_name=resume.version_name,
        template_id=resume.template_id,
        is_primary=resume.is_primary,
        section_order=resume.section_order,
        content_hash=resume.content_hash,
        file_path=resume.file_path,
        file_url=resume.file_url,
        full_name=resume.full_name,
        email=resume.email,
        phone=resume.phone,
        location=resume.location,
        linkedin_url=resume.linkedin_url,
        github_url=resume.github_url,
        portfolio_url=resume.portfolio_url,
        professional_summary=resume.professional_summary,
        raw_text=resume.raw_text,
        processing_status=resume.processing_status,
        error_message=resume.error_message,
        last_analyzed_at=resume.last_analyzed_at,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        deleted_at=resume.deleted_at,
        experiences=[ExperienceRead.model_validate(e) for e in complete_resume_data["experiences"]],
        education=[EducationRead.model_validate(e) for e in complete_resume_data["education"]],
        skills=[SkillRead.model_validate(s) for s in complete_resume_data["skills"]],
        certifications=[CertificationRead.model_validate(c) for c in complete_resume_data["certifications"]],
        projects=[ProjectRead.model_validate(p) for p in complete_resume_data["projects"]],
        custom_sections=[],
    )