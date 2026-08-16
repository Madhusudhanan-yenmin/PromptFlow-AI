from fastapi import APIRouter, status
from app.schemas.generation import GenerationCreate, GenerationStatusResponse
from app.services.generation_service import GenerationService

router = APIRouter(prefix="/generate", tags=["Generation"])

@router.post("", response_model=GenerationStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def start_generation(gen_in: GenerationCreate):
    """
    Trigger multi-modal generation pipeline.
    Placeholder return value indicating feature will be enabled in next phase.
    """
    return GenerationService.request_generation(gen_in)

@router.get("/{generation_id}/status", response_model=GenerationStatusResponse)
def get_generation_status(generation_id: str):
    """
    Check generation task status by ID.
    """
    return GenerationService.get_generation_status(generation_id)
