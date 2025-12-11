"""
Tests for file size validation in resume parsing service.
"""
import pytest
from app.services.resume_service import download_resume_file, MAX_FILE_SIZE_BYTES
from unittest.mock import patch, MagicMock


class TestFileSizeValidation:
    """Test suite for file size validation."""

    def test_oversize_file_rejection(self):
        """Test that files over 5MB are rejected with ParseError: Oversize."""
        # Create a mock file larger than 5MB
        oversized_content = b"x" * (MAX_FILE_SIZE_BYTES + 1)
        
        # Mock the Supabase client download to return oversized content
        with patch("app.services.resume_service._get_supabase_client") as mock_client:
            mock_storage = MagicMock()
            mock_storage.from_().download.return_value = oversized_content
            mock_client.return_value.storage = mock_storage
            
            # Verify that ValueError with "ParseError: Oversize" is raised
            with pytest.raises(ValueError, match="ParseError: Oversize"):
                download_resume_file("test/oversized.pdf")

    def test_valid_size_file_accepted(self):
        """Test that files under 5MB are accepted."""
        # Create a mock file under 5MB
        valid_content = b"x" * (MAX_FILE_SIZE_BYTES - 1000)
        
        # Mock the Supabase client download
        with patch("app.services.resume_service._get_supabase_client") as mock_client:
            mock_storage = MagicMock()
            mock_storage.from_().download.return_value = valid_content
            mock_client.return_value.storage = mock_storage
            
            # Should successfully download without raising error
            result = download_resume_file("test/valid.pdf")
            assert result == valid_content
            assert len(result) < MAX_FILE_SIZE_BYTES

    def test_exactly_5mb_file_accepted(self):
        """Test that files exactly at 5MB limit are accepted."""
        # Create a mock file exactly at 5MB
        exact_size_content = b"x" * MAX_FILE_SIZE_BYTES
        
        # Mock the Supabase client download
        with patch("app.services.resume_service._get_supabase_client") as mock_client:
            mock_storage = MagicMock()
            mock_storage.from_().download.return_value = exact_size_content
            mock_client.return_value.storage = mock_storage
            
            # Should successfully download without raising error
            result = download_resume_file("test/exact5mb.pdf")
            assert result == exact_size_content
            assert len(result) == MAX_FILE_SIZE_BYTES
