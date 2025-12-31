import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, BackgroundTasks
from sqlmodel import Session
from uuid import UUID

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.logging_config import log_info, log_error, log_warning
from app.db.session import get_db
from app.models.resume_model import Resume
from app.schemas.resume_schema import (
    ResumeParseStatusResponse,
    ResumeRead,
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
)
from sqlmodel import select

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

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
    
    Args:
        resume_id: UUID of the resume to retrieve
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeRead with full resume data
        
    Raises:
        404: Resume not found or user doesn't have access
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
    
    Args:
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeRead with the active resume data
        
    Raises:
        404: No resume found for user
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
    Retrieve the current parsing status of a resume.
    
    This endpoint allows clients to poll the status of a resume parsing job.
    
    Args:
        resume_id: UUID of the resume to check
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeParseStatusResponse with current status, message, and timestamps
        
    Raises:
        404: Resume not found or user doesn't have access
    """
    status_result = get_parse_status(
        resume_id=resume_id,
        user_id=current_user_id,
        db=db
    )
    
    if not status_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    return status_result


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
    Retrieve a resume with all related sections (experiences, education, skills, etc.).
    
    This endpoint returns the full parsed resume data including:
    - Contact information (name, email, phone, etc.)
    - Professional summary
    - Work experiences
    - Education history
    - Skills
    - Certifications
    - Projects
    
    Use this endpoint after parsing is complete to display the full resume
    for user review and editing.
    
    Args:
        resume_id: UUID of the resume to retrieve
        current_user_id: Authenticated user's ID (from token)
        db: Database session
        
    Returns:
        ResumeComplete with all resume sections
        
    Raises:
        404: Resume not found or user doesn't have access
    """
    result = get_resume_complete(
        resume_id=resume_id,
        user_id=current_user_id,
        db=db
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied"
        )
    
    # Build the complete response
    resume = result["resume"]
    
    return ResumeComplete(
        # Base resume fields
        id=resume.id,
        user_id=resume.user_id,
        version_name=resume.version_name,
        template_id=resume.template_id,
        is_primary=resume.is_primary,
        section_order=resume.section_order,
        content_hash=resume.content_hash,
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
        # Related sections
        experiences=[ExperienceRead.model_validate(e) for e in result["experiences"]],
        education=[EducationRead.model_validate(e) for e in result["education"]],
        skills=[SkillRead.model_validate(s) for s in result["skills"]],
        certifications=[CertificationRead.model_validate(c) for c in result["certifications"]],
        projects=[ProjectRead.model_validate(p) for p in result["projects"]],
        custom_sections=[],  # Not parsed yet
    )