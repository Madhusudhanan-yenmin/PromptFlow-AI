from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=2, example="I am launching a new coffee shop called Brew House.")
    projectId: Optional[str] = Field(None, example="65cf123456789abcdef01234")
    inputImagePath: Optional[str] = Field(None, example="/uploads/images/sample.jpg")

class IntentSchema(BaseModel):
    type: str = Field(..., example="brand_launch")
    goal: str = Field(..., example="Launch a new coffee shop")
    domain: str = Field(..., example="business")
    targetAudience: Optional[str] = Field(None, example="coffee customers")

class ContentPlanItemSchema(BaseModel):
    type: str = Field(..., example="image")
    required: bool = True
    reason: str = Field(..., example="Promotional creative for social media")

class GeneratedPromptsSchema(BaseModel):
    image: Optional[str] = None
    video: Optional[str] = None
    logo: Optional[str] = None

class TextContentSchema(BaseModel):
    caption: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list)
    bodyText: Optional[str] = None

class GenerateResponse(BaseModel):
    id: str
    projectId: Optional[str] = None
    userId: Optional[str] = None
    originalPrompt: str
    inputImagePath: Optional[str] = None
    success: bool = True
    status: str = "completed"
    intent: IntentSchema
    contentPlan: List[ContentPlanItemSchema]
    generatedPrompts: GeneratedPromptsSchema
    textContent: TextContentSchema
    model: str = "llama3.1:8b"
    provider: str = "ollama"
    createdAt: datetime
    completedAt: datetime

class AIHealthResponse(BaseModel):
    ollama: bool
    model: str
    status: str
    available_models: List[str] = Field(default_factory=list)
    message: str
