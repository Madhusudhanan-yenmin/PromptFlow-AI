from datetime import datetime, timezone
from bson import ObjectId
from app.schemas.generation import GenerationCreate, GenerationStatusResponse

class GenerationService:
    @staticmethod
    def request_generation(gen_in: GenerationCreate) -> GenerationStatusResponse:
        gen_id = str(ObjectId())
        now = datetime.now(timezone.utc)
        
        return GenerationStatusResponse(
            generationId=gen_id,
            projectId=gen_in.projectId,
            status="pending",
            message="AI generation service will be implemented in the next phase",
            types=gen_in.requestedTypes,
            assets=[],
            createdAt=now,
            updatedAt=now
        )

    @staticmethod
    def get_generation_status(generation_id: str) -> GenerationStatusResponse:
        now = datetime.now(timezone.utc)
        return GenerationStatusResponse(
            generationId=generation_id,
            projectId="65cf123456789abcdef01234",
            status="pending",
            message="AI generation service will be implemented in the next phase",
            types=["image", "video", "text"],
            assets=[],
            createdAt=now,
            updatedAt=now
        )
