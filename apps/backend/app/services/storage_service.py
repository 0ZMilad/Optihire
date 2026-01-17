from functools import lru_cache

from fastapi import HTTPException, status
from supabase import create_client, Client

from app.core.config import settings
from app.core.logging_config import log_error, log_warning


@lru_cache()
def get_supabase_client() -> Client:
    """
    Returns a cached Supabase client.
    Prioritises Service Role Key to bypass RLS for backend operations.
    
    This is the single source of truth for Supabase client creation.
    Import this function in other modules instead of creating new clients.
    """
    return create_client(
        supabase_url=str(settings.SUPABASE_URL),
        supabase_key=str(settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY),
    )


def upload_file(file_data: bytes, destination_path: str, content_type: str) -> str:
    """
    Uploads a file to Supabase storage and returns its public URL.
    """
    client = get_supabase_client()
    bucket = settings.SUPABASE_STORAGE_BUCKET

    try:
        # 1. Upload the file
        client.storage.from_(bucket).upload(
            path=destination_path,
            file=file_data,
            file_options={"content-type": content_type} # Only pass content-type here
        )

        # 2. Get the public URL to save in your DB
        # Note: This doesn't validate if the file exists, it just constructs the string
        public_url = client.storage.from_(bucket).get_public_url(destination_path)
        
        return public_url

    except Exception as e:
        log_error(f"Upload failed to bucket '{bucket}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to upload file to storage"
        )
    
def get_public_url(path: str) -> str:
    """
    Retrieves the public URL for a file without re-uploading it.
    Useful when you already have the path stored in the DB.
    """
    client = get_supabase_client()
    bucket = settings.SUPABASE_STORAGE_BUCKET
    
    # get_public_url is a synchronous operation that just formats the string
    return client.storage.from_(bucket).get_public_url(path)


def delete_file(path: str) -> bool:
    """
    Deletes a file from storage. Returns True if successful.
    """
    client = get_supabase_client()
    bucket = settings.SUPABASE_STORAGE_BUCKET

    try:
        #Supabase .remove() expects a list of paths
        client.storage.from_(bucket).remove([path])
        return True
        
    except Exception as e:
        log_warning(f"File deletion failed for path '{path}': {str(e)}")
        return False