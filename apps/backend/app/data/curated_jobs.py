"""
Static curated job listings used by the job-matches endpoint.

These are hand-picked, representative job postings used for MVP. The
extracted_keywords list for each job is the sole driver of match scoring —
any keyword present in the user's parsed ResumeSkill rows counts as matched.

To update/extend the catalogue: add or edit dicts in CURATED_JOBS. No DB
migration is required; changes take effect on the next deploy.
"""

from typing import Any


CURATED_JOBS: list[dict[str, Any]] = [
    {
        "id": "jl-uk-001",
        "job_title": "BBC Software Engineering Graduate Scheme 2026",
        "company_name": "BBC",
        "location": "London / Salford / Newcastle / Glasgow, UK",
        "remote_type": "hybrid",
        "salary_min": 35205,
        "salary_max": 40464,
        "salary_currency": "GBP",
        "description": (
            "Two-year graduate scheme with four six-month rotations across BBC "
            "digital products (iPlayer, News, Sounds, Sport, Bitesize), working "
            "with JavaScript, Python, Scala, AWS, Java, Kotlin and Swift."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2025-11-23",
        "external_url": "https://careers.bbc.co.uk/job/London-BBC-Software-Engineering-Graduate-Scheme-W1A-1AA/33950-en_GB/",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "JavaScript",
            "Python",
            "Scala",
            "AWS",
            "Java",
            "Kotlin",
            "Swift",
            "Cloud",
            "Machine Learning",
            "API",
            "Agile",
        ],
    },
    {
        "id": "jl-uk-002",
        "job_title": "Graduate Software Developer 2026",
        "company_name": "Softwire",
        "location": "London / Cambridge / Manchester, UK",
        "remote_type": "onsite",
        "salary_min": 45000,
        "salary_max": 45000,
        "salary_currency": "GBP",
        "description": (
            "Permanent graduate developer role with structured training and "
            "profit share, working on client projects from large-scale digital "
            "transformations to AI-focused systems."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2026-03-01",
        "external_url": "https://www.softwire.com/vacancy/graduate-software-developer-2/",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Software Engineering",
            "Digital Transformation",
            "Artificial Intelligence",
            "Client-facing",
            "Agile",
        ],
    },
    {
        "id": "jl-uk-003",
        "job_title": "Graduate Software Engineer - Up to £120k + Bonus",
        "company_name": "Hunter Bond",
        "location": "London, UK",
        "remote_type": "onsite",
        "salary_min": None,
        "salary_max": 120000,
        "salary_currency": "GBP",
        "description": (
            "Graduate software engineer role at a high-growth tech client, "
            "building highly scalable, low-latency platforms in a London-based "
            "team with significant bonus potential."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2025-05-20",
        "external_url": "https://uk.linkedin.com/jobs/view/graduate-software-engineer-up-to-%C2%A3120k-+-bonus-london-at-hunter-bond-4226066466",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Python",
            "C++",
            "Distributed Systems",
            "Low Latency",
            "Financial Services",
        ],
    },
    {
        "id": "jl-uk-004",
        "job_title": "Junior Software Developer",
        "company_name": "Electronics manufacturer (via Tate Recruitment)",
        "location": "Milton Keynes, UK",
        "remote_type": "hybrid",
        "salary_min": 35000,
        "salary_max": 40000,
        "salary_currency": "GBP",
        "description": (
            "Junior developer role in an electronics manufacturer, building and "
            "improving internal applications; office-based for six months then "
            "moving to a hybrid working pattern."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2026-01-19",
        "external_url": "https://www.reed.co.uk/jobs/junior-software-developer/56353691",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "Software Development",
            "Internal Tools",
            "Electronics",
            "Problem Solving",
        ],
    },
    {
        "id": "jl-uk-005",
        "job_title": "Senior Software Engineer",
        "company_name": "Gold Group (Defence Client)",
        "location": "Manchester, UK",
        "remote_type": "onsite",
        "salary_min": 44000,
        "salary_max": 64000,
        "salary_currency": "GBP",
        "description": (
            "Senior software engineer working on secure national security and "
            "defence projects, using Java, JavaScript or Python with cloud "
            "architectures and modern DevOps tooling; DV clearance required."
        ),
        "job_type": "full_time",
        "experience_level": "senior",
        "posted_date": "2025-06-04",
        "external_url": "https://www.cv-library.co.uk/job/223594169/Senior-Software-Engineer",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "Java",
            "JavaScript",
            "Python",
            "AWS",
            "Azure",
            "DevOps",
            "Jenkins",
            "GitLab",
            "Docker",
            "OpenShift",
            "Kubernetes",
            "SQL",
            "Elasticsearch",
            "MongoDB",
            "National Security",
            "Defence",
        ],
    },
    {
        "id": "jl-uk-006",
        "job_title": "2026 Graduate Software Engineer - PyTorch",
        "company_name": "Graphcore",
        "location": "Bristol, UK",
        "remote_type": "onsite",
        "salary_min": 28800,
        "salary_max": 48000,
        "salary_currency": "GBP",
        "description": (
            "Graduate software engineer joining Graphcore's AI compute team in "
            "Bristol to contribute to PyTorch framework integrations, working "
            "with Python, C++, CI/CD and Git in an inclusive, innovation-led culture."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2026-03-04",
        "external_url": "https://www.totaljobs.com/job/2026-graduate-software-engineer-pytorch/graphcore-job106852683",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "PyTorch",
            "Python",
            "C++",
            "Machine Learning",
            "AI",
            "CI/CD",
            "Jenkins",
            "Git",
        ],
    },
    {
        "id": "jl-uk-007",
        "job_title": "2026 Graduate Software Engineer - Analysis Tools",
        "company_name": "Graphcore",
        "location": "Bristol, UK",
        "remote_type": "onsite",
        "salary_min": 28800,
        "salary_max": 48000,
        "salary_currency": "GBP",
        "description": (
            "Graduate software engineer role on Graphcore's analysis tools team, "
            "building developer-facing tooling for AI/ML workloads in Python "
            "and C++ at one of the UK's leading AI hardware companies."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2026-02-28",
        "external_url": "https://www.totaljobs.com/job/2026-graduate-software-engineer-analysis-tools/graphcore-job106733004",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Python",
            "C++",
            "AI",
            "Machine Learning",
            "Developer Tools",
            "Git",
        ],
    },
    {
        "id": "jl-uk-008",
        "job_title": "Graduate Software Developer",
        "company_name": "IT Graduate Recruitment (agency)",
        "location": "London / Remote, UK",
        "remote_type": "hybrid",
        "salary_min": 45000,
        "salary_max": 55000,
        "salary_currency": "GBP",
        "description": (
            "Graduate software developer working on high-impact products with a "
            "modern stack, solving real-world problems and progressing into "
            "software, ML or full-stack engineering roles."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2025-11-17",
        "external_url": "https://www.reed.co.uk/jobs/graduate-software-developer--4500055000--hybrid-london-remote/56090586",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Python",
            "C++",
            "C#",
            "JavaScript",
            "Cloud",
            "Machine Learning",
            "Full Stack",
        ],
    },
    {
        "id": "jl-uk-009",
        "job_title": "Graduate Software Developer",
        "company_name": "IT Graduate Recruitment (agency)",
        "location": "London / Remote, UK",
        "remote_type": "hybrid",
        "salary_min": 50000,
        "salary_max": 60000,
        "salary_currency": "GBP",
        "description": (
            "High-paying graduate software developer role with a modern stack, "
            "offering fast progression into software, ML or full-stack "
            "engineering and exposure to cloud and CI/CD tooling."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2025-12-04",
        "external_url": "https://www.reed.co.uk/jobs/graduate-software-developer--5000060000--hybrid-london-remote/56163027",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Python",
            "C++",
            "C#",
            "JavaScript",
            "Cloud",
            "Machine Learning",
            "CI/CD",
        ],
    },
    {
        "id": "jl-uk-010",
        "job_title": "Graduate Software Developer",
        "company_name": "IT Graduate Recruitment (agency)",
        "location": "London / Remote, UK",
        "remote_type": "hybrid",
        "salary_min": 50000,
        "salary_max": 60000,
        "salary_currency": "GBP",
        "description": (
            "Another graduate developer opening on the same programme, focused "
            "on building production systems using Python, C++ and cloud "
            "technologies with strong mentoring and training."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2026-01-05",
        "external_url": "https://www.reed.co.uk/jobs/graduate-software-developer--5000060000--hybrid-london-remote/56282899",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Python",
            "C++",
            "Cloud",
            "Full Stack",
            "DevOps",
        ],
    },
    {
        "id": "jl-uk-011",
        "job_title": "Graduate Software Developer - Hybrid Opportunity",
        "company_name": "Confidential (via My London Jobs)",
        "location": "London / Remote, UK",
        "remote_type": "hybrid",
        "salary_min": 45000,
        "salary_max": 55000,
        "salary_currency": "GBP",
        "description": (
            "Graduate software developer position solving real-world problems "
            "from day one in a hybrid London/remote setup, with clear "
            "progression into software, ML or full-stack roles."
        ),
        "job_type": "full_time",
        "experience_level": "graduate",
        "posted_date": "2025-12-03",
        "external_url": "https://mylondonjobs.com/jobs/graduate-software-developer-hybrid-opportunity-london/2497509901-2/",
        "is_active": True,
        "extracted_keywords": [
            "Graduate",
            "Python",
            "C++",
            "C#",
            "Full Stack",
            "Cloud",
            "Machine Learning",
        ],
    },
    {
        "id": "jl-uk-012",
        "job_title": "Junior / Mid-Level Software Engineer",
        "company_name": "Mayflower Recruitment (agency)",
        "location": "London, UK",
        "remote_type": "hybrid",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Junior backend software engineer role at an early-stage startup in "
            "London, designing and implementing scalable backend services, APIs "
            "and integrations in a modern codebase."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2025-10-19",
        "external_url": "https://www.reed.co.uk/jobs/junior-mid-level-software-engineer--london-1st-class-grads-2-years-exp/55953869",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "Backend",
            "APIs",
            "Distributed Systems",
            "Startups",
            "Agile",
        ],
    },
    {
        "id": "jl-uk-013",
        "job_title": "Senior Software Engineer (Java, AI)",
        "company_name": "Financial services client (via Reed)",
        "location": "London, UK",
        "remote_type": "hybrid",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Contract senior software engineer role using Java and AI tools to "
            "modernise and simplify critical legacy services for a financial "
            "services brand, outside IR35."
        ),
        "job_type": "contract",
        "experience_level": "senior",
        "posted_date": "2026-01-19",
        "external_url": "https://www.reed.co.uk/jobs/senior-developer/56350564",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "Java",
            "AI",
            "Machine Learning",
            "LLM",
            "GitHub Copilot",
            "DevOps",
        ],
    },
    {
        "id": "jl-uk-014",
        "job_title": "Senior Software Engineer (Applied AI)",
        "company_name": "Confidential (via Reed)",
        "location": "London, UK",
        "remote_type": "hybrid",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Senior software engineer role in an Applied AI team, building "
            "backend services and AI-powered systems with Python, Angular, "
            "RAG architectures and MLOps tooling."
        ),
        "job_type": "contract",
        "experience_level": "senior",
        "posted_date": "2026-01-29",
        "external_url": "https://www.reed.co.uk/jobs/senior-software-engineer/56402580",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "Python",
            "Angular",
            "LLM",
            "RAG",
            "SQL",
            "BigQuery",
            "MLOps",
            "Kubernetes",
        ],
    },
    {
        "id": "jl-uk-015",
        "job_title": "Senior Software Engineer",
        "company_name": "Portfolio Payroll Ltd (client)",
        "location": "London, UK",
        "remote_type": "onsite",
        "salary_min": 65000,
        "salary_max": 70000,
        "salary_currency": "GBP",
        "description": (
            "Senior software engineer building smart, scalable tools using "
            "React, Next.js and Node.js for professional users, working onsite "
            "in London as part of a growing engineering team."
        ),
        "job_type": "full_time",
        "experience_level": "senior",
        "posted_date": "2026-02-24",
        "external_url": "https://www.reed.co.uk/jobs/senior-software-engineer/56536713",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "React",
            "Next.js",
            "Node.js",
            "TypeScript",
            "Web Applications",
        ],
    },
    {
        "id": "jl-uk-016",
        "job_title": "Senior Software Engineer - London - £120k",
        "company_name": "Tenth Revolution Group (recruiter)",
        "location": "London, UK",
        "remote_type": "hybrid",
        "salary_min": 120000,
        "salary_max": 120000,
        "salary_currency": "GBP",
        "description": (
            "Senior engineer role building a new front-end analytics platform "
            "for a data-driven organisation, using a modern open-source tech "
            "stack to deliver real-time insights."
        ),
        "job_type": "full_time",
        "experience_level": "senior",
        "posted_date": "2025-10-19",
        "external_url": "https://www.reed.co.uk/jobs/senior-software-engineer-london-120k/55953003",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "Analytics",
            "Front-end",
            "JavaScript",
            "TypeScript",
            "Cloud",
        ],
    },
    {
        "id": "jl-uk-017",
        "job_title": "Junior Software Developer",
        "company_name": "Platform Recruitment",
        "location": "London, UK",
        "remote_type": "onsite",
        "salary_min": 40000,
        "salary_max": 65000,
        "salary_currency": "GBP",
        "description": (
            "Junior software developer in a high-performance C++ team, writing "
            "low-latency systems and working on live projects from day one with "
            "dedicated mentoring."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2026-01-05",
        "external_url": "https://devitjobs.uk/jobs/Platform-Recruitment-Junior-Software-Developer",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "C++",
            "Low Latency",
            "GitHub",
            "Linux",
        ],
    },
    {
        "id": "jl-uk-018",
        "job_title": "Junior Software Developer",
        "company_name": "Elite Hiring Solution",
        "location": "Chaucer, UK",
        "remote_type": "onsite",
        "salary_min": 26000,
        "salary_max": 35000,
        "salary_currency": "GBP",
        "description": (
            "Junior developer role in a fast-growing technology company, writing "
            "Java or JavaScript code, supporting application development and "
            "gaining structured training and mentoring."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2025-12-31",
        "external_url": "https://devitjobs.uk/jobs/Elite-Hiring-Solution-Junior-Software-Developer",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "Java",
            "JavaScript",
            "SQL",
            "Training",
        ],
    },
    {
        "id": "jl-uk-019",
        "job_title": "Junior Software Developer",
        "company_name": "Syntax Consultancy Ltd",
        "location": "London, UK",
        "remote_type": "hybrid",
        "salary_min": 36000,
        "salary_max": 36000,
        "salary_currency": "GBP",
        "description": (
            "Junior C#/.NET developer role on government projects in central "
            "London, requiring active SC clearance and experience with Azure "
            "DevOps and CI/CD pipelines."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2026-02-17",
        "external_url": "https://devitjobs.uk/jobs/Syntax-Consultancy-Ltd-Junior-Software-Developer",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "C#",
            ".NET",
            "SQL",
            "Azure DevOps",
            "CI/CD",
            "SC Clearance",
        ],
    },
    {
        "id": "jl-uk-020",
        "job_title": "Lead Backend Engineer (Remote, United Kingdom)",
        "company_name": "Live Nation Entertainment / Ticketmaster",
        "location": "Remote, United Kingdom",
        "remote_type": "remote",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Lead backend engineer in Ticketmaster's CORE engineering team, "
            "shaping tech strategy and building highly scalable distributed "
            "e-commerce platforms."
        ),
        "job_type": "full_time",
        "experience_level": "lead",
        "posted_date": "2025-05-12",
        "external_url": "https://uk.linkedin.com/jobs/view/lead-backend-engineer-remote-united-kingdom-at-live-nation-entertainment-4207622718",
        "is_active": True,
        "extracted_keywords": [
            "Lead",
            "Backend",
            "Distributed Systems",
            "Microservices",
            "Cloud",
            "Java",
            "Kubernetes",
        ],
    },
    {
        "id": "jl-uk-021",
        "job_title": "Senior Fullstack Engineer (Remote, United Kingdom)",
        "company_name": "Live Nation Entertainment / Ticketmaster",
        "location": "Remote, United Kingdom",
        "remote_type": "remote",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Senior full-stack engineer on Ticketmaster's TM1 Events team, "
            "owning development of B2B event management applications and "
            "leading design of scalable architectures."
        ),
        "job_type": "full_time",
        "experience_level": "senior",
        "posted_date": "2025-04-30",
        "external_url": "https://uk.linkedin.com/jobs/view/senior-fullstack-engineer-remote-united-kingdom-at-live-nation-entertainment-4159663153",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "Full Stack",
            "React",
            "Node.js",
            "TypeScript",
            "Microservices",
            "DevOps",
        ],
    },
    {
        "id": "jl-uk-022",
        "job_title": "Lead Software Engineer (Remote, United Kingdom)",
        "company_name": "Live Nation Entertainment / Ticketmaster",
        "location": "Remote, United Kingdom",
        "remote_type": "remote",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Lead backend engineer in Ticketmaster's CORE team, modernising and "
            "globalising core commerce platforms using cutting-edge and "
            "established technologies."
        ),
        "job_type": "full_time",
        "experience_level": "lead",
        "posted_date": "2025-05-07",
        "external_url": "https://builtinlondon.uk/job/lead-software-engineer-remote-united-kingdom/4408820",
        "is_active": True,
        "extracted_keywords": [
            "Lead",
            "Backend",
            "E-commerce",
            "Microservices",
            "Cloud",
            "Scala",
            "Java",
        ],
    },
    {
        "id": "jl-uk-023",
        "job_title": "Entry-level Developer (Career Switchers and Returners 2026)",
        "company_name": "Softwire",
        "location": "London / Cambridge, UK",
        "remote_type": "onsite",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Entry-level software developer role at Softwire for career "
            "switchers and returners, with intensive software engineering "
            "induction and project work on digital and AI solutions."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2026-01-01",
        "external_url": "https://www.softwire.com/vacancy/entry-level-developer-career-switchers-and-returners/",
        "is_active": True,
        "extracted_keywords": [
            "Entry Level",
            "Software Engineering",
            "Training",
            "Digital Transformation",
            "Artificial Intelligence",
            "Agile",
        ],
    },
    {
        "id": "jl-uk-024",
        "job_title": "Junior Software Developer",
        "company_name": "Expert Employment",
        "location": None,
        "remote_type": "onsite",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Junior software developer role advertised via Expert Employment, "
            "supporting commercial software development in a UK-based team."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2024-12-18",
        "external_url": "https://talents.studysmarter.co.uk/companies/expert-employment/junior-software-developer-324625/",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "Software Development",
            "C#",
            "JavaScript",
        ],
    },
    {
        "id": "jl-uk-025",
        "job_title": "Senior Back-end Developer (C#, .NET, ReactJS, NodeJS)",
        "company_name": "Jumar Solutions",
        "location": "Remote, United Kingdom",
        "remote_type": "remote",
        "salary_min": 40000,
        "salary_max": 70000,
        "salary_currency": "GBP",
        "description": (
            "Senior back-end developer working remotely in the UK on C#, .NET "
            "and JavaScript stacks, delivering back-end services and web "
            "frontends for enterprise clients."
        ),
        "job_type": "full_time",
        "experience_level": "senior",
        "posted_date": "2025-03-30",
        "external_url": "https://tinyurl.com/2mtjfnm7",
        "is_active": True,
        "extracted_keywords": [
            "Senior",
            "C#",
            ".NET",
            "React",
            "Node.js",
            "Remote",
        ],
    },
    {
        "id": "jl-uk-026",
        "job_title": "Junior PHP Laravel Developer",
        "company_name": "Delivery Software Ltd",
        "location": "Farnworth, UK",
        "remote_type": "onsite",
        "salary_min": 30000,
        "salary_max": 30000,
        "salary_currency": "GBP",
        "description": (
            "Junior PHP Laravel developer role in Farnworth, maintaining and "
            "extending web applications in a small, growing software team."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2025-03-30",
        "external_url": "https://tinyurl.com/83auvunp",
        "is_active": True,
        "extracted_keywords": [
            "Junior",
            "PHP",
            "Laravel",
            "MySQL",
            "JavaScript",
        ],
    },
    {
        "id": "jl-uk-027",
        "job_title": "Full Stack Developer",
        "company_name": "CBSbutler Holdings Limited",
        "location": "City of London, UK",
        "remote_type": "onsite",
        "salary_min": 40000,
        "salary_max": 70000,
        "salary_currency": "GBP",
        "description": (
            "Full-stack developer role in the City of London, working across "
            "front-end and back-end services for enterprise clients with a "
            "modern JavaScript and .NET stack."
        ),
        "job_type": "full_time",
        "experience_level": "junior",
        "posted_date": "2025-03-30",
        "external_url": "https://tinyurl.com/3ft6c8p6",
        "is_active": True,
        "extracted_keywords": [
            "Full Stack",
            "C#",
            ".NET",
            "JavaScript",
            "SQL",
        ],
    },
    {
        "id": "jl-uk-028",
        "job_title": "Junior / Mid-Level C# Developer",
        "company_name": "Adria Solutions Ltd",
        "location": "Manchester, UK",
        "remote_type": "onsite",
        "salary_min": 40000,
        "salary_max": 70000,
        "salary_currency": "GBP",
        "description": (
            "Junior to mid-level C# developer role in Manchester, working on "
            "C#/.NET applications as part of a growing engineering team with "
            "clear progression paths."
        ),
        "job_type": "full_time",
        "experience_level": "mid",
        "posted_date": "2025-03-30",
        "external_url": "https://tinyurl.com/2chvwwje",
        "is_active": True,
        "extracted_keywords": [
            "C#",
            ".NET",
            "SQL",
            "Agile",
            "Junior",
        ],
    },
    {
        "id": "jl-uk-029",
        "job_title": "Software Engineer (Hybrid, BBC Salford Project)",
        "company_name": "Reed Professional Services",
        "location": "Manchester / Salford, UK",
        "remote_type": "hybrid",
        "salary_min": None,
        "salary_max": None,
        "salary_currency": "GBP",
        "description": (
            "Contract software engineer role supporting a major UK media "
            "company, building scalable back-end services on AWS and "
            "responsive React front-ends with hybrid working to Salford."
        ),
        "job_type": "contract",
        "experience_level": "mid",
        "posted_date": "2024-03-06",
        "external_url": "https://www.reedps.com/careers/software-engineer/",
        "is_active": True,
        "extracted_keywords": [
            "Software Engineer",
            "React",
            "JavaScript",
            "AWS",
            "CI/CD",
            "TDD",
        ],
    },
    {
        "id": "jl-uk-030",
        "job_title": "C# .NET Software Developer",
        "company_name": "Confidential (via Reed.co.uk)",
        "location": "Altrincham / Remote, UK",
        "remote_type": "remote",
        "salary_min": None,
        "salary_max": 70000,
        "salary_currency": "GBP",
        "description": (
            "C#/.NET software developer role designing and maintaining bespoke "
            "software solutions in a modern DevOps environment, with remote or "
            "hybrid working options around Greater Manchester."
        ),
        "job_type": "full_time",
        "experience_level": "mid",
        "posted_date": "2026-02-04",
        "external_url": "https://www.reed.co.uk/jobs/software-developer-c-net-software-engineer/56430705",
        "is_active": True,
        "extracted_keywords": [
            "C#",
            ".NET",
            "DevOps",
            "Azure",
            "Remote",
        ],
    },
]
