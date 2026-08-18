import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_collection
from app.ai.orchestrator import AIOrchestrator
from app.ai.ollama_client import OllamaClient
from app.schemas.generation import GenerateRequest, GenerateResponse, AIHealthResponse

logger = logging.getLogger("promptflow.service.generation")

# In-memory record storage fallback when MongoDB is offline
_in_memory_generations: Dict[str, dict] = {}

class GenerationService:
    @staticmethod
    async def request_generation(req: GenerateRequest, user_id: Optional[str] = "anonymous") -> GenerateResponse:
        """
        Execute AI Orchestrator workflow and persist generation outcome.
        """
        orchestrator = AIOrchestrator()
        now_start = datetime.now(timezone.utc)

        # Run AI Orchestrator (Llama 3.1 8B via Ollama)
        pipeline_result = await orchestrator.process_pipeline(
            prompt=req.prompt,
            input_image_path=req.inputImagePath
        )

        now_done = datetime.now(timezone.utc)
        gen_id = str(ObjectId())

        record_data = {
            "_id": gen_id,
            "id": gen_id,
            "projectId": req.projectId,
            "userId": user_id,
            "originalPrompt": req.prompt,
            "inputImagePath": req.inputImagePath,
            "success": True,
            "status": "completed",
            "intent": pipeline_result["intent"],
            "contentPlan": pipeline_result["contentPlan"],
            "generatedPrompts": pipeline_result["generatedPrompts"],
            "textContent": pipeline_result["textContent"],
            "model": pipeline_result["model"],
            "provider": pipeline_result["provider"],
            "createdAt": now_start,
            "completedAt": now_done
        }

        # Persist to MongoDB if available
        collection = get_collection("generations")
        if collection is not None:
            try:
                collection.insert_one(record_data)
            except Exception as e:
                logger.error(f"MongoDB insert error in generations: {e}")

        # Always mirror in in-memory storage fallback
        _in_memory_generations[gen_id] = record_data

        return GenerateResponse(**record_data)

    @staticmethod
    async def get_generation(generation_id: str) -> GenerateResponse:
        """
        Retrieve generation details by ID from MongoDB or in-memory fallback.
        """
        collection = get_collection("generations")
        if collection is not None and ObjectId.is_valid(generation_id):
            try:
                doc = collection.find_one({"_id": ObjectId(generation_id)})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return GenerateResponse(**doc)
            except Exception as e:
                logger.error(f"MongoDB query error for generation {generation_id}: {e}")

        if generation_id in _in_memory_generations:
            return GenerateResponse(**_in_memory_generations[generation_id])

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generation record '{generation_id}' not found."
        )

    @staticmethod
    async def get_ai_health() -> AIHealthResponse:
        """
        Check health and model availability of Ollama runtime.
        """
        client = OllamaClient()
        health = await client.check_health()
        return AIHealthResponse(**health)
