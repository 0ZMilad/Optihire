"""
Tests for raw text storage in resume parsing service.

Verifies that raw extracted text from PDF/DOCX files is properly stored
in the database for future reprocessing.
"""
import pytest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from app.services.resume_service import (
    extract_structured_data,
    update_resume_with_parsed_data,
)
from app.models.resume_model import Resume


class TestRawTextStorage:
    """Test suite for raw text storage functionality."""

    def test_extract_structured_data_includes_raw_text(self):
        """Test that extract_structured_data preserves raw text in output."""
        resume_text = """
        John Doe
        john.doe@example.com | (555) 123-4567
        
        Professional Summary
        Experienced software engineer with 5+ years in full-stack development.
        
        Skills
        Python, JavaScript, React, FastAPI, PostgreSQL
        
        Work Experience
        Senior Software Engineer at Tech Corp
        January 2020 - Present
        """
        
        result = extract_structured_data(resume_text, ".pdf")
        
        # Verify raw_text is included in result
        assert "raw_text" in result
        assert result["raw_text"] == resume_text
        assert isinstance(result["raw_text"], str)
        assert len(result["raw_text"]) > 0

    def test_update_resume_with_parsed_data_stores_raw_text(self):
        """Test that raw text is stored in database when updating resume."""
        # Create mock resume
        mock_resume = Resume(
            id=uuid4(),
            user_id=uuid4(),
            version_name="Test Resume",
            is_primary=True,
        )
        
        # Create parsed data with raw text
        parsed_data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "5551234567",
            "professional_summary": "Experienced engineer",
            "raw_text": "This is the raw extracted text from the resume file.\nIt contains multiple lines.",
            "skills": ["Python", "JavaScript"],
            "experiences": [],
            "education": [],
        }
        
        # Mock database session
        mock_db = MagicMock()
        
        # Call the update function
        update_resume_with_parsed_data(mock_resume, parsed_data, mock_db)
        
        # Verify raw_text was set on resume
        assert mock_resume.raw_text == parsed_data["raw_text"]
        assert mock_resume.full_name == "John Doe"
        assert mock_resume.email == "john@example.com"
        
        # Verify db operations were called (add is called multiple times for resume + skills)
        assert mock_db.add.called
        mock_db.commit.assert_called_once()

    def test_raw_text_storage_with_empty_text(self):
        """Test handling of empty raw text."""
        resume_text = ""
        
        result = extract_structured_data(resume_text, ".pdf")
        
        # Should still have raw_text key, even if empty
        assert "raw_text" in result
        assert result["raw_text"] == ""

    def test_raw_text_storage_preserves_formatting(self):
        """Test that raw text preserves original formatting."""
        resume_text = """Line 1
        Indented Line 2
            Double Indented Line 3
        
        Blank line above
        Special chars: @#$%^&*()"""
        
        result = extract_structured_data(resume_text, ".pdf")
        
        # Raw text should be identical to input
        assert result["raw_text"] == resume_text

    def test_raw_text_storage_with_large_text(self):
        """Test storage of large resume text (edge case)."""
        # Create a large resume text (10KB+)
        large_resume_text = "John Doe\njohn@example.com\n\n" + ("Skills\nPython, JavaScript\n" * 500)
        
        result = extract_structured_data(large_resume_text, ".pdf")
        
        # Should handle large text without truncation
        assert "raw_text" in result
        assert len(result["raw_text"]) == len(large_resume_text)
        assert result["raw_text"] == large_resume_text

    def test_update_resume_without_raw_text_in_parsed_data(self):
        """Test that update works even if raw_text is missing from parsed_data."""
        mock_resume = Resume(
            id=uuid4(),
            user_id=uuid4(),
            version_name="Test Resume",
        )
        
        # Parsed data without raw_text
        parsed_data = {
            "full_name": "Jane Smith",
            "email": "jane@example.com",
            # No raw_text field
        }
        
        mock_db = MagicMock()
        
        # Should not raise error
        update_resume_with_parsed_data(mock_resume, parsed_data, mock_db)
        
        # raw_text should remain None or unchanged
        assert mock_resume.raw_text is None
        assert mock_resume.full_name == "Jane Smith"
        
        assert mock_db.add.called
        mock_db.commit.assert_called_once()

    def test_raw_text_with_unicode_characters(self):
        """Test that raw text preserves unicode characters."""
        resume_text = """José García
        josé@example.com
        
        Summary
        Développeur avec expérience en Python et JavaScript.
        Специалист по разработке ПО.
        
        Skills
        Python, JavaScript, 日本語
        """
        
        result = extract_structured_data(resume_text, ".pdf")
        
        # Should preserve all unicode characters
        assert result["raw_text"] == resume_text
        assert "José" in result["raw_text"]
        assert "Développeur" in result["raw_text"]
        assert "Специалист" in result["raw_text"]
        assert "日本語" in result["raw_text"]
