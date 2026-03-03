"""
Analysis service — heuristic ATS scoring engine.

Features:
- Smart keyword extraction with multi-industry taxonomy & synonym mapping
- Frequency-weighted keyword importance (critical / high / medium / low)
- Categorised skill matching (hard skills, soft skills, tools, certifications)
- Quantified-impact detection (numbers, %, $) in bullet points
- Resume metrics: word count, section balance, pronoun usage
- Repetition / overused-word flagging
- Prioritised action items with concrete rewrite examples
- Deeper formatting analysis (date consistency, pronoun use, bullet quality)
- Industry detection (tech, finance, healthcare, marketing)
"""

from __future__ import annotations

import hashlib
import re
from collections import Counter
from decimal import Decimal
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.analysis_model import AnalysisResult, JobDescription
from app.models.resume_model import Resume
from app.schemas.analysis_schema import AnalysisResultRead
from app.services.ai_analysis_service import enhance_analysis

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ANALYSIS_VERSION = "3.0"

# ── Extended stopwords (also filters JD filler) ──────────────────────────────

_STOPWORDS = frozenset({
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "up", "about", "as", "is", "was", "are",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "shall", "must",
    "can", "that", "this", "these", "those", "we", "you", "they", "their",
    "our", "its", "it", "not", "no", "so", "if", "then", "than", "when",
    "where", "which", "who", "whom", "what", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "into", "through",
    "during", "before", "after", "above", "below", "between", "out", "off",
    "over", "under", "again", "further", "once", "here", "there", "while",
    "am", "per", "via", "i", "me", "he", "she", "him", "her", "us", "them",
})

# Words that appear in almost every JD and add no signal
_JD_FILLER = frozenset({
    "role", "position", "candidate", "team", "company", "job", "work",
    "working", "join", "apply", "looking", "opportunity", "ideal",
    "responsibilities", "requirements", "qualifications", "including",
    "ability", "strong", "excellent", "preferred", "required", "plus",
    "environment", "benefits", "salary", "equal", "employer", "employment",
    "location", "office", "remote", "hybrid", "full", "time", "part",
    "year", "years", "experience", "based", "within", "across", "also",
    "using", "used", "use", "well", "new", "help", "ensure", "like",
    "provide", "support", "make", "related", "relevant", "include",
    "knowledge", "understanding", "familiarity", "etc", "minimum",
    "bachelor", "master", "degree", "equivalent", "bonus",
})

# ── Tech / tool taxonomy (lowercase) ────────────────────────────────────────

_TECH_TOOLS: frozenset[str] = frozenset({
    # Languages
    "python", "javascript", "typescript", "java", "csharp", "c#", "c++",
    "cpp", "golang", "go", "rust", "ruby", "php", "swift", "kotlin",
    "scala", "r", "matlab", "perl", "lua", "haskell", "elixir", "dart",
    "sql", "html", "css", "sass", "less", "graphql", "bash", "shell",
    "powershell",
    # Frontend
    "react", "reactjs", "react.js", "nextjs", "next.js", "angular",
    "angularjs", "vue", "vuejs", "vue.js", "svelte", "nuxt", "nuxtjs",
    "gatsby", "remix", "astro", "webpack", "vite", "tailwind", "tailwindcss",
    "bootstrap", "material-ui", "mui", "chakra", "storybook", "redux",
    "zustand", "mobx", "jquery",
    # Backend
    "node", "nodejs", "node.js", "express", "expressjs", "fastapi",
    "django", "flask", "spring", "springboot", "spring boot", "rails",
    "rubyonrails", "laravel", "nestjs", "nest.js", "gin", "fiber",
    "aspnet", "asp.net", ".net", "dotnet",
    # Databases
    "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite",
    "cassandra", "dynamodb", "couchdb", "neo4j", "elasticsearch",
    "opensearch", "supabase", "firebase", "firestore", "mariadb",
    "mssql", "oracle",
    # Cloud & Infra
    "aws", "azure", "gcp", "google cloud", "heroku", "vercel", "netlify",
    "digitalocean", "cloudflare", "terraform", "pulumi", "ansible",
    "docker", "kubernetes", "k8s", "helm", "ecs", "eks", "fargate",
    "lambda", "s3", "ec2", "rds", "cloudformation", "serverless",
    # DevOps / CI/CD
    "jenkins", "github actions", "gitlab ci", "circleci", "travis",
    "argo", "argocd", "datadog", "grafana", "prometheus", "splunk",
    "newrelic", "new relic", "pagerduty", "nginx", "apache", "caddy",
    # Data & ML
    "pandas", "numpy", "scipy", "scikit-learn", "sklearn", "tensorflow",
    "pytorch", "keras", "xgboost", "lightgbm", "spark", "pyspark",
    "hadoop", "airflow", "dbt", "snowflake", "bigquery", "redshift",
    "databricks", "mlflow", "sagemaker", "huggingface", "langchain",
    "openai", "llm", "nlp", "computer vision", "deep learning",
    "machine learning", "data science", "data engineering",
    # Testing
    "jest", "mocha", "cypress", "playwright", "selenium", "pytest",
    "unittest", "rspec", "junit", "testng", "vitest", "testing library",
    # Tools & Misc
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "slack", "figma", "postman", "swagger", "openapi", "linux", "unix",
    "macos", "windows", "vim", "vscode",
    # Messaging / Queues
    "kafka", "rabbitmq", "sqs", "sns", "pubsub", "nats", "celery",
    # API styles
    "rest", "restful", "grpc", "websocket", "websockets", "soap",
    # Methodologies (treated as tools/processes)
    "agile", "scrum", "kanban", "ci/cd", "cicd", "devops", "sre",
    "microservices", "monorepo", "tdd", "bdd",
    # Additional languages used in finance / data
    "vba", "sas", "stata",
})

# ── Finance / business tools & concepts ──────────────────────────────────────

_FINANCE_TOOLS: frozenset[str] = frozenset({
    # Software & platforms
    "excel", "bloomberg", "bloomberg terminal", "reuters", "refinitiv",
    "factset", "capital iq", "pitchbook", "morningstar", "argus",
    "quickbooks", "netsuite", "sap", "oracle financials", "hyperion",
    "anaplan", "adaptive insights", "workday", "concur", "coupa",
    "blackline", "tableau", "power bi", "alteryx", "looker",
    "salesforce", "hubspot",
    # Concepts & frameworks
    "financial modeling", "financial analysis", "financial reporting",
    "financial planning", "financial statements", "financial controls",
    "dcf", "discounted cash flow", "lbo", "leveraged buyout",
    "merger model", "accretion dilution", "comparable analysis",
    "comps", "precedent transactions",
    "valuation", "equity research", "credit analysis",
    "risk management", "risk assessment", "portfolio management",
    "asset management", "wealth management", "investment banking",
    "private equity", "venture capital", "hedge fund",
    "derivatives", "fixed income", "equities", "forex",
    "options", "futures", "swaps", "bonds", "securities",
    "compliance", "regulatory compliance", "sox", "sarbanes-oxley",
    "gaap", "ifrs", "us gaap", "fasb",
    "budgeting", "forecasting", "variance analysis",
    "revenue recognition", "cost accounting", "management accounting",
    "accounts payable", "accounts receivable", "general ledger",
    "reconciliation", "consolidation", "intercompany",
    "audit", "internal audit", "external audit",
    "tax", "tax planning", "tax compliance", "transfer pricing",
    "treasury", "cash management", "liquidity",
    "credit risk", "market risk", "operational risk",
    "basel", "dodd-frank", "mifid", "aml", "kyc",
    "esg", "sustainable finance",
    # Metrics & KPIs
    "roi", "irr", "npv", "ebitda", "eps", "roe",
    "wacc", "cagr", "free cash flow", "working capital",
    "gross margin", "operating margin", "net margin",
    # Processes
    "due diligence", "ipo", "m&a", "mergers and acquisitions",
    "fundraising", "capital raising", "debt restructuring",
    "fp&a", "financial planning and analysis",
    "p&l", "profit and loss", "balance sheet", "income statement",
    "cash flow statement", "10-k", "10-q", "sec filing",
})

# ── Healthcare / life sciences tools ─────────────────────────────────────────

_HEALTHCARE_TOOLS: frozenset[str] = frozenset({
    "epic", "cerner", "meditech", "allscripts", "athenahealth",
    "hl7", "fhir", "icd-10", "cpt", "hipaa", "phi",
    "ehr", "emr", "electronic health record",
    "clinical trials", "fda", "gcp", "good clinical practice",
    "pharmacovigilance", "regulatory affairs",
    "medical device", "drug development", "clinical research",
    "patient care", "healthcare analytics",
    "revenue cycle management", "medical coding", "medical billing",
})

# ── Marketing / product tools ────────────────────────────────────────────────

_MARKETING_TOOLS: frozenset[str] = frozenset({
    "google analytics", "google ads", "facebook ads", "meta ads",
    "seo", "sem", "ppc", "cro", "a/b testing",
    "hubspot", "marketo", "mailchimp", "sendgrid",
    "hootsuite", "sprout social", "buffer",
    "adobe creative suite", "photoshop", "illustrator",
    "canva", "sketch",
    "content marketing", "social media marketing", "email marketing",
    "brand strategy", "digital marketing", "growth marketing",
    "marketing automation", "lead generation", "demand generation",
    "copywriting", "content strategy", "product marketing",
    "customer acquisition", "retention", "churn",
    "google tag manager", "mixpanel", "amplitude", "segment",
})

# Combined industry tools for classification
_ALL_INDUSTRY_TOOLS: frozenset[str] = (
    _TECH_TOOLS | _FINANCE_TOOLS | _HEALTHCARE_TOOLS | _MARKETING_TOOLS
)

# ── Soft skills ──────────────────────────────────────────────────────────────

_SOFT_SKILLS: frozenset[str] = frozenset({
    "leadership", "communication", "teamwork", "collaboration",
    "problem solving", "problem-solving", "critical thinking",
    "time management", "adaptability", "creativity", "mentoring",
    "negotiation", "presentation", "conflict resolution", "empathy",
    "decision making", "decision-making", "strategic thinking",
    "interpersonal", "self-motivated", "analytical", "detail-oriented",
    "detail oriented", "multitasking", "prioritization", "accountability",
    "stakeholder management", "cross-functional", "cross functional",
})

# ── Certification patterns ───────────────────────────────────────────────────

_CERTIFICATIONS: frozenset[str] = frozenset({
    # Tech
    "aws certified", "aws solutions architect", "aws developer",
    "aws sysops", "azure certified", "az-900", "az-104", "az-204",
    "az-305", "az-400", "gcp certified", "google certified",
    "pmp", "prince2", "itil", "cissp", "cism", "ceh",
    "comptia", "security+", "network+", "a+",
    "scrum master", "csm", "psm", "safe", "safe agilist",
    "six sigma", "lean six sigma",
    "cka", "ckad", "cks",
    "terraform certified", "hashicorp certified",
    "docker certified", "dca",
    "salesforce certified", "salesforce administrator",
    "ccna", "ccnp",
    "ocjp", "ocpjp",
    "data engineer", "data analyst", "machine learning engineer",
    # Finance & Accounting
    "cfa", "chartered financial analyst",
    "cpa", "certified public accountant",
    "cma", "certified management accountant",
    "frm", "financial risk manager",
    "caia", "chartered alternative investment analyst",
    "cfp", "certified financial planner",
    "cia", "certified internal auditor",
    "acca", "series 7", "series 63", "series 66",
    "finra", "bloomberg market concepts",
    "fmva", "financial modeling valuation analyst",
    # Healthcare
    "hipaa certified", "cphims", "rhia", "rhit",
    # Marketing
    "google analytics certified", "hubspot certified",
    "google ads certified", "facebook blueprint",
    "hootsuite certified",
})

# ── Synonym / abbreviation map (bidirectional matching) ──────────────────────

_SYNONYMS: dict[str, list[str]] = {
    # ── Tech ──
    "javascript": ["js", "ecmascript", "es6", "es2015"],
    "typescript": ["ts"],
    "python": ["py"],
    "golang": ["go"],
    "csharp": ["c#", "c sharp"],
    "c++": ["cpp", "cplusplus"],
    "react": ["reactjs", "react.js"],
    "angular": ["angularjs"],
    "vue": ["vuejs", "vue.js"],
    "next.js": ["nextjs", "next"],
    "node.js": ["nodejs", "node"],
    "express": ["expressjs", "express.js"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "kubernetes": ["k8s"],
    "amazon web services": ["aws"],
    "google cloud platform": ["gcp", "google cloud"],
    "microsoft azure": ["azure"],
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "continuous integration": ["ci", "ci/cd", "cicd"],
    "continuous deployment": ["cd"],
    "infrastructure as code": ["iac"],
    "project management professional": ["pmp"],
    "test driven development": ["tdd"],
    "behavior driven development": ["bdd"],
    "application programming interface": ["api"],
    "rest": ["restful", "rest api"],
    "graphql": ["gql"],
    "tailwindcss": ["tailwind", "tailwind css"],
    ".net": ["dotnet", "asp.net", "aspnet"],
    # ── Finance & Accounting ──
    "financial planning and analysis": ["fp&a", "fpa"],
    "profit and loss": ["p&l", "pnl"],
    "mergers and acquisitions": ["m&a", "ma"],
    "discounted cash flow": ["dcf"],
    "leveraged buyout": ["lbo"],
    "earnings before interest taxes depreciation and amortization": ["ebitda"],
    "return on investment": ["roi"],
    "generally accepted accounting principles": ["gaap"],
    "international financial reporting standards": ["ifrs"],
    "chartered financial analyst": ["cfa"],
    "certified public accountant": ["cpa"],
    "certified management accountant": ["cma"],
    "financial risk manager": ["frm"],
    "net present value": ["npv"],
    "internal rate of return": ["irr"],
    "assets under management": ["aum"],
    "initial public offering": ["ipo"],
    "due diligence": ["dd"],
    "enterprise value": ["ev"],
    "weighted average cost of capital": ["wacc"],
    "key performance indicator": ["kpi", "kpis"],
    "visual basic for applications": ["vba"],
    "bloomberg terminal": ["bloomberg", "bbt"],
    # ── Marketing ──
    "search engine optimization": ["seo"],
    "search engine marketing": ["sem"],
    "pay per click": ["ppc"],
    "cost per acquisition": ["cpa marketing", "cpa ads"],
    "customer relationship management": ["crm"],
    "content management system": ["cms"],
    "return on ad spend": ["roas"],
    "click through rate": ["ctr"],
    # ── Healthcare ──
    "electronic health record": ["ehr", "emr"],
    "health insurance portability and accountability act": ["hipaa"],
    "health level 7": ["hl7"],
    "fast healthcare interoperability resources": ["fhir"],
}

# Build a reverse lookup: abbreviation/variant -> canonical
_SYNONYM_REVERSE: dict[str, str] = {}
for _canonical, _variants in _SYNONYMS.items():
    for _v in _variants:
        _SYNONYM_REVERSE[_v.lower()] = _canonical.lower()
    _SYNONYM_REVERSE[_canonical.lower()] = _canonical.lower()

# ── Simple suffix-stemmer ────────────────────────────────────────────────────

_STEM_SUFFIXES = [
    "ation", "ment", "ness", "ity", "able", "ible", "ful", "less",
    "ous", "ive", "ing", "tion", "sion", "ence", "ance", "ling",
    "ised", "ized", "ting", "ted", "ers", "ing", "ies", "ied",
    "ly", "ed", "er", "es", "al", "en", "ty",
]

def _stem(word: str) -> str:
    """Cheap suffix-strip stemmer (good enough for keyword dedup)."""
    w = word.lower()
    for sfx in _STEM_SUFFIXES:
        if len(w) > len(sfx) + 3 and w.endswith(sfx):
            return w[: -len(sfx)]
    if w.endswith("s") and len(w) > 4 and not w.endswith("ss"):
        return w[:-1]
    return w

# ── Action verbs (expanded) ─────────────────────────────────────────────────

_ACTION_VERBS = frozenset({
    "achieved", "administered", "analysed", "analyzed", "architected",
    "automated", "bootstrapped", "built", "championed", "co-authored",
    "collaborated", "consolidated", "coordinated", "created", "debugged",
    "decreased", "delivered", "demonstrated", "deployed", "designed",
    "developed", "devised", "directed", "drove", "eliminated", "enabled",
    "engineered", "established", "evaluated", "executed", "expanded",
    "expedited", "facilitated", "formulated", "founded", "generated",
    "grew", "guided", "identified", "implemented", "improved",
    "increased", "influenced", "initiated", "innovated", "integrated",
    "introduced", "investigated", "launched", "led", "leveraged",
    "maintained", "managed", "mentored", "migrated", "modernized",
    "monitored", "negotiated", "onboarded", "operated", "optimised",
    "optimized", "orchestrated", "organized", "outperformed", "oversaw",
    "partnered", "pioneered", "planned", "produced", "programmed",
    "proposed", "published", "rebuilt", "reduced", "refactored",
    "redesigned", "reengineered", "replaced", "resolved", "restructured",
    "revamped", "scaled", "secured", "simplified", "spearheaded",
    "standardized", "streamlined", "strengthened", "supervised",
    "surpassed", "supported", "trained", "transformed", "tripled",
    "troubleshot", "unified", "upgraded", "utilized", "validated",
    "verified", "wrote",
})

_ACTION_VERB_PATTERN = re.compile(
    r"^\s*[•\-\*▸◦▪➤➔→✓✔]?\s*(?:" + "|".join(re.escape(v) for v in sorted(_ACTION_VERBS)) + r")\b",
    re.IGNORECASE | re.MULTILINE,
)

# ── Section header regexes ──────────────────────────────────────────────────

_SEC_CONTACT = re.compile(
    r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}|(\+?\d[\d\s\-().]{7,})",
    re.IGNORECASE,
)
_SEC_SUMMARY = re.compile(
    r"^\s*(?:summary|objective|profile|about\s+me|professional\s+summary|"
    r"career\s+summary|executive\s+summary|career\s+objective)\s*[:\-]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_EXPERIENCE = re.compile(
    r"^\s*(?:experience|work\s+experience|employment|employment\s+history|"
    r"work\s+history|professional\s+experience|career\s+history|"
    r"relevant\s+experience)\s*[:\-]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_EDUCATION = re.compile(
    r"^\s*(?:education|academic|degrees?|qualifications?|university|"
    r"college|academic\s+background|educational\s+background)\s*[:\-]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_SKILLS = re.compile(
    r"^\s*(?:skills|technical\s+skills|competencies|technologies|expertise|"
    r"core\s+competencies|tools\s*(?:&|and)\s*technologies|"
    r"technical\s+proficiencies|technical\s+expertise)\s*[:\-]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_PROJECTS = re.compile(
    r"^\s*(?:projects|personal\s+projects|key\s+projects|"
    r"selected\s+projects|notable\s+projects)\s*[:\-]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_CERTIFICATIONS = re.compile(
    r"^\s*(?:certifications?|certificates?|licenses?\s*(?:&|and)\s*certifications?|"
    r"professional\s+certifications?|accreditations?)\s*[:\-]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)

_BULLET_PATTERN = re.compile(r"^[\s]*[•\-\*▸◦▪➤➔→✓✔]\s+", re.MULTILINE)

# ── Quantified-impact patterns ──────────────────────────────────────────────

_METRIC_NUMBER = re.compile(
    r"\b\d{1,3}(?:,\d{3})*(?:\.\d+)?[+%]?\b"
    r"|[$€£]\s*\d[\d,]*(?:\.\d+)?[MBK]?\b"
    r"|\b\d+[xX]\b",
)
_WEAK_BULLET_STARTS = re.compile(
    r"^\s*[•\-\*▸◦▪➤➔→✓✔]?\s*(?:responsible\s+for|duties\s+include[d]?|"
    r"helped\s+with|assisted\s+in|involved\s+in|worked\s+on|"
    r"tasked\s+with|participated\s+in)\b",
    re.IGNORECASE | re.MULTILINE,
)

_PRONOUN_PATTERN = re.compile(r"\b(?:I|my|me|myself)\b", re.IGNORECASE)

_DATE_FORMATS = re.compile(
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b"
    r"|\b\d{1,2}/\d{4}\b"
    r"|\b\d{4}\s*[-–—]\s*(?:present|\d{4})\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _tokenize(text: str) -> list[str]:
    """Return lowercase tokens ≥ 2 chars that are not stopwords.

    Handles special chars like & and / in financial acronyms (FP&A, CI/CD, P&L)
    and hyphenated compound terms (10-K, on-premise).
    """
    # First pass: grab tokens that may contain &, /, #, +, ., -
    raw_tokens = re.findall(r"[a-zA-Z0-9][a-zA-Z0-9&/#+._-]*[a-zA-Z0-9#+]|[a-zA-Z]{2,}", text.lower())
    tokens: list[str] = []
    for tok in raw_tokens:
        if len(tok) < 2 or tok in _STOPWORDS:
            continue
        # Keep tokens with & or / intact if they look like acronyms (FP&A, CI/CD, P&L)
        if ("&" in tok or "/" in tok) and len(tok) <= 12:
            tokens.append(tok)
        # Keep hyphenated terms (10-k, on-premise, e-commerce)
        elif "-" in tok and len(tok) <= 30:
            tokens.append(tok)
        # Strip trailing punctuation for normal words
        else:
            clean = re.sub(r"[^a-zA-Z0-9#+]", "", tok)
            if len(clean) >= 2 and clean not in _STOPWORDS:
                tokens.append(clean)
    return tokens


def _extract_phrases(text: str) -> list[str]:
    """Extract meaningful multi-word phrases from text.

    Strategy:
    1. Match known multi-word terms from ALL taxonomies (tech + finance + healthcare + marketing)
    2. Discover repeated 2-3 word n-grams that appear 2+ times in the text
       (catches domain-specific phrases we don't have in taxonomy)
    """
    lower = text.lower()
    found: list[str] = []

    # 1. Check known multi-word terms from ALL taxonomy sets
    all_multiword = [
        t for t in (_ALL_INDUSTRY_TOOLS | _SOFT_SKILLS | _CERTIFICATIONS)
        if " " in t or "-" in t or "&" in t
    ]
    for term in all_multiword:
        if term in lower:
            found.append(term)

    # Also check synonym canonical forms (multi-word)
    for canonical, variants in _SYNONYMS.items():
        if " " in canonical and canonical in lower:
            if canonical not in found:
                found.append(canonical)
        for v in variants:
            if " " in v and v in lower:
                if v not in found:
                    found.append(v)
            # Handle &-containing abbreviations like FP&A, P&L
            if "&" in v and v.lower() in lower:
                if v.lower() not in found:
                    found.append(v.lower())

    # 2. Discover repeated bigrams / trigrams from the JD
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9&/-]*[a-zA-Z0-9]", lower)
    # Filter to content words
    content_words = [w for w in words if w not in _STOPWORDS and len(w) >= 2]

    for n in (2, 3):
        ngram_freq: Counter[str] = Counter()
        for i in range(len(content_words) - n + 1):
            gram = " ".join(content_words[i : i + n])
            ngram_freq[gram] += 1
        for gram, count in ngram_freq.items():
            if count >= 2 and gram not in found:
                # Skip if it's mostly filler
                gram_words = gram.split()
                if all(gw not in _JD_FILLER for gw in gram_words):
                    found.append(gram)

    return list(dict.fromkeys(found))  # unique, order-preserving


def _normalise_term(term: str) -> str:
    """Map a term to its canonical form via synonym table, else return as-is."""
    t = term.lower().strip()
    return _SYNONYM_REVERSE.get(t, t)


def _term_in_text(term: str, text_lower: str, word_set: set[str], stem_set: set[str]) -> bool:
    """Check whether *term* appears in the resume (exact, synonym, or stem)."""
    t = term.lower()

    # 1. Exact phrase / word
    if " " in t or "-" in t:
        if t in text_lower:
            return True
        # check without hyphen
        if "-" in t and t.replace("-", " ") in text_lower:
            return True
        if " " in t and t.replace(" ", "-") in text_lower:
            return True
    else:
        if t in word_set:
            return True

    # 2. Synonym expansion
    canonical = _normalise_term(t)
    if canonical != t:
        if " " in canonical:
            if canonical in text_lower:
                return True
        elif canonical in word_set:
            return True
    # Also check all synonyms of the canonical
    for variant in _SYNONYMS.get(canonical, []):
        vl = variant.lower()
        if " " in vl:
            if vl in text_lower:
                return True
        elif vl in word_set:
            return True

    # 3. Stem match (single words only)
    if " " not in t and "-" not in t:
        if _stem(t) in stem_set:
            return True

    return False


def _classify_term(term: str) -> str:
    """Classify a keyword into: hard_skill, soft_skill, tool, certification, or industry_term."""
    t = term.lower()
    can = _normalise_term(t)

    if can in _CERTIFICATIONS or t in _CERTIFICATIONS:
        return "certification"
    if can in _SOFT_SKILLS or t in _SOFT_SKILLS:
        return "soft_skill"
    if can in _ALL_INDUSTRY_TOOLS or t in _ALL_INDUSTRY_TOOLS:
        return "tool"

    # Check multi-word overlaps
    for cert in _CERTIFICATIONS:
        if cert in t or t in cert:
            return "certification"
    for ss in _SOFT_SKILLS:
        if ss in t or t in ss:
            return "soft_skill"
    for tt in _ALL_INDUSTRY_TOOLS:
        if tt == t:
            return "tool"

    return "hard_skill"


def _importance_tier(freq: int, max_freq: int, *, is_taxonomy_term: bool = False) -> str:
    """Map a term's JD frequency to an importance tier.

    Known taxonomy terms (tools, certifications) get a boost since they are
    more likely to be real requirements even at low frequency.
    """
    if max_freq == 0:
        return "low"
    ratio = freq / max_freq
    # Taxonomy terms get an effective boost (act as if 1.5x more frequent)
    if is_taxonomy_term:
        ratio = min(ratio * 1.5, 1.0)
    if ratio >= 0.7:
        return "critical"
    if ratio >= 0.4:
        return "high"
    if ratio >= 0.2:
        return "medium"
    return "low"


# ── Industry detection ───────────────────────────────────────────────────────

def _detect_industry(text: str) -> str:
    """Auto-detect the primary industry of a JD or resume text.

    Returns one of: 'tech', 'finance', 'healthcare', 'marketing', 'general'.
    Uses signal-word counting against each taxonomy.
    """
    lower = text.lower()
    tokens = set(re.findall(r"[a-zA-Z][a-zA-Z0-9&/#+._-]*[a-zA-Z0-9#+]|[a-zA-Z]{2,}", lower))

    scores: dict[str, int] = {
        "tech": 0,
        "finance": 0,
        "healthcare": 0,
        "marketing": 0,
    }

    for tok in tokens:
        if tok in _TECH_TOOLS:
            scores["tech"] += 1
        if tok in _FINANCE_TOOLS:
            scores["finance"] += 1
        if tok in _HEALTHCARE_TOOLS:
            scores["healthcare"] += 1
        if tok in _MARKETING_TOOLS:
            scores["marketing"] += 1

    # Also check multi-word terms
    for term in _FINANCE_TOOLS:
        if " " in term and term in lower:
            scores["finance"] += 2
    for term in _HEALTHCARE_TOOLS:
        if " " in term and term in lower:
            scores["healthcare"] += 2
    for term in _MARKETING_TOOLS:
        if " " in term and term in lower:
            scores["marketing"] += 2
    for term in _TECH_TOOLS:
        if " " in term and term in lower:
            scores["tech"] += 2

    # Pick highest score, need at least 3 signals to declare a non-general industry
    best = max(scores, key=scores.get)  # type: ignore[arg-type]
    if scores[best] >= 3:
        return best
    return "general"


# ── Smart keyword extraction ────────────────────────────────────────────────

def _extract_meaningful_keywords(jd_text: str) -> list[dict[str, Any]]:
    """
    Extract meaningful, de-duplicated keywords from a JD.

    Returns a list of dicts:
        { "term": str, "frequency": int, "category": str, "importance": str }
    sorted by importance (critical first) then frequency descending.
    """
    tokens = _tokenize(jd_text)
    lower_jd = jd_text.lower()
    industry = _detect_industry(jd_text)

    # Pick the relevant taxonomy for this industry
    industry_taxonomy: frozenset[str] = _ALL_INDUSTRY_TOOLS
    if industry == "tech":
        industry_taxonomy = _TECH_TOOLS
    elif industry == "finance":
        industry_taxonomy = _FINANCE_TOOLS | _TECH_TOOLS  # finance often uses tech tools too
    elif industry == "healthcare":
        industry_taxonomy = _HEALTHCARE_TOOLS | _TECH_TOOLS
    elif industry == "marketing":
        industry_taxonomy = _MARKETING_TOOLS | _TECH_TOOLS

    # Frequency of individual filtered tokens (exclude JD filler)
    # Allow short tokens (2 chars) if they're in taxonomy (e.g. "go", "ai", "ml")
    word_freq: Counter[str] = Counter()
    for tok in tokens:
        if tok in _JD_FILLER:
            continue
        if len(tok) >= 3:
            word_freq[tok] += 1
        elif tok in _ALL_INDUSTRY_TOOLS or tok in _SYNONYM_REVERSE:
            # short but meaningful (e.g. "go", "ai", "ml", "js", "py", "ci")
            word_freq[tok] += 1

    # Multi-word phrases from taxonomy + n-gram discovery
    phrases = _extract_phrases(jd_text)

    # Build candidate list with frequency
    seen_canonical: set[str] = set()  # canonical dedup
    seen_stems: set[str] = set()
    candidates: list[dict[str, Any]] = []

    def _add_candidate(term: str, freq: int, is_taxonomy: bool) -> None:
        """Add a candidate if not already seen (canonical or stem dedup)."""
        canon = _normalise_term(term)
        if canon in seen_canonical:
            return
        # For single words, also check stem
        if " " not in term and "-" not in term and "&" not in term:
            stem_key = _stem(canon)
            if stem_key in seen_stems:
                return
            seen_stems.add(stem_key)
        seen_canonical.add(canon)
        if term != canon and canon not in seen_canonical:
            seen_canonical.add(term)
        candidates.append({
            "term": canon if canon in (_ALL_INDUSTRY_TOOLS | _CERTIFICATIONS | _SOFT_SKILLS) else term,
            "frequency": max(freq, 1),
            "category": _classify_term(term),
            "_is_taxonomy": is_taxonomy,
        })

    # Phrases first (higher quality)
    for phrase in phrases:
        freq = lower_jd.count(phrase)
        is_tax = phrase in (_ALL_INDUSTRY_TOOLS | _CERTIFICATIONS | _SOFT_SKILLS)
        _add_candidate(phrase, freq, is_tax)

    # Then single terms
    for word, freq in word_freq.most_common():
        canon = _normalise_term(word)
        is_tax = (
            word in _ALL_INDUSTRY_TOOLS
            or canon in _ALL_INDUSTRY_TOOLS
            or word in _CERTIFICATIONS
            or canon in _CERTIFICATIONS
        )
        _add_candidate(word, freq, is_tax)

    if not candidates:
        return []

    max_freq = max(c["frequency"] for c in candidates)
    for c in candidates:
        c["importance"] = _importance_tier(
            c["frequency"], max_freq, is_taxonomy_term=c.pop("_is_taxonomy", False)
        )

    # Sort: critical > high > medium > low, then by frequency desc
    tier_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    candidates.sort(key=lambda c: (tier_order.get(c["importance"], 4), -c["frequency"]))

    # Cap at 60 most important keywords
    return candidates[:60]


# ── Scoring functions ────────────────────────────────────────────────────────

def _score_keywords(
    resume_text: str, jd_text: str
) -> tuple[int, list[str], list[str], Decimal | None, list[dict[str, Any]]]:
    """
    Compute weighted keyword match between JD and resume.

    Returns:
        keyword_score, matched_keywords, missing_keywords, density,
        keyword_details (list of {term, frequency, category, importance, found})
    """
    candidates = _extract_meaningful_keywords(jd_text)

    resume_lower = resume_text.lower()
    resume_words = set(_tokenize(resume_text))
    resume_stems = {_stem(w) for w in resume_words}

    matched: list[str] = []
    missing: list[str] = []
    details: list[dict[str, Any]] = []

    # Weighted scoring: critical=4, high=3, medium=2, low=1
    weight_map = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    total_weight = 0
    matched_weight = 0

    for kw in candidates:
        term = kw["term"]
        found = _term_in_text(term, resume_lower, resume_words, resume_stems)
        w = weight_map.get(kw["importance"], 1)
        total_weight += w
        if found:
            matched_weight += w
            matched.append(term)
        else:
            missing.append(term)

        details.append({**kw, "found": found})

    score = min(round((matched_weight / total_weight) * 100), 100) if total_weight else 0

    resume_token_count = len(_tokenize(resume_text))
    density: Decimal | None = (
        Decimal(str(round(len(matched) / resume_token_count, 3)))
        if resume_token_count
        else None
    )

    return score, matched, missing, density, details


def _score_sections(resume_text: str) -> tuple[int, dict[str, bool]]:
    """
    Detect presence of key resume sections.
    Weights: contact (25%), experience (25%), skills (20%), education (15%), summary (15%).
    """
    flags: dict[str, bool] = {
        "has_contact_info": bool(_SEC_CONTACT.search(resume_text)),
        "has_summary": bool(_SEC_SUMMARY.search(resume_text)),
        "has_experience": bool(_SEC_EXPERIENCE.search(resume_text)),
        "has_education": bool(_SEC_EDUCATION.search(resume_text)),
        "has_skills": bool(_SEC_SKILLS.search(resume_text)),
    }

    weights = {
        "has_contact_info": 25,
        "has_experience": 25,
        "has_skills": 20,
        "has_education": 15,
        "has_summary": 15,
    }
    score = sum(weights[k] for k, v in flags.items() if v)
    return score, flags


def _score_formatting(resume_text: str) -> tuple[int, dict[str, bool]]:
    """
    Deeper formatting analysis:
      - Bullet points (25 pts)
      - Action verbs (20 pts)
      - Line-length consistency (20 pts)
      - No personal pronouns (15 pts)
      - Date format consistency (10 pts)
      - Bullet quality — no weak starts (10 pts)
    """
    bullet_matches = _BULLET_PATTERN.findall(resume_text)
    has_bullets = len(bullet_matches) >= 3

    action_verb_matches = _ACTION_VERB_PATTERN.findall(resume_text)
    has_action_verbs = len(action_verb_matches) >= 2

    non_empty_lines = [ln for ln in resume_text.splitlines() if ln.strip()]
    long_lines = sum(1 for ln in non_empty_lines if len(ln) > 100)
    has_consistent = (
        (long_lines / len(non_empty_lines)) < 0.25 if non_empty_lines else False
    )

    pronoun_count = len(_PRONOUN_PATTERN.findall(resume_text))
    no_pronouns = pronoun_count <= 2

    date_matches = _DATE_FORMATS.findall(resume_text)
    has_dates = len(date_matches) >= 2

    weak_bullets = len(_WEAK_BULLET_STARTS.findall(resume_text))
    no_weak_bullets = weak_bullets == 0

    is_scannable = has_bullets and has_consistent and no_pronouns

    score = (
        (25 if has_bullets else 0)
        + (20 if has_action_verbs else 0)
        + (20 if has_consistent else 0)
        + (15 if no_pronouns else 0)
        + (10 if has_dates else 0)
        + (10 if no_weak_bullets else 0)
    )

    return score, {
        "has_consistent_formatting": has_consistent,
        "has_bullet_points": has_bullets,
        "has_action_verbs": has_action_verbs,
        "is_scannable": is_scannable,
    }


# ── Impact analysis ─────────────────────────────────────────────────────────

def _analyse_impact(resume_text: str) -> dict[str, Any]:
    """
    Score how well bullet points quantify achievements.

    Returns dict with:
        score (0-100), quantified_count, total_bullets, strong_examples,
        weak_examples, tips
    """
    lines = resume_text.splitlines()
    bullet_lines = [ln.strip() for ln in lines if _BULLET_PATTERN.match(ln)]
    total = len(bullet_lines)

    if total == 0:
        return {
            "score": 0,
            "quantified_count": 0,
            "total_bullets": 0,
            "strong_examples": [],
            "weak_examples": [],
            "tips": ["Add bullet points with measurable achievements to strengthen your resume."],
        }

    quantified: list[str] = []
    weak: list[str] = []

    for bl in bullet_lines:
        if _METRIC_NUMBER.search(bl):
            quantified.append(bl[:120])
        elif _WEAK_BULLET_STARTS.match(bl):
            weak.append(bl[:120])

    quant_ratio = len(quantified) / total
    score = min(round(quant_ratio * 100 * 1.5), 100)  # 67% quantified → 100

    tips: list[str] = []
    if quant_ratio < 0.3:
        tips.append(
            "Less than 30% of your bullet points include metrics. "
            "Try adding numbers, percentages, or dollar amounts to show impact."
        )
    if weak:
        tips.append(
            f"Found {len(weak)} bullet(s) starting with passive phrases like "
            f"\"Responsible for…\". Rewrite with strong action verbs."
        )
    if total < 6:
        tips.append(
            "Consider adding more bullet points (aim for 3-5 per role) to "
            "give recruiters a fuller picture of your contributions."
        )
    if not tips and quant_ratio >= 0.5:
        tips.append("Strong use of quantified achievements — keep it up!")

    return {
        "score": score,
        "quantified_count": len(quantified),
        "total_bullets": total,
        "strong_examples": quantified[:5],
        "weak_examples": weak[:5],
        "tips": tips,
    }


# ── Resume metrics ──────────────────────────────────────────────────────────

def _analyse_resume_metrics(resume_text: str) -> dict[str, Any]:
    """Word count, section balance, pronoun flags."""
    words = resume_text.split()
    word_count = len(words)

    # Ideal range: 400-800 words for 1-page, up to 1200 for 2-page
    if word_count < 200:
        length_verdict = "too_short"
    elif word_count < 400:
        length_verdict = "short"
    elif word_count <= 900:
        length_verdict = "good"
    elif word_count <= 1200:
        length_verdict = "slightly_long"
    else:
        length_verdict = "too_long"

    pronoun_count = len(_PRONOUN_PATTERN.findall(resume_text))

    # Section balance: approximate by character distribution between headers
    section_headers = re.findall(
        r"^\s*(?:summary|objective|profile|experience|work\s+experience|"
        r"education|skills|technical\s+skills|projects|certifications?)\s*[:\-]?\s*$",
        resume_text,
        re.IGNORECASE | re.MULTILINE,
    )

    # Average bullet length
    bullet_lines = [ln.strip() for ln in resume_text.splitlines() if _BULLET_PATTERN.match(ln)]
    avg_bullet_words = (
        round(sum(len(b.split()) for b in bullet_lines) / len(bullet_lines), 1)
        if bullet_lines
        else 0
    )

    return {
        "word_count": word_count,
        "ideal_range": [400, 900],
        "length_verdict": length_verdict,
        "pronoun_count": pronoun_count,
        "section_count": len(section_headers),
        "bullet_count": len(bullet_lines),
        "avg_bullet_words": avg_bullet_words,
    }


# ── Repetition detection ────────────────────────────────────────────────────

def _detect_repetition(resume_text: str) -> list[dict[str, Any]]:
    """Flag overused words (≥4 occurrences) excluding stopwords and filler."""
    tokens = _tokenize(resume_text)
    freq = Counter(tokens)
    flags: list[dict[str, Any]] = []

    for word, count in freq.most_common():
        if count >= 4 and word not in _JD_FILLER:
            flags.append({"word": word, "count": count})
        if len(flags) >= 8:
            break

    return flags


# ── Categorised keyword breakdown ────────────────────────────────────────────

def _categorise_keywords(
    details: list[dict[str, Any]],
) -> dict[str, dict[str, list[str]]]:
    """
    Group keyword details into categories with matched/missing sublists.
    """
    cats: dict[str, dict[str, list[str]]] = {
        "hard_skill": {"matched": [], "missing": []},
        "soft_skill": {"matched": [], "missing": []},
        "tool": {"matched": [], "missing": []},
        "certification": {"matched": [], "missing": []},
    }
    for d in details:
        cat = d.get("category", "hard_skill")
        if cat not in cats:
            cat = "hard_skill"
        bucket = "matched" if d["found"] else "missing"
        cats[cat][bucket].append(d["term"])
    return cats


# ── Priority action items ────────────────────────────────────────────────────

def _build_priority_actions(
    keyword_score: int,
    formatting_score: int,
    section_score: int,
    flags: dict[str, bool],
    missing_keywords: list[str],
    keyword_details: list[dict[str, Any]],
    impact: dict[str, Any],
    metrics: dict[str, Any],
    repetition: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Build a prioritised list of concrete action items.
    Each item: { priority: critical|high|medium|low, action: str, section: str }
    """
    actions: list[dict[str, Any]] = []

    # --- Critical: missing critical-importance keywords ---
    critical_missing = [
        d["term"] for d in keyword_details
        if d["importance"] == "critical" and not d["found"]
    ]
    if critical_missing:
        terms = ", ".join(critical_missing[:5])
        actions.append({
            "priority": "critical",
            "action": f"Add these must-have keywords to your resume: {terms}",
            "section": "keywords",
        })

    # --- Critical: missing core sections ---
    if not flags.get("has_contact_info"):
        actions.append({
            "priority": "critical",
            "action": "Add your email address and phone number — most ATS systems require contact information.",
            "section": "contact",
        })
    if not flags.get("has_experience"):
        actions.append({
            "priority": "critical",
            "action": "Add a clearly labeled 'Work Experience' or 'Professional Experience' section.",
            "section": "experience",
        })

    # --- High: missing high-importance keywords ---
    high_missing = [
        d["term"] for d in keyword_details
        if d["importance"] == "high" and not d["found"]
    ]
    if high_missing:
        terms = ", ".join(high_missing[:5])
        actions.append({
            "priority": "high",
            "action": f"Incorporate these frequently-mentioned requirements: {terms}",
            "section": "keywords",
        })

    # --- High: weak bullet points ---
    if impact.get("weak_examples"):
        example = impact["weak_examples"][0]
        actions.append({
            "priority": "high",
            "action": (
                f"Rewrite passive bullet points. For example, change "
                f"\"{example[:60]}…\" to start with a strong action verb."
            ),
            "section": "experience",
        })

    # --- High: low quantification ---
    if impact.get("score", 100) < 30:
        actions.append({
            "priority": "high",
            "action": "Add measurable outcomes (numbers, %, $) to at least half your bullet points.",
            "section": "experience",
        })

    # --- Medium: missing sections ---
    if not flags.get("has_skills"):
        actions.append({
            "priority": "medium",
            "action": "Add a dedicated 'Skills' section listing your technical and soft skills.",
            "section": "skills",
        })
    if not flags.get("has_summary"):
        actions.append({
            "priority": "medium",
            "action": "Add a 2-3 sentence professional summary tailored to this role.",
            "section": "summary",
        })
    if not flags.get("has_education"):
        actions.append({
            "priority": "medium",
            "action": "Include an Education section with your qualifications.",
            "section": "education",
        })

    # --- Medium: formatting issues ---
    if not flags.get("has_bullet_points"):
        actions.append({
            "priority": "medium",
            "action": "Replace paragraph text with bullet points (•) for each achievement.",
            "section": "formatting",
        })
    if not flags.get("has_action_verbs"):
        actions.append({
            "priority": "medium",
            "action": "Start bullets with strong action verbs: Led, Built, Increased, Reduced, Designed.",
            "section": "formatting",
        })

    # --- Medium: pronoun usage ---
    if metrics.get("pronoun_count", 0) > 3:
        actions.append({
            "priority": "medium",
            "action": (
                f"Remove first-person pronouns (I, my, me) — found {metrics['pronoun_count']} instances. "
                "ATS-optimized resumes use implied first person."
            ),
            "section": "formatting",
        })

    # --- Medium: resume length ---
    verdict = metrics.get("length_verdict", "good")
    if verdict == "too_short":
        actions.append({
            "priority": "medium",
            "action": f"Your resume is very short ({metrics['word_count']} words). Expand to at least 400 words with more detail.",
            "section": "content",
        })
    elif verdict == "too_long":
        actions.append({
            "priority": "low",
            "action": f"Your resume is quite long ({metrics['word_count']} words). Consider trimming to under 900 words for a single-page resume.",
            "section": "content",
        })

    # --- Low: repetition ---
    if repetition:
        top = repetition[0]
        actions.append({
            "priority": "low",
            "action": f"The word \"{top['word']}\" appears {top['count']} times. Use synonyms for variety.",
            "section": "language",
        })

    # --- Low: formatting consistency ---
    if not flags.get("has_consistent_formatting"):
        actions.append({
            "priority": "low",
            "action": "Shorten lines to under 100 characters — long lines can break ATS parsing.",
            "section": "formatting",
        })

    return actions


# ── Build unified suggestions payload ────────────────────────────────────────

def _build_suggestions_payload(
    keyword_score: int,
    section_score: int,
    formatting_score: int,
    flags: dict[str, bool],
    missing_keywords: list[str],
    keyword_details: list[dict[str, Any]],
    impact: dict[str, Any],
    metrics: dict[str, Any],
    repetition: list[dict[str, Any]],
    categorised: dict[str, dict[str, list[str]]],
) -> dict[str, Any]:
    """Assemble the full suggestions_payload stored as JSONB."""
    actions = _build_priority_actions(
        keyword_score, formatting_score, section_score,
        flags, missing_keywords, keyword_details, impact, metrics, repetition,
    )

    return {
        "categorized_keywords": categorised,
        "keyword_importance": [
            {
                "keyword": d["term"],
                "frequency": d["frequency"],
                "importance": d["importance"],
                "category": d["category"],
                "found": d["found"],
            }
            for d in keyword_details
        ],
        "impact_analysis": impact,
        "resume_metrics": metrics,
        "priority_actions": actions,
        "repetition_flags": repetition,
    }


def _extract_jd_keywords(jd_text: str) -> list[str]:
    """Return the top 30 meaningful keywords from a JD."""
    cands = _extract_meaningful_keywords(jd_text)
    return [c["term"] for c in cands[:30]]


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def run_audit(
    *,
    user_id: UUID,
    resume_id: UUID,
    job_description_text: str,
    job_title: str | None,
    db: Session,
    ai_enhance: bool = False,
) -> AnalysisResultRead:
    """
    Run heuristic ATS analysis of the given resume against the job description.
    """
    # 1. Fetch resume -----------------------------------------------------------
    resume = db.get(Resume, resume_id)
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )
    if resume.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )
    if not resume.raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Resume has not been parsed yet. "
                "Please wait until parsing is complete before running an audit."
            ),
        )

    raw_text: str = resume.raw_text

    # 2. Hash inputs ------------------------------------------------------------
    resume_hash = _sha256(raw_text)
    jd_hash = _sha256(job_description_text.strip())

    # 3. Cache check ------------------------------------------------------------
    cached = db.exec(
        select(AnalysisResult).where(
            AnalysisResult.resume_id == resume_id,
            AnalysisResult.resume_content_hash == resume_hash,
            AnalysisResult.job_description_hash == jd_hash,
            AnalysisResult.analysis_version == ANALYSIS_VERSION,
        )
    ).first()

    if cached is not None:
        # If AI enhancement requested but not yet computed, backfill
        if ai_enhance and cached.ai_enhancement is None:
            enhancement = enhance_analysis(
                user_id=user_id,
                resume=resume,
                job_description_text=job_description_text,
                heuristic_result=cached,
                db=db,
            )
            if enhancement is not None:
                cached.ai_enhancement = enhancement
                db.add(cached)
                db.commit()
                db.refresh(cached)
        return AnalysisResultRead.model_validate(cached)

    # 4. Upsert JobDescription --------------------------------------------------
    existing_jd = db.exec(
        select(JobDescription).where(JobDescription.jd_hash == jd_hash)
    ).first()

    if existing_jd is not None:
        jd_row = existing_jd
    else:
        snippet = (job_description_text[:300] if len(job_description_text) > 300 else None)
        jd_row = JobDescription(
            user_id=user_id,
            job_title=job_title or "Untitled Position",
            description=job_description_text,
            snippet=snippet,
            extracted_keywords=_extract_jd_keywords(job_description_text),
            jd_hash=jd_hash,
        )
        db.add(jd_row)
        db.flush()

    # 5. Score ------------------------------------------------------------------
    keyword_score, matched_kw, missing_kw, density, kw_details = _score_keywords(
        raw_text, job_description_text,
    )
    section_score, section_flags = _score_sections(raw_text)
    formatting_score, formatting_flags = _score_formatting(raw_text)
    impact = _analyse_impact(raw_text)
    metrics = _analyse_resume_metrics(raw_text)
    repetition = _detect_repetition(raw_text)
    categorised = _categorise_keywords(kw_details)

    # Overall: keywords 35%, sections 25%, formatting 20%, impact 20%
    overall_score = round(
        keyword_score * 0.35
        + section_score * 0.25
        + formatting_score * 0.20
        + impact["score"] * 0.20
    )

    all_flags: dict[str, bool] = {**section_flags, **formatting_flags}

    suggestions = _build_suggestions_payload(
        keyword_score, section_score, formatting_score,
        all_flags, missing_kw, kw_details, impact, metrics, repetition, categorised,
    )

    # 6. Persist ----------------------------------------------------------------
    result = AnalysisResult(
        resume_id=resume_id,
        job_description_id=jd_row.id,
        resume_content_hash=resume_hash,
        job_description_hash=jd_hash,
        overall_score=overall_score,
        keyword_score=keyword_score,
        formatting_score=formatting_score,
        section_score=section_score,
        matched_keywords=matched_kw,
        missing_keywords=missing_kw,
        keyword_density=density,
        suggestions_payload=suggestions,
        analysis_version=ANALYSIS_VERSION,
        **all_flags,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    # --- Optional AI enhancement (post-heuristic) ---
    if ai_enhance:
        enhancement = enhance_analysis(
            user_id=user_id,
            resume=resume,
            job_description_text=job_description_text,
            heuristic_result=result,
            db=db,
        )
        if enhancement is not None:
            result.ai_enhancement = enhancement
            db.add(result)
            db.commit()
            db.refresh(result)

    return AnalysisResultRead.model_validate(result)


def get_audit_result(
    *,
    result_id: UUID,
    user_id: UUID,
    db: Session,
) -> AnalysisResultRead:
    """Retrieve a previously computed analysis result by ID."""
    result = db.get(AnalysisResult, result_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis result not found.",
        )

    resume = db.get(Resume, result.resume_id)
    if resume is None or resume.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )

    return AnalysisResultRead.model_validate(result)


def get_latest_audit_result(
    *,
    user_id: UUID,
    db: Session,
) -> AnalysisResultRead | None:
    """Return the most recent analysis result across all of the user's resumes.

    Returns ``None`` when the user has not yet run any audits.
    """
    stmt = (
        select(AnalysisResult)
        .join(Resume, Resume.id == AnalysisResult.resume_id)
        .where(Resume.user_id == user_id)
        .order_by(AnalysisResult.analyzed_at.desc())
        .limit(1)
    )
    result = db.exec(stmt).first()
    if result is None:
        return None
    return AnalysisResultRead.model_validate(result)
