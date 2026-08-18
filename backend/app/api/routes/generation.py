from typing import Optional
from fastapi import APIRouter, Depends, status
from app.schemas.generation import GenerateRequest, GenerateResponse, AIHealthResponse
from app.services.generation_service import GenerationService
from app.core.security import get_current_user_optional

router = APIRouter(tags=["Generation"])

@router.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_200_OK)
async def generate_content(
    gen_in: GenerateRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Trigger PromptFlow AI planning & prompt generation pipeline.
    Uses Llama 3.1 8B via Ollama to analyze intent, create content plan,
    generate media prompts (FLUX.2/Wan 2.2), and generate text content.
    """
    user_id = current_user.get("sub") if current_user else "anonymous"
    return await GenerationService.request_generation(gen_in, user_id=user_id)

@router.get("/generate/{generation_id}", response_model=GenerateResponse)
async def get_generation(generation_id: str):
    """
    Retrieve generation details and content plan by ID.
    """
    return await GenerationService.get_generation(generation_id)

@router.get("/ai/health", response_model=AIHealthResponse)
async def check_ai_health():
    """
    Health check endpoint to verify Ollama status and Llama 3.1 8B model readiness.
    """
    return await GenerationService.get_ai_health()
