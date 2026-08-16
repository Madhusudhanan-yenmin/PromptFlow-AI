from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="John Doe")
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., min_length=6, example="secret123")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., example="secret123")

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    createdAt: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
