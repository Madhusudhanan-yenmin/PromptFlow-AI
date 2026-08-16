from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, example="New Product Launch Campaign")
    originalPrompt: str = Field(..., min_length=1, example="Create an engaging social media package for our new fitness app.")
    inputImages: List[str] = Field(default_factory=list, example=["/uploads/images/sample.png"])

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    originalPrompt: Optional[str] = None
    inputImages: Optional[List[str]] = None
    intent: Optional[str] = None
    contentPlan: Optional[List[Any]] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    userId: str
    title: str
    originalPrompt: str
    inputImages: List[str] = []
    intent: Optional[str] = None
    contentPlan: List[Any] = []
    status: str = "draft"
    createdAt: datetime
    updatedAt: datetime
