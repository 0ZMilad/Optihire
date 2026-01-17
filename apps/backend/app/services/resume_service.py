"""
Resume parsing and background processing service.

This module handles:
- Downloading resume files from Supabase storage
- Parsing PDF and DOCX files to extract text
- Extracting structured data (contact info, experience, education, skills)
- Background processing with status updates
"""
import io
import re
from uuid import UUID
from datetime import datetime, date
from typing import Any, Optional

from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from pdfminer.high_level import extract_text as extract_pdf_text
from pdfminer.pdfparser import PDFSyntaxError
from pdfminer.pdfdocument import PDFEncryptionError
from pdfminer.pdfpage import PDFTextExtractionNotAllowed
from sqlmodel import Session, select

from app.core.config import settings
from app.core.logging_config import log_info, log_error, log_warning
from app.db.session import SessionLocal
from app.models.resume_model import (
    Resume,
    ResumeSkill,
    ResumeExperience,
    ResumeEducation,
    ResumeCertification,
    ResumeProject,
)
from app.schemas.resume_schema import ResumeParseStatusResponse
from app.services.storage_service import get_supabase_client

# =============================================================================
# STATUS MANAGEMENT
# =============================================================================

def get_parse_status(
    resume_id: UUID, 
    user_id: UUID, 
    db: Session
) -> Optional[ResumeParseStatusResponse]:
    """
    Retrieve the current parsing status of a resume.
    
    Args:
        resume_id: UUID of the resume to check
        user_id: UUID of the user (for authorization)
        db: Database session
        
    Returns:
        ResumeParseStatusResponse if resume found and user authorized, None otherwise
    """
    # Query the resume with ownership check
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == user_id
    )
    result = db.exec(statement)
    resume = result.first()
    
    if not resume:
        return None
    
    # Map status to user-friendly messages
    status_messages = {
        "Pending": "Resume is queued for parsing",
        "Processing": "Parsing resume content...",
        "Completed": "Resume parsed successfully",
        "Failed": "Failed to parse resume"
    }
    
    message = status_messages.get(resume.processing_status, "Unknown status")
    
    return ResumeParseStatusResponse(
        id=resume.id,
        status=resume.processing_status,
        message=message,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
        error_details=resume.error_message if resume.processing_status == "Failed" else None
    )


# =============================================================================
# CONSTANTS
# =============================================================================

# Minimum character threshold for scanned PDF detection (Task 4555)
MIN_TEXT_LENGTH_THRESHOLD = 50

# Max file size
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

# Supported file extensions
SUPPORTED_EXTENSIONS = {".pdf", ".docx"}

# Regex patterns for structured data extraction
PATTERNS = {
    # Email pattern
    "email": re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        re.IGNORECASE
    ),
    # Phone patterns (international and US formats)
    "phone": re.compile(
        r"(?:\+?1[-.\s]?)?"  # Optional country code
        r"(?:\(?\d{3}\)?[-.\s]?)"  # Area code
        r"\d{3}[-.\s]?\d{4}"  # Main number
        r"|\+\d{1,3}[-.\s]?\d{1,14}",  # International format
        re.IGNORECASE
    ),
    # LinkedIn URL
    "linkedin": re.compile(
        r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+/?",
        re.IGNORECASE
    ),
    # GitHub URL
    "github": re.compile(
        r"(?:https?://)?(?:www\.)?github\.com/[\w-]+/?",
        re.IGNORECASE
    ),
    # Portfolio/website URL
    "website": re.compile(
        r"(?:https?://)?(?:www\.)?[\w-]+\.(?:com|io|dev|me|org|net)(?:/[\w-]*)*",
        re.IGNORECASE
    ),
}

# Section header patterns for resume sectioning
# These patterns must match section headers at line boundaries, not words in prose
SECTION_HEADERS = {
    "experience": re.compile(
        r"^\s*(?:work\s+)?experience(?:\s+history)?(?:\s*:|\s*$)|^\s*employment(?:\s+history)?(?:\s*:|\s*$)|^\s*professional\s+(?:experience|background)(?:\s*:|\s*$)|^\s*career\s+history(?:\s*:|\s*$)",
        re.IGNORECASE | re.MULTILINE
    ),
    "education": re.compile(
        r"^\s*education(?:al\s+background)?(?:\s*:|\s*$)|^\s*academic(?:\s+background)?(?:\s*:|\s*$)|^\s*qualifications(?:\s*:|\s*$)|^\s*degrees?(?:\s*:|\s*$)",
        re.IGNORECASE | re.MULTILINE
    ),
    "skills": re.compile(
        r"^\s*(?:technical\s+)?skills(?:\s*:|\s*$)|^\s*competenc(?:ies|e)(?:\s*:|\s*$)|^\s*expertise(?:\s*:|\s*$)|^\s*technologies(?:\s*:|\s*$)|^\s*proficiencies(?:\s*:|\s*$)",
        re.IGNORECASE | re.MULTILINE
    ),
    "certifications": re.compile(
        r"^\s*certifications?(?:\s*:|\s*$)|^\s*licenses?(?:\s*:|\s*$)|^\s*credentials?(?:\s*:|\s*$)|^\s*professional\s+development(?:\s*:|\s*$)",
        re.IGNORECASE | re.MULTILINE
    ),
    "projects": re.compile(
        r"^\s*projects?(?:\s*:|\s*$)|^\s*portfolio(?:\s*:|\s*$)|^\s*personal\s+projects?(?:\s*:|\s*$)|^\s*side\s+projects?(?:\s*:|\s*$)",
        re.IGNORECASE | re.MULTILINE
    ),
    "summary": re.compile(
        r"^\s*(?:professional\s+)?summary(?:\s*:|\s*$)|^\s*profile(?:\s*:|\s*$)|^\s*objective(?:\s*:|\s*$)|^\s*about(?:\s+me)?(?:\s*:|\s*$)|^\s*overview(?:\s*:|\s*$)",
        re.IGNORECASE | re.MULTILINE
    ),
}


# =============================================================================
# DATABASE OPERATIONS
# =============================================================================


def update_resume_status(
    resume_id: UUID,
    status: str,
    error_message: str | None = None,
    db: Session | None = None
) -> None:
    """
    Update the processing status of a resume.
    
    Args:
        resume_id: The UUID of the resume to update
        status: The new status ('Pending', 'Processing', 'Completed', 'Failed')
        error_message: Optional error message if status is 'Failed'
        db: Optional database session (will create one if not provided)
    """
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    
    try:
        statement = select(Resume).where(Resume.id == resume_id)
        resume = db.exec(statement).first()
        
        if resume:
            resume.processing_status = status
            resume.error_message = error_message
            
            if status == "Completed":
                resume.last_analyzed_at = datetime.utcnow()
            
            db.add(resume)
            db.commit()
            log_info(f"Resume {resume_id} status updated to {status}")
        else:
            log_warning(f"Resume {resume_id} not found for status update")
    
    except Exception as e:
        log_error(f"Failed to update resume status for {resume_id}: {str(e)}")
        if db:
            db.rollback()
    finally:
        if close_db and db:
            db.close()


def update_resume_with_parsed_data(
    resume: Resume,
    parsed_data: dict[str, Any],
    db: Session
) -> None:
    """
    Update resume record with extracted/parsed data.
    
    This function persists both flat contact fields and structured data
    (skills, experiences, education) to their respective normalized tables.
    
    Args:
        resume: The Resume model instance to update
        parsed_data: Dictionary containing extracted resume information
        db: Database session
    """
    # Update contact information
    if parsed_data.get("full_name"):
        resume.full_name = parsed_data["full_name"]
    if parsed_data.get("email"):
        resume.email = parsed_data["email"]
    if parsed_data.get("phone"):
        resume.phone = parsed_data["phone"]
    if parsed_data.get("location"):
        resume.location = parsed_data["location"]
    if parsed_data.get("linkedin_url"):
        resume.linkedin_url = parsed_data["linkedin_url"]
    if parsed_data.get("github_url"):
        resume.github_url = parsed_data["github_url"]
    if parsed_data.get("portfolio_url"):
        resume.portfolio_url = parsed_data["portfolio_url"]
    if parsed_data.get("professional_summary"):
        resume.professional_summary = parsed_data["professional_summary"]
    
    # Store raw text for future reprocessing
    if parsed_data.get("raw_text"):
        resume.raw_text = parsed_data["raw_text"]
        log_info(f"Stored {len(parsed_data['raw_text'])} characters of raw text for resume {resume.id}")
    
    db.add(resume)
    
    # ==========================================================================
    # PERSIST STRUCTURED DATA TO NORMALIZED TABLES
    # ==========================================================================
    
    # Skills - persist to resume_skills table
    skills_list = parsed_data.get("skills", [])
    if skills_list:
        log_info(f"Persisting {len(skills_list)} skills for resume {resume.id}")
        for i, skill_name in enumerate(skills_list):
            if isinstance(skill_name, str) and skill_name.strip():
                skill = ResumeSkill(
                    resume_id=resume.id,
                    skill_name=skill_name.strip()[:100],  # Enforce max length
                    display_order=i
                )
                db.add(skill)
    
    # Experiences - persist to resume_experiences table
    experiences_list = parsed_data.get("experiences", [])
    if experiences_list:
        log_info(f"Persisting {len(experiences_list)} experiences for resume {resume.id}")
        for i, exp in enumerate(experiences_list):
            if isinstance(exp, dict):
                experience = ResumeExperience(
                    resume_id=resume.id,
                    company_name=exp.get("company_name") or "Unknown Company",
                    job_title=exp.get("job_title") or "Position",
                    description=exp.get("raw_text") or exp.get("description"),
                    start_date=exp.get("start_date") or date.today(),
                    end_date=exp.get("end_date"),
                    is_current=exp.get("is_current", False),
                    display_order=i
                )
                db.add(experience)
    
    # Education - persist to resume_education table
    education_list = parsed_data.get("education", [])
    if education_list:
        log_info(f"Persisting {len(education_list)} education entries for resume {resume.id}")
        for i, edu in enumerate(education_list):
            if isinstance(edu, dict):
                education = ResumeEducation(
                    resume_id=resume.id,
                    institution_name=edu.get("institution_name") or "Unknown Institution",
                    degree_type=edu.get("degree_type"),
                    field_of_study=edu.get("field_of_study"),
                    start_date=edu.get("start_date"),
                    end_date=edu.get("end_date"),
                    is_current=edu.get("is_current", False),
                    display_order=i
                )
                db.add(education)
    
    # Certifications - persist to resume_certifications table
    certifications_list = parsed_data.get("certifications", [])
    if certifications_list:
        log_info(f"Persisting {len(certifications_list)} certifications for resume {resume.id}")
        for i, cert in enumerate(certifications_list):
            if isinstance(cert, dict):
                certification = ResumeCertification(
                    resume_id=resume.id,
                    certification_name=cert.get("certification_name") or cert.get("raw_text", "Certification")[:200],
                    issuing_organization=cert.get("issuing_organization"),
                    issue_date=cert.get("issue_date"),
                    expiry_date=cert.get("expiry_date"),
                    display_order=i
                )
                db.add(certification)
    
    # Projects - persist to resume_projects table
    projects_list = parsed_data.get("projects", [])
    if projects_list:
        log_info(f"Persisting {len(projects_list)} projects for resume {resume.id}")
        for i, proj in enumerate(projects_list):
            if isinstance(proj, dict):
                project = ResumeProject(
                    resume_id=resume.id,
                    project_name=proj.get("project_name") or "Project",
                    description=proj.get("raw_text") or proj.get("description"),
                    display_order=i
                )
                db.add(project)
    
    # Single atomic commit for all changes
    db.commit()
    
    log_info(
        f"Resume {resume.id} updated with parsed data: "
        f"skills={len(skills_list)}, experiences={len(experiences_list)}, "
        f"education={len(education_list)}"
    )


# =============================================================================
# FILE DOWNLOAD
# =============================================================================

def download_resume_file(file_path: str) -> bytes:
    """
    Download resume file from Supabase storage into memory.
    
    Args:
        file_path: The storage path of the file (e.g., "resumes/uuid.pdf")
        
    Returns:
        bytes: The file content as bytes
        
    Raises:
        ValueError: With specific error codes:
            - ParseError: FileNotFound - File not in storage
            - ParseError: Oversize - File exceeds 5MB limit
            - ParseError: DownloadFailed - Storage download error
    """
    client = get_supabase_client()
    bucket = settings.SUPABASE_STORAGE_BUCKET
    
    try:
        log_info(f"Downloading file from storage: {file_path}")
        
        # Download file content as bytes
        response = client.storage.from_(bucket).download(file_path)
        
        if response is None:
            raise ValueError(f"ParseError: FileNotFound - {file_path}")
        
        # Check file size (5MB limit)
        file_size = len(response)
        if file_size > MAX_FILE_SIZE_BYTES:
            log_error(
                f"File {file_path} exceeds size limit: {file_size} bytes "
                f"(max: {MAX_FILE_SIZE_BYTES} bytes)"
            )
            raise ValueError("ParseError: Oversize")
        
        log_info(f"Successfully downloaded file: {file_path} ({file_size} bytes)")
        return response
        
    except Exception as e:
        error_msg = str(e)
        log_error(f"Failed to download file {file_path}: {error_msg}")
        
        # Check for specific error types
        if "not found" in error_msg.lower() or "404" in error_msg:
            raise ValueError(f"ParseError: FileNotFound - {file_path}")
        
        raise ValueError(f"ParseError: DownloadFailed - {error_msg}")


# =============================================================================
# PDF PARSING
# =============================================================================

def parse_pdf_resume(file_content: bytes) -> str:
    """
    Parse PDF resume and extract text content using pdfminer.six.
    
    Args:
        file_content: PDF file content as bytes
        
    Returns:
        str: Extracted text from the PDF
        
    Raises:
        ValueError: With specific error codes for different failure scenarios:
            - ParseError: ScannedPdfNoText - PDF is scanned/image-based
            - ParseError: EncryptedPdf - PDF is password protected
            - ParseError: CorruptedPdf - PDF file is corrupted/malformed
    """
    try:
        log_info("Parsing PDF document...")
        
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(file_content)
        
        # Extract text using pdfminer
        extracted_text = extract_pdf_text(pdf_file)
        
        # Clean up the extracted text
        stripped_text = extracted_text.strip() if extracted_text else ""
        
        # Task 4555: Scanned PDF Detection
        # If text is too short, it's likely a scanned/image-based PDF
        if len(stripped_text) < MIN_TEXT_LENGTH_THRESHOLD:
            log_warning(
                f"PDF appears to be scanned - extracted only {len(stripped_text)} characters"
            )
            raise ValueError("ParseError: ScannedPdfNoText")
        
        log_info(f"Successfully extracted {len(stripped_text)} characters from PDF")
        return stripped_text
        
    except PDFEncryptionError:
        log_error("PDF is encrypted/password protected")
        raise ValueError("ParseError: EncryptedPdf")
        
    except PDFTextExtractionNotAllowed:
        log_error("PDF text extraction is not allowed (restricted)")
        raise ValueError("ParseError: EncryptedPdf")
        
    except PDFSyntaxError as e:
        log_error(f"PDF syntax error (corrupted file): {str(e)}")
        raise ValueError("ParseError: CorruptedPdf")
        
    except ValueError:
        # Re-raise ValueError (our custom errors) without wrapping
        raise
        
    except Exception as e:
        log_error(f"Unexpected error parsing PDF: {str(e)}")
        # Check if it's related to encryption or corruption
        error_msg = str(e).lower()
        if "encrypt" in error_msg or "password" in error_msg:
            raise ValueError("ParseError: EncryptedPdf")
        if "corrupt" in error_msg or "invalid" in error_msg or "malformed" in error_msg:
            raise ValueError("ParseError: CorruptedPdf")
        raise ValueError(f"ParseError: CorruptedPdf - {str(e)}")


# =============================================================================
# DOCX PARSING
# =============================================================================

def parse_docx_resume(file_content: bytes) -> str:
    """
    Parse DOCX resume and extract text content using python-docx.
    
    Args:
        file_content: DOCX file content as bytes
        
    Returns:
        str: Extracted text from the DOCX file
        
    Raises:
        ValueError: If the DOCX file is corrupted or invalid
    """
    try:
        log_info("Parsing DOCX document...")
        
        # Create a file-like object from bytes
        docx_file = io.BytesIO(file_content)
        
        # Load the document
        document = Document(docx_file)
        
        # Extract text from paragraphs
        paragraphs = []
        for paragraph in document.paragraphs:
            text = paragraph.text.strip()
            if text:
                paragraphs.append(text)
        
        # Also extract text from tables
        for table in document.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    cell_text = cell.text.strip()
                    if cell_text:
                        row_text.append(cell_text)
                if row_text:
                    paragraphs.append(" | ".join(row_text))
        
        extracted_text = "\n".join(paragraphs)
        
        if len(extracted_text.strip()) < MIN_TEXT_LENGTH_THRESHOLD:
            log_warning(
                f"DOCX has minimal text content - only {len(extracted_text.strip())} characters"
            )
            # For DOCX, minimal text might just be an empty/template document
            # Still allow it through but log the warning
        
        log_info(f"Successfully extracted {len(extracted_text)} characters from DOCX")
        return extracted_text
        
    except PackageNotFoundError:
        log_error("DOCX file is corrupted or not a valid DOCX")
        raise ValueError("ParseError: CorruptedDocx")
        
    except Exception as e:
        error_msg = str(e).lower()
        log_error(f"Error parsing DOCX: {str(e)}")
        
        if "corrupt" in error_msg or "invalid" in error_msg:
            raise ValueError("ParseError: CorruptedDocx")
        
        raise ValueError(f"ParseError: CorruptedDocx - {str(e)}")


# =============================================================================
# STRUCTURED DATA EXTRACTION (Task 4268)
# =============================================================================

def _extract_contact_info(text: str) -> dict[str, str | None]:
    """
    Extract contact information from resume text.
    
    Returns:
        dict with keys: email, phone, linkedin_url, github_url, portfolio_url
    """
    contact_info: dict[str, str | None] = {
        "email": None,
        "phone": None,
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
    }
    
    # Extract email
    email_match = PATTERNS["email"].search(text)
    if email_match:
        contact_info["email"] = email_match.group(0).lower()
    
    # Extract phone
    phone_match = PATTERNS["phone"].search(text)
    if phone_match:
        # Clean up phone number
        phone = re.sub(r"[^\d+]", "", phone_match.group(0))
        contact_info["phone"] = phone
    
    # Extract LinkedIn
    linkedin_match = PATTERNS["linkedin"].search(text)
    if linkedin_match:
        url = linkedin_match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        contact_info["linkedin_url"] = url
    
    # Extract GitHub
    github_match = PATTERNS["github"].search(text)
    if github_match:
        url = github_match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        contact_info["github_url"] = url
    
    return contact_info


def _extract_name(text: str) -> str | None:
    """
    Attempt to extract the candidate's name from the resume.
    
    Heuristic: The name is usually in the first few lines, 
    often the first non-empty line that looks like a name.
    """
    lines = text.strip().split("\n")
    
    for line in lines[:10]:  # Check first 10 lines
        line = line.strip()
        
        # Skip empty lines
        if not line:
            continue
        
        # Skip lines that look like headers, emails, phones, URLs
        if "@" in line or "http" in line.lower():
            continue
        if re.match(r"^[\d\s\-\(\)\+]+$", line):  # Phone numbers
            continue
        if len(line) > 50:  # Too long to be a name
            continue
        if any(keyword in line.lower() for keyword in [
            "resume", "curriculum", "cv", "objective", "summary", "experience"
        ]):
            continue
        
        # Check if it looks like a name (2-4 words, mostly letters)
        words = line.split()
        if 1 <= len(words) <= 4:
            # Check if words look like name components
            if all(re.match(r"^[A-Za-z\.\-\']+$", word) for word in words):
                return line
    
    return None


def _extract_section_content(text: str, section_name: str) -> str:
    """
    Extract content for a specific section from resume text.
    
    Args:
        text: Full resume text
        section_name: Name of the section to extract
        
    Returns:
        The content of the section (may be empty string)
    """
    if section_name not in SECTION_HEADERS:
        return ""
    
    pattern = SECTION_HEADERS[section_name]
    
    # Find where this section starts
    match = pattern.search(text)
    if not match:
        return ""
    
    section_start = match.end()
    
    # Find where the next section starts
    next_section_start = len(text)
    for other_section, other_pattern in SECTION_HEADERS.items():
        if other_section == section_name:
            continue
        other_match = other_pattern.search(text[section_start:])
        if other_match:
            potential_end = section_start + other_match.start()
            if potential_end < next_section_start:
                next_section_start = potential_end
    
    section_content = text[section_start:next_section_start].strip()
    return section_content


def _parse_skills_section(skills_text: str) -> list[str]:
    """
    Parse skills section and extract individual skills.
    """
    if not skills_text:
        return []
    
    skills = []
    
    # Split by common delimiters
    # First, try splitting by newlines
    lines = skills_text.split("\n")
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Remove category labels (e.g., "Languages:", "Frontend:", etc.)
        # Look for pattern "Word(s): content" and keep only content
        colon_match = re.match(r"^([A-Za-z\s]+):\s*(.+)$", line)
        if colon_match:
            # Take only the part after the colon
            line = colon_match.group(2)
        
        # Split by common separators: comma, semicolon, pipe, bullet points
        parts = re.split(r"[,;|•·▪◦‣⁃]\s*", line)
        
        for part in parts:
            skill = part.strip().strip("-•·").strip()
            # Filter out empty strings and very long "skills" (likely sentences)
            if skill and len(skill) < 50 and len(skill) > 1:
                skills.append(skill)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_skills = []
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower not in seen:
            seen.add(skill_lower)
            unique_skills.append(skill)
    
    return unique_skills[:50]  # Limit to 50 skills


def _parse_experience_section(experience_text: str) -> list[dict[str, Any]]:
    """
    Parse experience section into structured entries.
    
    Returns a list of experience dictionaries with:
    - company_name, job_title, description (raw text for now)
    """
    if not experience_text:
        return []
    
    experiences = []
    
    # Split by common patterns that indicate new job entries
    # Look for patterns like: Company Name followed by date range
    date_pattern = re.compile(
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
        r"[\s,\.]*\d{2,4}\s*[-–—to]+\s*"
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Present|Current)"
        r"[\s,\.]*\d{0,4}",
        re.IGNORECASE
    )
    
    # For now, store raw text chunks as experience entries
    # A more sophisticated parser would use NLP/ML
    paragraphs = experience_text.split("\n\n")
    
    for para in paragraphs:
        para = para.strip()
        if len(para) > 20:  # Minimum content threshold
            experiences.append({
                "raw_text": para,
                "company_name": None,  # Would need NER to extract
                "job_title": None,     # Would need NER to extract
            })
    
    return experiences[:20]  # Limit to 20 experiences


def _parse_education_section(education_text: str) -> list[dict[str, Any]]:
    """
    Parse education section into structured entries.
    """
    if not education_text:
        return []
    
    education = []
    
    # Common degree patterns
    degree_pattern = re.compile(
        r"(?:Bachelor|Master|PhD|Ph\.D|Doctorate|Associate|B\.S\.|B\.A\.|M\.S\.|M\.A\.|MBA|"
        r"B\.Sc|M\.Sc|BBA|BS|BA|MS|MA)\.?",
        re.IGNORECASE
    )
    
    paragraphs = education_text.split("\n\n")
    
    for para in paragraphs:
        para = para.strip()
        if len(para) > 10:
            entry = {
                "raw_text": para,
                "institution_name": None,
                "degree_type": None,
                "field_of_study": None,
            }
            
            # Try to extract degree
            degree_match = degree_pattern.search(para)
            if degree_match:
                entry["degree_type"] = degree_match.group(0)
            
            education.append(entry)
    
    return education[:10]  # Limit to 10 education entries


def extract_structured_data(raw_text: str, file_type: str = "") -> dict[str, Any]:
    """
    Extract structured information from raw resume text using regex-based parsing.
    
    This implements Task 4268: Basic sectioning for Education, Experience, Skills.
    
    Args:
        raw_text: The raw text extracted from the resume file
        file_type: The file extension (e.g., ".pdf", ".docx") - for logging
        
    Returns:
        dict: Structured resume data containing:
            - full_name: Candidate's name
            - email: Email address
            - phone: Phone number
            - linkedin_url: LinkedIn profile URL
            - github_url: GitHub profile URL  
            - portfolio_url: Portfolio/website URL
            - professional_summary: Summary/objective section
            - skills: List of skills
            - experiences: List of work experience entries
            - education: List of education entries
            - raw_text: The original raw text for reference
    """
    log_info(f"Extracting structured data from {file_type} resume text...")
    
    # Initialize result structure
    result: dict[str, Any] = {
        "full_name": None,
        "email": None,
        "phone": None,
        "location": None,
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
        "professional_summary": None,
        "skills": [],
        "experiences": [],
        "education": [],
        "certifications": [],
        "projects": [],
        "raw_text": raw_text,
    }
    
    if not raw_text or not raw_text.strip():
        log_warning("Empty text provided for extraction")
        return result
    
    # Extract contact information
    contact_info = _extract_contact_info(raw_text)
    result.update(contact_info)
    
    # Extract name
    result["full_name"] = _extract_name(raw_text)
    
    # Extract summary/objective section
    summary_content = _extract_section_content(raw_text, "summary")
    if summary_content:
        # Limit summary length
        result["professional_summary"] = summary_content[:2000]
    
    # Extract skills
    skills_content = _extract_section_content(raw_text, "skills")
    result["skills"] = _parse_skills_section(skills_content)
    
    # Extract experience
    experience_content = _extract_section_content(raw_text, "experience")
    result["experiences"] = _parse_experience_section(experience_content)
    
    # Extract education
    education_content = _extract_section_content(raw_text, "education")
    result["education"] = _parse_education_section(education_content)
    
    # Extract certifications (raw for now)
    cert_content = _extract_section_content(raw_text, "certifications")
    if cert_content:
        result["certifications"] = [{"raw_text": cert_content}]
    
    # Extract projects (raw for now)
    projects_content = _extract_section_content(raw_text, "projects")
    if projects_content:
        result["projects"] = [{"raw_text": projects_content}]
    
    log_info(
        f"Extraction complete: name={result['full_name']}, "
        f"email={result['email']}, skills={len(result['skills'])}, "
        f"experiences={len(result['experiences'])}, education={len(result['education'])}"
    )
    
    return result


# =============================================================================
# FILE TYPE DETECTION & ROUTING
# =============================================================================

def _get_file_extension(file_path: str) -> str:
    """Extract and validate file extension from path."""
    if "." not in file_path:
        return ""
    return "." + file_path.rsplit(".", 1)[-1].lower()


def parse_resume_content(file_content: bytes, file_path: str) -> dict[str, Any]:
    """
    Main entry point for parsing resume content.
    
    Detects file type and routes to appropriate parser.
    
    Args:
        file_content: The file content as bytes
        file_path: Original file path (used to determine file type)
        
    Returns:
        dict: Structured resume data
        
    Raises:
        ValueError: With specific error codes for parsing failures
    """
    file_ext = _get_file_extension(file_path)
    
    log_info(f"Parsing resume file: {file_path} (type: {file_ext})")
    
    # Validate file type
    if file_ext not in SUPPORTED_EXTENSIONS:
        log_error(f"Unsupported file type: {file_ext}")
        raise ValueError("ParseError: UnsupportedFileType")
    
    # Route to appropriate parser
    if file_ext == ".pdf":
        raw_text = parse_pdf_resume(file_content)
    elif file_ext == ".docx":
        raw_text = parse_docx_resume(file_content)
    else:
        raise ValueError("ParseError: UnsupportedFileType")
    
    # Extract structured data
    structured_data = extract_structured_data(raw_text, file_ext)
    
    return structured_data


# =============================================================================
# BACKGROUND TASK
# =============================================================================


def parse_resume_background(resume_id: str, file_path: str) -> None:
    """
    Background task to parse resume file and extract information.
    
    This function runs asynchronously after file upload completes.
    It downloads the file, parses content, extracts structured data,
    and updates the resume record with the extracted information.
    
    Args:
        resume_id: String UUID of the resume to parse
        file_path: Path to the uploaded resume file in storage
    
    Error Handling:
        - ParseError: ScannedPdfNoText - PDF is image-based/scanned
        - ParseError: EncryptedPdf - PDF is password protected
        - ParseError: CorruptedPdf - PDF file is corrupted
        - ParseError: CorruptedDocx - DOCX file is corrupted
        - ParseError: UnsupportedFileType - Unknown file extension
        - ParseError: Oversize - File exceeds 5MB limit
        - ParseError: FileNotFound - File not in storage
        - ParseError: DownloadFailed - Storage download error
    """
    db = SessionLocal()
    resume_uuid = UUID(resume_id)
    
    try:
        log_info(f"[RESUME_PARSE] Starting: resume_id={resume_id}")
        update_resume_status(resume_uuid, "Processing", db=db)
        
        statement = select(Resume).where(Resume.id == resume_uuid)
        resume = db.exec(statement).first()
        
        if not resume:
            raise ValueError(f"ParseError: ResumeNotFound - {resume_id}")
        
        log_info(f"[RESUME_PARSE] Downloading: resume_id={resume_id}, path={file_path}")
        file_content = download_resume_file(file_path)
        log_info(f"[RESUME_PARSE] Downloaded: size={len(file_content)} bytes")
        
        parsed_data = parse_resume_content(file_content, file_path)
        update_resume_with_parsed_data(resume, parsed_data, db)
        
        log_info(
            f"[RESUME_PARSE] Completed: resume_id={resume_id}, "
            f"name={parsed_data.get('full_name')}, "
            f"email={parsed_data.get('email')}, "
            f"skills={len(parsed_data.get('skills', []))}, "
            f"experience={len(parsed_data.get('experiences', []))}"
        )
        
        update_resume_status(resume_uuid, "Completed", db=db)
        
    except ValueError as e:
        error_msg = str(e)
        log_error(f"[RESUME_PARSE] Error: resume_id={resume_id}, error={error_msg}")
        update_resume_status(resume_uuid, "Failed", error_message=error_msg, db=db)
        
    except Exception as e:
        error_msg = f"ParseError: UnexpectedError - {str(e)}"
        log_error(f"[RESUME_PARSE] Unexpected: resume_id={resume_id}, error={error_msg}")
        update_resume_status(resume_uuid, "Failed", error_message=error_msg, db=db)
        
    finally:
        db.close()


def get_active_resume(
    user_id: UUID,
    db: Session
) -> Resume | None:
    """
    Retrieve the most recently uploaded active resume for the user.
    
    Args:
        user_id: UUID of the current user
        db: Database session
    Returns:
        Resume instance if found, None otherwise
    """
    statement = select(Resume).where(
        Resume.user_id == user_id
    ).order_by(Resume.created_at.desc())
    
    result = db.exec(statement)
    resume = result.first()
    
    return resume


def get_resume_complete(
    resume_id: UUID,
    user_id: UUID,
    db: Session
) -> dict | None:
    """
    Retrieve a resume with all related sections (experiences, education, skills, etc.).
    
    This function fetches the base resume and all associated structured data
    from the normalized tables, returning a complete picture for the frontend.
    
    Args:
        resume_id: UUID of the resume to retrieve
        user_id: UUID of the user (for authorization check)
        db: Database session
        
    Returns:
        dict containing resume data with all sections, or None if not found/unauthorized
    """
    # Fetch base resume with authorization check
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == user_id
    )
    resume = db.exec(statement).first()
    
    if not resume:
        return None
    
    # Fetch all related sections
    experiences = db.exec(
        select(ResumeExperience)
        .where(ResumeExperience.resume_id == resume_id)
        .order_by(ResumeExperience.display_order)
    ).all()
    
    education = db.exec(
        select(ResumeEducation)
        .where(ResumeEducation.resume_id == resume_id)
        .order_by(ResumeEducation.display_order)
    ).all()
    
    skills = db.exec(
        select(ResumeSkill)
        .where(ResumeSkill.resume_id == resume_id)
        .order_by(ResumeSkill.display_order)
    ).all()
    
    certifications = db.exec(
        select(ResumeCertification)
        .where(ResumeCertification.resume_id == resume_id)
        .order_by(ResumeCertification.display_order)
    ).all()
    
    projects = db.exec(
        select(ResumeProject)
        .where(ResumeProject.resume_id == resume_id)
        .order_by(ResumeProject.display_order)
    ).all()
    
    log_info(
        f"Fetched complete resume {resume_id}: "
        f"experiences={len(experiences)}, education={len(education)}, "
        f"skills={len(skills)}, certifications={len(certifications)}, "
        f"projects={len(projects)}"
    )
    
    return {
        "resume": resume,
        "experiences": experiences,
        "education": education,
        "skills": skills,
        "certifications": certifications,
        "projects": projects,
    }