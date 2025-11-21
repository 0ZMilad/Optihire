# Optihire Backend

FastAPI backend with Supabase PostgreSQL integration for AI-powered ATS resume optimization.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database + authentication
- **SQLModel** - SQL ORM with Pydantic
- **Alembic** - Database migrations

---

## API Style Guide

### URL Structure

- **Base URL**: `/api/v1/`
- **Naming**: Use plural nouns (`/users`, `/resumes`, `/jobs`)
- **Multi-word**: Use kebab-case (`/job-descriptions`)
- **IDs**: Path parameters (`/users/{id}`)
- **Filtering**: Query parameters (`/resumes?status=active`)

### HTTP Methods

- **GET** - Read data (list or single)
- **POST** - Create new resource
- **PATCH** - Update existing resource (partial)
- **DELETE** - Remove resource (soft delete)

### Status Codes

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `422` - Validation error
- `500` - Server error

### Response Format

**Success:**

```json
{
  "id": "uuid",
  "field": "value",
  "created_at": "2025-10-13T22:45:30.123456"
}
```

**Error:**

```json
{
  "detail": "Error message"
}
```

### Authentication

```
Authorization: Bearer <supabase_jwt_token>
```

**Public endpoints:**

- `/health`
- `/api/v1/system/health`

**Protected endpoints:**

- All `/api/v1/*` require auth

### Data Formats

- **Dates**: ISO 8601 (`2025-10-13T22:45:30.123456`)
- **IDs**: UUID v4 (`550e8400-e29b-41d4-a716-446655440000`)
- **Booleans**: `true`/`false`

### Best Practices

1. Use Pydantic schemas for validation
2. Business logic in services, not endpoints
3. Use dependency injection for DB sessions
4. Implement soft deletes (`deleted_at`)
5. Use UUID primary keys
6. Return proper status codes
7. Log all errors
