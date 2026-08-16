from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GenerationCreate(BaseModel):
    projectId: str = Field(..., example="65cf123456789abcdef01234")
    requestedTypes: List[str] = Field(default_factory=lambda: ["image", "video", "text"], example=["image", "video", "text"])
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)

class GenerationStatusResponse(BaseModel):
    generationId: str
    projectId: str
    status: str = "pending"
    message: str
    types: List[str] = []
    assets: List[Dict[str, Any]] = []
    createdAt: datetime
    updatedAt: datetime
