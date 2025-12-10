import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.core.config import settings
from app.services.storage_service import upload_file

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...)):
    """
    Uploads a resume file (PDF or DOCX) to Supabase storage.
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

    # 6. Return Success Response
    return {
        "url": public_url,
        "filename": file.filename,
        "stored_name": unique_filename,
        "message": "Resume uploaded successfully"
    }