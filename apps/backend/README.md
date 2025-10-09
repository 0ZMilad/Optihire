# OptiHire Backend

FastAPI backend with Supabase PostgreSQL integration for AI-powered ATS resume optimization.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database, authentication, and storage
- **SQLModel** - SQL database ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation

## Structure

```
app/
├── api/v1/endpoints/  # API routes
├── core/              # Configuration & security
├── db/                # Database session & Supabase client
├── models/            # SQLModel database models
├── schemas/           # Pydantic request/response schemas
└── services/          # Business logic
```

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Configure `.env` with Supabase credentials

3. Run migrations:

```bash
alembic upgrade head
```

4. Start server:

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`
