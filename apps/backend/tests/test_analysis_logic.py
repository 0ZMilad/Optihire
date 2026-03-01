"""
Unit tests for the v2 ATS analysis engine.

These test the pure scoring functions directly (no DB required).
Run with:  pytest tests/test_analysis_logic.py -v
"""

import pytest

from app.services.analysis_service import (
    _analyse_impact,
    _analyse_resume_metrics,
    _build_priority_actions,
    _categorise_keywords,
    _classify_term,
    _detect_industry,
    _detect_repetition,
    _extract_meaningful_keywords,
    _extract_phrases,
    _importance_tier,
    _normalise_term,
    _score_formatting,
    _score_keywords,
    _score_sections,
    _stem,
    _term_in_text,
    _tokenize,
)

# ---------------------------------------------------------------------------
# Test fixtures — realistic resume / JD snippets
# ---------------------------------------------------------------------------

STRONG_SWE_RESUME = """
John Doe
john.doe@email.com | +1 (555) 123-4567 | San Francisco, CA
linkedin.com/in/johndoe | github.com/johndoe

Professional Summary
Results-driven Senior Software Engineer with 7+ years of experience building
scalable web applications and distributed systems. Passionate about clean code,
mentoring junior developers, and shipping high-impact features.

Work Experience

Senior Software Engineer — Acme Corp
Jan 2021 – Present
• Architected a microservices platform on AWS using Python, FastAPI, and Docker,
  reducing deployment time by 60% and handling 2M+ requests/day.
• Led migration from monolith to Kubernetes (EKS), cutting infrastructure costs
  by $120K/year.
• Built real-time data pipeline with Kafka and PostgreSQL processing 500K events/hour.
• Mentored 4 junior engineers through code reviews and pair programming sessions.
• Implemented CI/CD pipelines with GitHub Actions, achieving 99.8% deployment success rate.

Software Engineer — Beta Inc
Mar 2018 – Dec 2020
• Developed React/TypeScript frontend used by 50K+ monthly active users.
• Designed RESTful APIs with Node.js and Express, improving response times by 35%.
• Reduced production incidents by 40% through comprehensive test coverage (Jest, Cypress).
• Collaborated cross-functionally with product, design, and QA teams using Agile/Scrum.

Education
B.S. Computer Science — Stanford University, 2018
GPA: 3.8/4.0

Skills
Python, TypeScript, JavaScript, SQL, Go
React, Next.js, FastAPI, Node.js, Express
PostgreSQL, Redis, MongoDB, Kafka
AWS (EC2, S3, Lambda, EKS), Docker, Kubernetes, Terraform
Git, GitHub Actions, Jenkins, Datadog
Agile, Scrum, CI/CD, Microservices, TDD

Certifications
AWS Certified Solutions Architect – Associate
Certified Kubernetes Administrator (CKA)
"""

WEAK_RESUME = """
Jane Smith
Looking for a job in tech.

I have worked at several companies doing various things.
I am responsible for writing code and attending meetings.
My duties include fixing bugs and helping the team.
I worked on some projects that were successful.
I have experience with computers and software.
"""

CAREER_SWITCHER_RESUME = """
Michael Chen
michael.chen@email.com | (555) 987-6543

Professional Summary
Former high school math teacher transitioning into software development.
Completed a 12-week intensive coding bootcamp. Eager to apply analytical
thinking and communication skills to a development role.

Work Experience

Math Teacher — Lincoln High School
Aug 2016 – Jun 2023
• Designed and delivered curriculum for 150+ students across 5 classes daily.
• Improved standardized test scores by 22% through data-driven lesson planning.
• Mentored 3 student teachers and led professional development workshops.
• Created interactive learning tools using Google Sheets and basic JavaScript.

Experience

Software Developer Intern — TechStart (Bootcamp Capstone)
Jul 2023 – Sep 2023
• Built a full-stack task management app using React, Node.js, and MongoDB.
• Implemented user authentication with JWT and bcrypt.
• Deployed application to Heroku with CI/CD pipeline.

Education
B.A. Mathematics — University of Michigan, 2016
Full-Stack Web Development Certificate — App Academy, 2023

Skills
JavaScript, Python, HTML, CSS
React, Node.js, Express, MongoDB
Git, GitHub, Heroku
Communication, Leadership, Problem-solving
"""

WELL_FORMATTED_NO_MATCH_RESUME = """
Sarah Park
sarah.park@email.com | +82 10-1234-5678

Professional Summary
Experienced marine biologist with 10 years of field research in coral reef
ecosystems and marine conservation.

Work Experience

Senior Marine Biologist — Ocean Research Institute
Jan 2018 – Present
• Led a 12-person research team studying coral bleaching patterns across 3 Pacific sites.
• Published 8 peer-reviewed papers in Nature Marine Biology and Science.
• Secured $2.4M in grant funding through NSF and NOAA proposals.
• Developed statistical models using R and MATLAB to predict reef recovery timelines.

Education
Ph.D. Marine Biology — Scripps Institution of Oceanography, 2017

Skills
R, MATLAB, GIS, Statistical Modeling
Field Research, Grant Writing, Scientific Communication
SCUBA Diving (PADI Divemaster), Underwater Photography
"""

SWE_JOB_DESCRIPTION = """
Senior Software Engineer — CloudTech Inc.

About the Role:
We're looking for a Senior Software Engineer to join our Platform team.
You'll design and build scalable backend services, mentor junior engineers,
and drive technical decisions that impact millions of users.

Requirements:
- 5+ years of professional software development experience
- Strong proficiency in Python and/or Go
- Experience with cloud platforms (AWS, GCP, or Azure)
- Solid understanding of distributed systems and microservices architecture
- Experience with containerization (Docker, Kubernetes)
- Proficiency with relational databases (PostgreSQL, MySQL)
- Experience building and consuming RESTful APIs
- Familiarity with CI/CD pipelines and infrastructure as code (Terraform)
- Strong problem-solving and communication skills
- Experience with Agile methodologies

Nice to Have:
- Experience with Kafka or similar event streaming platforms
- Knowledge of React or modern frontend frameworks
- Experience with machine learning or data engineering
- Contributions to open-source projects
- AWS or Kubernetes certifications (CKA, AWS SA)
"""

DATA_ENGINEER_JD = """
Data Engineer — AnalyticsCo

We need a Data Engineer to design and maintain our data infrastructure.

Requirements:
- 3+ years experience in data engineering or related role
- Strong SQL skills and experience with data warehouses (Snowflake, BigQuery, Redshift)
- Proficiency in Python and/or Scala for data processing
- Experience with Apache Spark, Airflow, or similar tools
- Knowledge of ETL/ELT patterns and data modeling
- Experience with cloud platforms (AWS or GCP)
- Familiarity with dbt for data transformation
- Understanding of data governance and data quality frameworks
- Strong analytical and problem-solving skills

Nice to Have:
- Experience with Kafka for real-time data streaming
- Knowledge of machine learning pipelines
- Databricks or Snowflake certifications
"""


# ===========================================================================
# Test: Tokenizer
# ===========================================================================

class TestTokenizer:
    def test_basic_tokenize(self):
        tokens = _tokenize("Hello world, this is a test of Python 3.11")
        assert "hello" in tokens
        assert "world" in tokens
        assert "python" in tokens
        # Stopwords removed
        assert "this" not in tokens
        assert "is" not in tokens

    def test_short_words_kept(self):
        """v2 keeps tokens ≥2 chars (e.g. 'go', 'r', 'ai')."""
        tokens = _tokenize("Use Go and R for AI tasks")
        assert "go" in tokens
        assert "ai" in tokens

    def test_tech_symbols_preserved(self):
        tokens = _tokenize("Experience with C++ and Node.js and C#")
        assert "c++" in tokens
        # node.js may tokenize as "nodejs" or "node.js" depending on regex —
        # either form is fine since synonyms map both to "node.js"
        assert "node.js" in tokens or "nodejs" in tokens
        assert "c#" in tokens


# ===========================================================================
# Test: Stemmer
# ===========================================================================

class TestStemmer:
    def test_strips_common_suffixes(self):
        assert _stem("developing") == _stem("developed") or _stem("developing") != "developing"
        assert _stem("optimization") != "optimization"

    def test_short_words_unchanged(self):
        assert _stem("go") == "go"
        assert _stem("api") == "api"

    def test_does_not_overstem(self):
        # "less" should not be stemmed to empty
        result = _stem("less")
        assert len(result) >= 2


# ===========================================================================
# Test: Synonym / normalisation
# ===========================================================================

class TestSynonyms:
    def test_js_to_javascript(self):
        assert _normalise_term("js") == "javascript"
        assert _normalise_term("JS") == "javascript"

    def test_k8s_to_kubernetes(self):
        assert _normalise_term("k8s") == "kubernetes"

    def test_unknown_term_passthrough(self):
        assert _normalise_term("foobar") == "foobar"

    def test_canonical_to_self(self):
        assert _normalise_term("python") == "python"


# ===========================================================================
# Test: Term classification
# ===========================================================================

class TestClassification:
    def test_tools(self):
        assert _classify_term("python") == "tool"
        assert _classify_term("react") == "tool"
        assert _classify_term("docker") == "tool"
        assert _classify_term("kubernetes") == "tool"

    def test_soft_skills(self):
        assert _classify_term("leadership") == "soft_skill"
        assert _classify_term("communication") == "soft_skill"
        assert _classify_term("problem solving") == "soft_skill"

    def test_certifications(self):
        assert _classify_term("aws certified") == "certification"
        assert _classify_term("pmp") == "certification"
        assert _classify_term("cka") == "certification"

    def test_hard_skills_fallback(self):
        # Unknown terms default to hard_skill
        assert _classify_term("data modeling") == "hard_skill"


# ===========================================================================
# Test: Importance tiering
# ===========================================================================

class TestImportanceTier:
    def test_critical(self):
        assert _importance_tier(10, 10) == "critical"
        assert _importance_tier(8, 10) == "critical"

    def test_high(self):
        assert _importance_tier(5, 10) == "high"

    def test_medium(self):
        assert _importance_tier(3, 10) == "medium"

    def test_low(self):
        assert _importance_tier(1, 10) == "low"

    def test_zero_max(self):
        assert _importance_tier(0, 0) == "low"


# ===========================================================================
# Test: Phrase extraction
# ===========================================================================

class TestPhraseExtraction:
    def test_extracts_multiword_tech(self):
        text = "We need experience with machine learning and deep learning."
        phrases = _extract_phrases(text)
        assert "machine learning" in phrases
        assert "deep learning" in phrases

    def test_extracts_soft_skills(self):
        text = "Strong problem solving and critical thinking required."
        phrases = _extract_phrases(text)
        assert "problem solving" in phrases
        assert "critical thinking" in phrases

    def test_no_duplicates(self):
        text = "machine learning machine learning machine learning"
        phrases = _extract_phrases(text)
        assert phrases.count("machine learning") == 1


# ===========================================================================
# Test: Smart keyword extraction from JD
# ===========================================================================

class TestKeywordExtraction:
    def test_extracts_tech_terms(self):
        keywords = _extract_meaningful_keywords(SWE_JOB_DESCRIPTION)
        terms = [k["term"] for k in keywords]
        assert "python" in terms
        assert "kubernetes" in terms or "docker" in terms
        assert "aws" in terms or "amazon web services" in terms

    def test_filters_filler_words(self):
        keywords = _extract_meaningful_keywords(SWE_JOB_DESCRIPTION)
        terms = [k["term"] for k in keywords]
        # Generic filler should be excluded
        assert "role" not in terms
        assert "team" not in terms
        assert "looking" not in terms
        assert "company" not in terms

    def test_has_importance_levels(self):
        keywords = _extract_meaningful_keywords(SWE_JOB_DESCRIPTION)
        importances = {k["importance"] for k in keywords}
        # Should have at least 2 different importance levels
        assert len(importances) >= 2

    def test_has_categories(self):
        keywords = _extract_meaningful_keywords(SWE_JOB_DESCRIPTION)
        categories = {k["category"] for k in keywords}
        assert "tool" in categories

    def test_capped_at_60(self):
        # Even with a very long JD, we cap at 60 keywords
        long_jd = SWE_JOB_DESCRIPTION * 5
        keywords = _extract_meaningful_keywords(long_jd)
        assert len(keywords) <= 60

    def test_data_engineer_jd(self):
        keywords = _extract_meaningful_keywords(DATA_ENGINEER_JD)
        terms = [k["term"] for k in keywords]
        assert "sql" in terms or "snowflake" in terms or "spark" in terms


# ===========================================================================
# Test: Term matching (synonym + stem aware)
# ===========================================================================

class TestTermMatching:
    def test_exact_match(self):
        assert _term_in_text("python", "experience with python and java", {"python", "java"}, {"python", "java"})

    def test_synonym_match(self):
        """'k8s' in JD should match 'kubernetes' in resume."""
        resume_words = {"kubernetes", "docker"}
        resume_stems = {_stem(w) for w in resume_words}
        assert _term_in_text("k8s", "kubernetes docker", resume_words, resume_stems)

    def test_reverse_synonym(self):
        """'kubernetes' in JD should match 'k8s' in resume."""
        resume_words = {"k8s", "docker"}
        resume_stems = {_stem(w) for w in resume_words}
        assert _term_in_text("kubernetes", "k8s docker", resume_words, resume_stems)

    def test_multiword_phrase(self):
        resume_words = set(_tokenize("I use machine learning daily"))
        resume_stems = {_stem(w) for w in resume_words}
        assert _term_in_text("machine learning", "i use machine learning daily", resume_words, resume_stems)

    def test_no_match(self):
        resume_words = {"python", "django"}
        resume_stems = {_stem(w) for w in resume_words}
        assert not _term_in_text("kubernetes", "python django", resume_words, resume_stems)


# ===========================================================================
# Test: Keyword scoring
# ===========================================================================

class TestKeywordScoring:
    def test_strong_resume_high_score(self):
        """Strong SWE resume vs matching SWE JD should score well."""
        score, matched, missing, density, details = _score_keywords(
            STRONG_SWE_RESUME, SWE_JOB_DESCRIPTION
        )
        assert score >= 40, f"Expected ≥40 for strong match, got {score}"
        assert len(matched) >= 15, f"Should match many keywords, got {len(matched)}"

    def test_weak_resume_low_score(self):
        """Weak resume with no real skills should score poorly."""
        score, matched, missing, density, details = _score_keywords(
            WEAK_RESUME, SWE_JOB_DESCRIPTION
        )
        assert score < 30, f"Expected <30 for weak resume, got {score}"

    def test_career_switch_moderate_score(self):
        """Career switcher should have partial overlap."""
        score, matched, missing, density, details = _score_keywords(
            CAREER_SWITCHER_RESUME, SWE_JOB_DESCRIPTION
        )
        assert 15 <= score <= 70, f"Career switcher should be moderate, got {score}"

    def test_unrelated_resume_very_low(self):
        """Marine biologist vs SWE JD should score very low on keywords."""
        score, matched, missing, density, details = _score_keywords(
            WELL_FORMATTED_NO_MATCH_RESUME, SWE_JOB_DESCRIPTION
        )
        assert score < 20, f"Expected <20 for unrelated field, got {score}"

    def test_details_contain_found_flag(self):
        _, _, _, _, details = _score_keywords(STRONG_SWE_RESUME, SWE_JOB_DESCRIPTION)
        assert all("found" in d for d in details)
        found_count = sum(1 for d in details if d["found"])
        assert found_count > 0


# ===========================================================================
# Test: Section scoring
# ===========================================================================

class TestSectionScoring:
    def test_strong_resume_all_sections(self):
        score, flags = _score_sections(STRONG_SWE_RESUME)
        assert score >= 80
        assert flags["has_contact_info"]
        assert flags["has_summary"]
        assert flags["has_experience"]
        assert flags["has_education"]
        assert flags["has_skills"]

    def test_weak_resume_missing_sections(self):
        score, flags = _score_sections(WEAK_RESUME)
        assert score < 40
        assert not flags["has_summary"]
        assert not flags["has_experience"]
        assert not flags["has_education"]
        assert not flags["has_skills"]

    def test_career_switcher_has_sections(self):
        score, flags = _score_sections(CAREER_SWITCHER_RESUME)
        assert flags["has_contact_info"]
        assert flags["has_summary"]
        assert flags["has_skills"]
        assert flags["has_education"]


# ===========================================================================
# Test: Formatting scoring
# ===========================================================================

class TestFormattingScoring:
    def test_strong_resume_good_formatting(self):
        score, flags = _score_formatting(STRONG_SWE_RESUME)
        assert score >= 50
        assert flags["has_bullet_points"]
        assert flags["has_action_verbs"]

    def test_weak_resume_bad_formatting(self):
        score, flags = _score_formatting(WEAK_RESUME)
        assert score < 50
        assert not flags["has_bullet_points"]

    def test_pronoun_detection(self):
        """Weak resume uses 'I' and 'My' — formatting should penalise."""
        score, flags = _score_formatting(WEAK_RESUME)
        # Pronouns reduce score via the 15-pt component
        assert score < 50


# ===========================================================================
# Test: Impact analysis (quantified achievements)
# ===========================================================================

class TestImpactAnalysis:
    def test_strong_resume_high_impact(self):
        impact = _analyse_impact(STRONG_SWE_RESUME)
        assert impact["score"] >= 40
        assert impact["quantified_count"] >= 3
        assert impact["total_bullets"] >= 5

    def test_weak_resume_no_impact(self):
        impact = _analyse_impact(WEAK_RESUME)
        assert impact["score"] == 0
        assert impact["total_bullets"] == 0

    def test_career_switcher_some_impact(self):
        impact = _analyse_impact(CAREER_SWITCHER_RESUME)
        assert impact["total_bullets"] >= 3
        # Should find some quantified bullets (22%, 150+)
        assert impact["quantified_count"] >= 1

    def test_strong_examples_populated(self):
        impact = _analyse_impact(STRONG_SWE_RESUME)
        assert len(impact["strong_examples"]) > 0

    def test_tips_provided(self):
        impact = _analyse_impact(WEAK_RESUME)
        assert len(impact["tips"]) > 0


# ===========================================================================
# Test: Resume metrics
# ===========================================================================

class TestResumeMetrics:
    def test_strong_resume_good_length(self):
        metrics = _analyse_resume_metrics(STRONG_SWE_RESUME)
        assert metrics["word_count"] > 100
        assert metrics["length_verdict"] in ("good", "slightly_long", "short")

    def test_weak_resume_too_short(self):
        metrics = _analyse_resume_metrics(WEAK_RESUME)
        assert metrics["length_verdict"] in ("too_short", "short")

    def test_pronoun_count(self):
        metrics = _analyse_resume_metrics(WEAK_RESUME)
        assert metrics["pronoun_count"] >= 4  # "I" used many times

    def test_bullet_avg(self):
        metrics = _analyse_resume_metrics(STRONG_SWE_RESUME)
        assert metrics["avg_bullet_words"] > 5  # bullets should be meaningful


# ===========================================================================
# Test: Repetition detection
# ===========================================================================

class TestRepetitionDetection:
    def test_no_excessive_repetition_in_good_resume(self):
        flags = _detect_repetition(STRONG_SWE_RESUME)
        # Good resumes use variety; expect few or no flags
        assert len(flags) <= 5

    def test_detects_repeated_words(self):
        repetitive = "managed managed managed managed managed the team. managed things."
        flags = _detect_repetition(repetitive)
        assert any(f["word"] == "managed" for f in flags)


# ===========================================================================
# Test: Categorised keywords
# ===========================================================================

class TestCategorisedKeywords:
    def test_categories_populated(self):
        _, _, _, _, details = _score_keywords(STRONG_SWE_RESUME, SWE_JOB_DESCRIPTION)
        cats = _categorise_keywords(details)
        assert "tool" in cats
        assert "hard_skill" in cats
        assert "soft_skill" in cats
        assert "certification" in cats

    def test_tools_matched(self):
        _, _, _, _, details = _score_keywords(STRONG_SWE_RESUME, SWE_JOB_DESCRIPTION)
        cats = _categorise_keywords(details)
        assert len(cats["tool"]["matched"]) > 0


# ===========================================================================
# Test: Priority actions
# ===========================================================================

class TestPriorityActions:
    def test_weak_resume_has_critical_actions(self):
        _, matched, missing, density, details = _score_keywords(WEAK_RESUME, SWE_JOB_DESCRIPTION)
        _, section_flags = _score_sections(WEAK_RESUME)
        fmt_score, fmt_flags = _score_formatting(WEAK_RESUME)
        all_flags = {**section_flags, **fmt_flags}
        impact = _analyse_impact(WEAK_RESUME)
        metrics = _analyse_resume_metrics(WEAK_RESUME)
        repetition = _detect_repetition(WEAK_RESUME)

        actions = _build_priority_actions(
            keyword_score=10, formatting_score=fmt_score, section_score=20,
            flags=all_flags, missing_keywords=missing,
            keyword_details=details, impact=impact,
            metrics=metrics, repetition=repetition,
        )
        priorities = [a["priority"] for a in actions]
        assert "critical" in priorities, "Weak resume should have critical action items"

    def test_strong_resume_fewer_actions(self):
        score, matched, missing, density, details = _score_keywords(STRONG_SWE_RESUME, SWE_JOB_DESCRIPTION)
        _, section_flags = _score_sections(STRONG_SWE_RESUME)
        fmt_score, fmt_flags = _score_formatting(STRONG_SWE_RESUME)
        all_flags = {**section_flags, **fmt_flags}
        impact = _analyse_impact(STRONG_SWE_RESUME)
        metrics = _analyse_resume_metrics(STRONG_SWE_RESUME)
        repetition = _detect_repetition(STRONG_SWE_RESUME)

        actions = _build_priority_actions(
            keyword_score=score, formatting_score=fmt_score, section_score=90,
            flags=all_flags, missing_keywords=missing,
            keyword_details=details, impact=impact,
            metrics=metrics, repetition=repetition,
        )
        critical_count = sum(1 for a in actions if a["priority"] == "critical")
        # Strong resume should have 0-2 critical items at most
        assert critical_count <= 2

    def test_actions_have_required_fields(self):
        _, _, missing, _, details = _score_keywords(WEAK_RESUME, SWE_JOB_DESCRIPTION)
        impact = _analyse_impact(WEAK_RESUME)
        metrics = _analyse_resume_metrics(WEAK_RESUME)

        actions = _build_priority_actions(
            keyword_score=10, formatting_score=20, section_score=20,
            flags={}, missing_keywords=missing,
            keyword_details=details, impact=impact,
            metrics=metrics, repetition=[],
        )
        for action in actions:
            assert "priority" in action
            assert "action" in action
            assert "section" in action
            assert action["priority"] in ("critical", "high", "medium", "low")


# ===========================================================================
# Test: End-to-end scoring scenarios
# ===========================================================================

class TestEndToEndScoring:
    """
    Full pipeline tests combining all scoring functions.
    """

    def test_scenario_strong_match(self):
        """Strong SWE resume vs SWE JD → high overall score."""
        kw_score, matched, missing, density, details = _score_keywords(STRONG_SWE_RESUME, SWE_JOB_DESCRIPTION)
        sec_score, _ = _score_sections(STRONG_SWE_RESUME)
        fmt_score, _ = _score_formatting(STRONG_SWE_RESUME)
        impact = _analyse_impact(STRONG_SWE_RESUME)

        overall = round(kw_score * 0.35 + sec_score * 0.25 + fmt_score * 0.20 + impact["score"] * 0.20)
        assert overall >= 50, f"Strong match overall should be ≥50, got {overall}"

    def test_scenario_weak_resume(self):
        """Bare-minimum resume → low overall score."""
        kw_score, _, _, _, _ = _score_keywords(WEAK_RESUME, SWE_JOB_DESCRIPTION)
        sec_score, _ = _score_sections(WEAK_RESUME)
        fmt_score, _ = _score_formatting(WEAK_RESUME)
        impact = _analyse_impact(WEAK_RESUME)

        overall = round(kw_score * 0.35 + sec_score * 0.25 + fmt_score * 0.20 + impact["score"] * 0.20)
        assert overall < 25, f"Weak resume overall should be <25, got {overall}"

    def test_scenario_career_switcher(self):
        """Career switcher — some skills, missing many: mid-range."""
        kw_score, _, _, _, _ = _score_keywords(CAREER_SWITCHER_RESUME, SWE_JOB_DESCRIPTION)
        sec_score, _ = _score_sections(CAREER_SWITCHER_RESUME)
        fmt_score, _ = _score_formatting(CAREER_SWITCHER_RESUME)
        impact = _analyse_impact(CAREER_SWITCHER_RESUME)

        overall = round(kw_score * 0.35 + sec_score * 0.25 + fmt_score * 0.20 + impact["score"] * 0.20)
        assert 20 <= overall <= 75, f"Career switcher should be mid-range, got {overall}"

    def test_scenario_wrong_field(self):
        """Marine biologist vs SWE JD → very low keyword score."""
        kw_score, matched, missing, _, _ = _score_keywords(
            WELL_FORMATTED_NO_MATCH_RESUME, SWE_JOB_DESCRIPTION
        )
        assert kw_score < 20
        assert len(missing) > len(matched)

    def test_scenario_data_engineer_cross_match(self):
        """Strong SWE resume vs Data Engineer JD — partial overlap expected."""
        kw_score, matched, missing, _, details = _score_keywords(
            STRONG_SWE_RESUME, DATA_ENGINEER_JD
        )
        # SWE resume has Python, SQL, Kafka, AWS but misses Spark, Airflow, dbt, Snowflake
        assert 20 <= kw_score <= 70, f"Cross-domain match should be partial, got {kw_score}"
        matched_terms = set(matched)
        # Should match at least Python and some cloud/data terms
        has_python = any("python" in t for t in matched_terms)
        assert has_python, "Python should be matched"


# ===========================================================================
# Finance / cross-industry test fixtures
# ===========================================================================

FINANCE_ANALYST_RESUME = """
Emily Zhang
emily.zhang@email.com | +1 (212) 555-8901 | New York, NY
linkedin.com/in/emilyzhang

Professional Summary
Detail-oriented Financial Analyst with 5+ years of experience in investment
banking and corporate finance. Adept at financial modeling, valuation, and
strategic analysis for M&A transactions and capital markets.

Work Experience

Senior Financial Analyst — Goldman Sachs
Mar 2021 – Present
• Built 50+ DCF and LBO models for M&A transactions totaling $8B+ in deal value.
• Conducted due diligence on 12 potential acquisition targets across technology and healthcare sectors.
• Prepared pitch books and investment memoranda for C-suite client presentations.
• Developed automated financial reporting dashboards in Excel VBA, reducing manual work by 40%.
• Collaborated with legal, compliance, and portfolio management teams on deal execution.

Financial Analyst — JP Morgan Chase
Jul 2018 – Feb 2021
• Performed valuation analysis (DCF, comparable companies, precedent transactions) for IPO advisory.
• Created detailed P&L forecasts and scenario analyses for Fortune 500 clients.
• Managed quarterly earnings models and variance analysis for coverage universe of 15 companies.
• Automated data extraction from Bloomberg Terminal and Capital IQ using VBA macros.
• Streamlined FP&A reporting process, reducing month-end close time by 3 days.

Education
MBA, Finance — Columbia Business School, 2021
B.S. Finance, Minor in Mathematics — NYU Stern School of Business, 2018
GPA: 3.9/4.0

Skills
Financial Modeling, DCF, LBO, M&A, Valuation
Excel, VBA, Bloomberg Terminal, Capital IQ, FactSet
Python, SQL, Tableau, Power BI
GAAP, IFRS, Financial Reporting
FP&A, Budgeting, Variance Analysis, Forecasting
P&L Management, Revenue Analysis, Scenario Modeling

Certifications
CFA Level III Candidate
Series 7, Series 63
Bloomberg Market Concepts
"""

FINANCE_JD = """
Senior Financial Analyst — Morgan Stanley

About the Role:
We are seeking a Senior Financial Analyst to join our Investment Banking
Division. The role supports M&A advisory and capital markets transactions
for technology and healthcare clients.

Requirements:
- 4+ years of experience in investment banking, corporate finance, or FP&A
- Strong financial modeling skills (DCF, LBO, comparable companies, precedent transactions)
- Advanced Excel and VBA proficiency
- Experience with Bloomberg Terminal, Capital IQ, or FactSet
- Solid understanding of GAAP and/or IFRS accounting standards
- Experience preparing pitch books, investment memoranda, and client presentations
- Strong analytical skills and attention to detail
- Excellent communication and presentation skills
- Proficiency in P&L analysis and variance reporting
- Experience with budgeting, forecasting, and scenario analysis

Nice to Have:
- CFA designation or progress toward CFA
- MBA from a top-tier program
- Experience with Python or SQL for data analysis
- Knowledge of Tableau or Power BI for data visualization
- Series 7 and/or Series 63 licenses
- Experience in technology or healthcare sector coverage
"""

MARKETING_RESUME = """
Priya Sharma
priya.sharma@email.com | +1 (415) 555-2345

Professional Summary
Data-driven Digital Marketing Manager with 6 years of experience in SEM,
SEO, and content marketing. Proven track record of driving revenue growth
through multi-channel campaigns.

Work Experience

Digital Marketing Manager — HubSpot
Jan 2021 – Present
• Managed $2M annual PPC budget across Google Ads and Facebook Ads, achieving 3.2x ROAS.
• Increased organic traffic by 85% through comprehensive SEO strategy and content optimization.
• Built marketing automation workflows in HubSpot, improving lead nurture conversion by 45%.
• Led A/B testing program resulting in 28% improvement in email CTR.
• Collaborated with product and sales teams to align GTM strategy.

Marketing Specialist — Salesforce
Jun 2018 – Dec 2020
• Executed SEM campaigns across Google, Bing, and LinkedIn generating 500+ MQLs/month.
• Managed CRM data hygiene and segmentation for 100K+ contacts in Salesforce.
• Created dashboards in Google Analytics and Tableau to track campaign performance.
• Reduced CPA by 32% through audience targeting optimization and bid management.

Education
B.A. Marketing — UC Berkeley, 2018

Skills
Google Ads, Facebook Ads, LinkedIn Ads, SEM, SEO, PPC
Google Analytics, Tableau, HubSpot, Salesforce, Marketo
A/B Testing, Content Marketing, Email Marketing, CRM
Marketing Automation, Lead Generation, Conversion Optimization

Certifications
Google Ads Certified
HubSpot Inbound Marketing Certified
Google Analytics Certified
"""


# ===========================================================================
# Test: Industry detection
# ===========================================================================

class TestIndustryDetection:
    def test_detect_tech_jd(self):
        assert _detect_industry(SWE_JOB_DESCRIPTION) == "tech"

    def test_detect_finance_jd(self):
        assert _detect_industry(FINANCE_JD) == "finance"

    def test_detect_generic_text(self):
        result = _detect_industry("We are looking for a team player who works hard.")
        assert result == "general"


# ===========================================================================
# Test: Finance synonym matching
# ===========================================================================

class TestFinanceSynonyms:
    def test_fpa_normalises(self):
        canon = _normalise_term("fp&a")
        assert "financial planning" in canon or canon == "fp&a"

    def test_dcf_normalises(self):
        canon = _normalise_term("dcf")
        assert "discounted cash flow" in canon or canon == "dcf"

    def test_gaap_normalises(self):
        canon = _normalise_term("gaap")
        assert "generally accepted" in canon or canon == "gaap"

    def test_cfa_classified_as_certification(self):
        assert _classify_term("cfa") == "certification"

    def test_cpa_classified_as_certification(self):
        assert _classify_term("cpa") == "certification"

    def test_bloomberg_classified_as_tool(self):
        assert _classify_term("bloomberg") == "tool"


# ===========================================================================
# Test: Finance tokenizer handles & and /
# ===========================================================================

class TestFinanceTokenizer:
    def test_fp_and_a(self):
        tokens = _tokenize("Experience with FP&A reporting")
        assert "fp&a" in tokens

    def test_p_and_l(self):
        tokens = _tokenize("P&L management and analysis")
        assert "p&l" in tokens

    def test_m_and_a(self):
        tokens = _tokenize("M&A advisory experience required")
        assert "m&a" in tokens

    def test_ci_cd(self):
        tokens = _tokenize("Experience with CI/CD pipelines")
        assert "ci/cd" in tokens


# ===========================================================================
# Test: Finance keyword extraction
# ===========================================================================

class TestFinanceKeywordExtraction:
    def test_extracts_finance_terms(self):
        keywords = _extract_meaningful_keywords(FINANCE_JD)
        terms = [k["term"] for k in keywords]
        # Should find key finance terms
        found_dcf = any("dcf" in t or "discounted cash flow" in t for t in terms)
        found_lbo = any("lbo" in t or "leveraged buyout" in t for t in terms)
        found_gaap = any("gaap" in t or "generally accepted" in t for t in terms)
        found_bloomberg = any("bloomberg" in t for t in terms)
        assert found_dcf, f"Should find DCF in finance JD, got terms: {terms[:20]}"
        assert found_lbo, f"Should find LBO in finance JD, got terms: {terms[:20]}"
        assert found_gaap or found_bloomberg, f"Should find GAAP or Bloomberg, got: {terms[:20]}"

    def test_extracts_fpa(self):
        keywords = _extract_meaningful_keywords(FINANCE_JD)
        terms = [k["term"] for k in keywords]
        found_fpa = any("fp&a" in t or "financial planning" in t for t in terms)
        assert found_fpa, f"Should find FP&A, got terms: {terms[:20]}"

    def test_no_generic_filler(self):
        keywords = _extract_meaningful_keywords(FINANCE_JD)
        terms = [k["term"] for k in keywords]
        assert "role" not in terms
        assert "company" not in terms
        assert "looking" not in terms


# ===========================================================================
# Test: Finance keyword scoring
# ===========================================================================

class TestFinanceScoring:
    def test_finance_resume_vs_finance_jd_high_score(self):
        """Finance analyst resume vs finance JD should score well."""
        score, matched, missing, density, details = _score_keywords(
            FINANCE_ANALYST_RESUME, FINANCE_JD
        )
        assert score >= 40, f"Finance match should be ≥40, got {score}"
        assert len(matched) >= 10, f"Should match many finance terms, got {len(matched)}: {matched}"

    def test_tech_resume_vs_finance_jd_low_score(self):
        """SWE resume vs finance JD should score low on keywords."""
        score, matched, missing, density, details = _score_keywords(
            STRONG_SWE_RESUME, FINANCE_JD
        )
        assert score < 40, f"Tech vs finance cross-domain should be <40, got {score}"

    def test_finance_resume_vs_tech_jd_partial(self):
        """Finance resume vs SWE JD — partial overlap (Python, SQL)."""
        score, matched, missing, density, details = _score_keywords(
            FINANCE_ANALYST_RESUME, SWE_JOB_DESCRIPTION
        )
        assert score < 50, f"Finance vs tech should be <50, got {score}"
        # Should match Python, SQL, communication
        matched_lower = [m.lower() for m in matched]
        has_python = any("python" in m for m in matched_lower)
        assert has_python, f"Should match Python at least, got: {matched}"

    def test_finance_e2e_overall(self):
        """Full pipeline: finance resume vs finance JD."""
        kw_score, matched, missing, density, details = _score_keywords(
            FINANCE_ANALYST_RESUME, FINANCE_JD
        )
        sec_score, _ = _score_sections(FINANCE_ANALYST_RESUME)
        fmt_score, _ = _score_formatting(FINANCE_ANALYST_RESUME)
        impact = _analyse_impact(FINANCE_ANALYST_RESUME)

        overall = round(kw_score * 0.35 + sec_score * 0.25 + fmt_score * 0.20 + impact["score"] * 0.20)
        assert overall >= 50, f"Finance E2E overall should be ≥50, got {overall}"


# ===========================================================================
# Test: Cross-industry importance tier boost
# ===========================================================================

class TestImportanceTierBoost:
    def test_taxonomy_boost_promotes_tier(self):
        """A taxonomy term at ratio 0.3 should become 'medium' or higher with boost."""
        # Without boost: ratio 0.3 → medium (0.2-0.4)
        assert _importance_tier(3, 10) == "medium"
        # With boost: effective ratio = 0.3 * 1.5 = 0.45 → high
        assert _importance_tier(3, 10, is_taxonomy_term=True) == "high"

    def test_no_boost_normal_term(self):
        """Non-taxonomy term at ratio 0.3 should stay medium."""
        assert _importance_tier(3, 10, is_taxonomy_term=False) == "medium"
