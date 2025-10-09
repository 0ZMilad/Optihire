from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    supabase_user_id: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    supabase_user_id: str

    class Config:
        from_attributes = True # Pydantic v2 equivalent of orm_mode