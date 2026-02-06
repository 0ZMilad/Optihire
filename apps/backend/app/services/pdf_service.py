"""
PDF generation service for resumes using fpdf2.

Renders structured resume data (from get_resume_complete) into a
professionally formatted PDF document.
"""

import re
from datetime import date

from fpdf import FPDF

from app.core.logging_config import log_info, log_error


# ── Layout constants ────────────────────────────────────────────────
PAGE_W = 210  # A4 width in mm
MARGIN_L = 15
MARGIN_R = 15
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# Colors (RGB)
COLOR_PRIMARY = (31, 41, 55)       # Dark gray – headings / name
COLOR_SECONDARY = (75, 85, 99)     # Medium gray – sub-headings
COLOR_BODY = (55, 65, 81)          # Body text
COLOR_ACCENT = (37, 99, 235)       # Blue – links & dividers
COLOR_LIGHT = (156, 163, 175)      # Light gray – dates, secondary info
COLOR_DIVIDER = (229, 231, 235)    # Hairline divider

# Font sizes
SIZE_NAME = 20
SIZE_SECTION_TITLE = 12
SIZE_SUBTITLE = 10
SIZE_BODY = 9.5
SIZE_SMALL = 8.5


# ── Default section order ──────────────────────────────────────────
DEFAULT_SECTION_ORDER = [
    "professional_summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
]


def _sanitize_text(text: str | None) -> str:
    """Strip None, collapse excessive whitespace, and replace problematic Unicode characters."""
    if not text:
        return ""
    # Replace common problematic Unicode characters with ASCII equivalents
    text = text.replace("'", "'").replace("'", "'")  # Smart quotes
    text = text.replace(""", '"').replace(""", '"')  # Smart double quotes
    text = text.replace("–", "-").replace("—", "-")  # En/em dashes
    text = text.replace("…", "...")  # Ellipsis
    text = text.replace("•", "-")  # Bullet points
    # Remove any remaining non-ASCII characters
    text = text.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r"\s+", " ", text).strip()


def _format_date(d: date | str | None) -> str:
    """Format a date to 'Mon YYYY'."""
    if d is None:
        return ""
    if isinstance(d, str):
        try:
            d = date.fromisoformat(d)
        except (ValueError, TypeError):
            return d
    return d.strftime("%b %Y")


def _date_range(start, end, is_current: bool = False) -> str:
    """Build a human-readable date range string."""
    s = _format_date(start)
    if is_current:
        e = "Present"
    else:
        e = _format_date(end)
    if s and e:
        return f"{s} - {e}"  # Use regular hyphen instead of em dash
    return s or e or ""


# ── PDF builder ────────────────────────────────────────────────────

class ResumePDF(FPDF):
    """Custom FPDF subclass with resume-specific helpers."""

    def header(self):
        """No automatic header — we draw our own in _render_header."""
        pass

    def footer(self):
        """Minimal footer with page number."""
        self.set_y(-10)
        self.set_font("Arial", "", 7)
        self.set_text_color(*COLOR_LIGHT)
        self.cell(0, 5, f"Page {self.page_no()}/{{nb}}", align="C")

    # ── Drawing helpers ─────────────────────────────────────────────

    def _section_heading(self, title: str):
        """Draw a section heading with a colored accent line."""
        self.ln(5)
        self.set_font("Arial", "B", SIZE_SECTION_TITLE)
        self.set_text_color(*COLOR_PRIMARY)
        self.cell(0, 7, _sanitize_text(title).upper(), new_x="LMARGIN", new_y="NEXT")
        # Accent line
        y = self.get_y()
        self.set_draw_color(*COLOR_ACCENT)
        self.set_line_width(0.5)
        self.line(MARGIN_L, y, MARGIN_L + CONTENT_W, y)
        self.ln(3)

    def _sub_heading(self, left: str, right: str = ""):
        """Draw a bold left-aligned sub-heading with a right-aligned date."""
        left = _sanitize_text(left)
        right = _sanitize_text(right)
        self.set_font("Arial", "B", SIZE_SUBTITLE)
        self.set_text_color(*COLOR_SECONDARY)
        w_right = self.get_string_width(right) + 2 if right else 0
        self.cell(CONTENT_W - w_right, 5, left, new_x="RIGHT")
        if right:
            self.set_font("Arial", "", SIZE_SMALL)
            self.set_text_color(*COLOR_LIGHT)
            self.cell(w_right, 5, right, align="R")
        self.ln()

    def _body_text(self, text: str):
        """Render a paragraph of body text with multi_cell wrapping."""
        text = _sanitize_text(text)
        if not text:
            return
        self.set_font("Arial", "", SIZE_BODY)
        self.set_text_color(*COLOR_BODY)
        self.multi_cell(CONTENT_W, 4.5, text)
        self.ln(1)

    def _bullet_list(self, items: list[str]):
        """Render bullet-pointed items."""
        if not items:
            return
        self.set_font("Arial", "", SIZE_BODY)
        self.set_text_color(*COLOR_BODY)
        for item in items:
            item = _sanitize_text(item)
            if not item:
                continue
            self.cell(5, 4.5, "-")  # Use simple dash instead of Unicode bullet
            x = self.get_x()
            y = self.get_y()
            self.multi_cell(CONTENT_W - 5, 4.5, f" {item}")
            self.ln(0.5)

    def _tag_row(self, tags: list[str]):
        """Render a row of comma-separated tags."""
        if not tags:
            return
        line = ", ".join(_sanitize_text(t) for t in tags if t)
        self.set_font("Arial", "I", SIZE_SMALL)
        self.set_text_color(*COLOR_LIGHT)
        self.multi_cell(CONTENT_W, 4.5, line)
        self.ln(1)

    def _italic_detail(self, label: str, value: str):
        """Draw a small italic label: value line."""
        if not value:
            return
        self.set_font("Arial", "I", SIZE_SMALL)
        self.set_text_color(*COLOR_LIGHT)
        self.cell(0, 4, f"{label}: {_sanitize_text(value)}", new_x="LMARGIN", new_y="NEXT")

    # ── Section renderers ───────────────────────────────────────────

    def _render_header(self, resume):
        """Name + contact info block at the top of page 1."""
        # Full name
        name = _sanitize_text(getattr(resume, "full_name", None)) or "Untitled Resume"
        self.set_font("Arial", "B", SIZE_NAME)
        self.set_text_color(*COLOR_PRIMARY)
        self.cell(0, 10, name, align="C", new_x="LMARGIN", new_y="NEXT")

        # Contact row
        contacts = []
        if getattr(resume, "email", None):
            contacts.append(_sanitize_text(resume.email))
        if getattr(resume, "phone", None):
            contacts.append(_sanitize_text(resume.phone))
        if getattr(resume, "location", None):
            contacts.append(_sanitize_text(resume.location))

        if contacts:
            self.set_font("Arial", "", SIZE_SMALL)
            self.set_text_color(*COLOR_SECONDARY)
            self.cell(0, 5, "  |  ".join(contacts), align="C", new_x="LMARGIN", new_y="NEXT")

        # Links row
        links = []
        if getattr(resume, "linkedin_url", None):
            links.append(f"LinkedIn: {_sanitize_text(resume.linkedin_url)}")
        if getattr(resume, "github_url", None):
            links.append(f"GitHub: {_sanitize_text(resume.github_url)}")
        if getattr(resume, "portfolio_url", None):
            links.append(f"Portfolio: {_sanitize_text(resume.portfolio_url)}")

        if links:
            self.set_font("Arial", "", SIZE_SMALL)
            self.set_text_color(*COLOR_ACCENT)
            self.cell(0, 5, "  |  ".join(links), align="C", new_x="LMARGIN", new_y="NEXT")

        # Divider
        self.ln(3)
        y = self.get_y()
        self.set_draw_color(*COLOR_DIVIDER)
        self.set_line_width(0.3)
        self.line(MARGIN_L, y, MARGIN_L + CONTENT_W, y)
        self.ln(2)

    def _render_summary(self, resume):
        summary = _sanitize_text(getattr(resume, "professional_summary", None))
        if not summary:
            return
        self._section_heading("Professional Summary")
        self._body_text(summary)

    def _render_experience(self, experiences: list):
        if not experiences:
            return
        self._section_heading("Experience")
        for exp in experiences:
            dates = _date_range(
                getattr(exp, "start_date", None),
                getattr(exp, "end_date", None),
                getattr(exp, "is_current", False),
            )
            title_line = getattr(exp, "job_title", "") or ""
            company = getattr(exp, "company_name", "") or ""
            location = getattr(exp, "location", "") or ""
            if company:
                title_line += f"  -  {company}"
            if location:
                title_line += f", {location}"

            self._sub_heading(title_line, dates)

            desc = _sanitize_text(getattr(exp, "description", None))
            if desc:
                self._body_text(desc)

            achievements = getattr(exp, "achievements", []) or []
            self._bullet_list(achievements)

            skills_used = getattr(exp, "skills_used", []) or []
            if skills_used:
                self._tag_row(skills_used)
            self.ln(1)

    def _render_education(self, education: list):
        if not education:
            return
        self._section_heading("Education")
        for edu in education:
            dates = _date_range(
                getattr(edu, "start_date", None),
                getattr(edu, "end_date", None),
                getattr(edu, "is_current", False),
            )
            institution = getattr(edu, "institution_name", "") or ""
            degree = getattr(edu, "degree_type", "") or ""
            field = getattr(edu, "field_of_study", "") or ""
            location = getattr(edu, "location", "") or ""

            title_line = institution
            degree_line = ""
            if degree and field:
                degree_line = f"{degree} in {field}"
            elif degree:
                degree_line = degree
            elif field:
                degree_line = field

            self._sub_heading(title_line, dates)
            if degree_line:
                self.set_font("Arial", "", SIZE_BODY)
                self.set_text_color(*COLOR_BODY)
                self.cell(0, 4.5, degree_line, new_x="LMARGIN", new_y="NEXT")

            if location:
                self._italic_detail("Location", location)

            gpa = getattr(edu, "gpa", None)
            if gpa is not None:
                self._italic_detail("GPA", str(gpa))

            achievements = getattr(edu, "achievements", []) or []
            self._bullet_list(achievements)

            coursework = getattr(edu, "relevant_coursework", []) or []
            if coursework:
                self._tag_row(coursework)
            self.ln(1)

    def _render_skills(self, skills: list):
        if not skills:
            return
        self._section_heading("Skills")

        # Group by category
        categories: dict[str, list[str]] = {}
        for skill in skills:
            cat = getattr(skill, "skill_category", None) or "General"
            name = getattr(skill, "skill_name", "") or ""
            if name:
                categories.setdefault(cat, []).append(name)

        for cat, names in categories.items():
            self.set_font("Arial", "B", SIZE_BODY)
            self.set_text_color(*COLOR_SECONDARY)
            self.cell(0, 5, f"{_sanitize_text(cat)}:", new_x="LMARGIN", new_y="NEXT")
            self._tag_row(names)

    def _render_certifications(self, certifications: list):
        if not certifications:
            return
        self._section_heading("Certifications")
        for cert in certifications:
            name = getattr(cert, "certification_name", "") or ""
            org = getattr(cert, "issuing_organization", "") or ""
            issue = _format_date(getattr(cert, "issue_date", None))

            right = issue
            title = name
            if org:
                title += f"  -  {org}"
            self._sub_heading(title, right)

            cred_id = getattr(cert, "credential_id", None)
            if cred_id:
                self._italic_detail("Credential ID", cred_id)
            self.ln(1)

    def _render_projects(self, projects: list):
        if not projects:
            return
        self._section_heading("Projects")
        for proj in projects:
            name = getattr(proj, "project_name", "") or ""
            role = getattr(proj, "role", "") or ""
            dates = _date_range(
                getattr(proj, "start_date", None),
                getattr(proj, "end_date", None),
                getattr(proj, "is_current", False),
            )

            title_line = name
            if role:
                title_line += f"  -  {role}"
            self._sub_heading(title_line, dates)

            desc = _sanitize_text(getattr(proj, "description", None))
            if desc:
                self._body_text(desc)

            techs = getattr(proj, "technologies_used", []) or []
            if techs:
                self._tag_row(techs)

            achievements = getattr(proj, "achievements", []) or []
            self._bullet_list(achievements)

            url = getattr(proj, "project_url", None)
            if url:
                self._italic_detail("URL", url)
            self.ln(1)


# ── Public API ──────────────────────────────────────────────────────

def generate_resume_pdf(resume_data: dict) -> bytes:
    """
    Generate a PDF from structured resume data.

    Args:
        resume_data: dict with keys ``resume``, ``experiences``,
            ``education``, ``skills``, ``certifications``, ``projects``
            (as returned by ``get_resume_complete``).

    Returns:
        Raw PDF bytes ready for HTTP streaming.
    """
    resume = resume_data["resume"]
    experiences = resume_data.get("experiences", [])
    education = resume_data.get("education", [])
    skills = resume_data.get("skills", [])
    certifications = resume_data.get("certifications", [])
    projects = resume_data.get("projects", [])

    pdf = ResumePDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_left_margin(MARGIN_L)
    pdf.set_right_margin(MARGIN_R)
    pdf.alias_nb_pages()
    pdf.add_page()

    # ── Header (always first) ───────────────────────────────────────
    pdf._render_header(resume)

    # ── Determine section order ─────────────────────────────────────
    section_order = getattr(resume, "section_order", None)
    if isinstance(section_order, dict) and "order" in section_order:
        order = section_order["order"]
    else:
        order = DEFAULT_SECTION_ORDER

    # Map section keys → (renderer, data)
    section_map = {
        "professional_summary": (pdf._render_summary, resume),
        "experience": (pdf._render_experience, experiences),
        "education": (pdf._render_education, education),
        "skills": (pdf._render_skills, skills),
        "certifications": (pdf._render_certifications, certifications),
        "projects": (pdf._render_projects, projects),
    }

    for key in order:
        renderer_info = section_map.get(key)
        if renderer_info is None:
            continue
        renderer, data = renderer_info
        renderer(data)

    # Render any sections not in the explicit order (safety net)
    rendered = set(order)
    for key in DEFAULT_SECTION_ORDER:
        if key not in rendered:
            renderer_info = section_map.get(key)
            if renderer_info:
                renderer, data = renderer_info
                renderer(data)

    pdf_bytes = pdf.output()
    log_info(f"Generated PDF for resume {getattr(resume, 'id', '?')} — {len(pdf_bytes)} bytes")
    return bytes(pdf_bytes)
