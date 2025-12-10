import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.resume_model import Resume
from app.services.storage_service import upload_file, delete_file

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Uploads a resume file (PDF or DOCX) to Supabase storage and saves metadata to database.
    Requires authentication.
    """
    
    # 1. Read file content
    try:
        file_content = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read file content"
        )

    # 2. Validate Size
    # Convert MB to Bytes
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    if len(file_content) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
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
        public_url = upload_file(
            file_data=file_content,
            destination_path=destination_path,
            content_type=file.content_type
        )
    except Exception as e:
        # Log the error internally here if you have a logger
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage service"
        )

    # 6. Save Resume Record to Database
    try:
        resume = Resume(
            user_id=current_user_id,
            version_name=file.filename or "Uploaded Resume",
            full_name=None,  # Will be populated after parsing
            email=None,
            file_path=destination_path,
            file_url=public_url,
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
    except Exception as e:
        # Clean up uploaded file if database save fails
        try:
            delete_file(destination_path)
        except Exception:
            pass  # Log this, but don't mask the original error
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume metadata to database"
        )

    # 7. Return Success Response
    return {
        "id": str(resume.id),
        "url": public_url,
        "filename": file.filename,
        "stored_name": unique_filename,
        "user_id": str(current_user_id),
        "message": "Resume uploaded successfully"
    }