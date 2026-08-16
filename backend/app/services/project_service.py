import logging
from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_collection
from app.models.project import ProjectModel
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

logger = logging.getLogger("promptflow.projects")

class ProjectService:
    @staticmethod
    def create_project(user_id: str, project_in: ProjectCreate) -> ProjectResponse:
        collection = get_collection("projects")
        doc = ProjectModel.create_document(
            user_id=user_id,
            title=project_in.title,
            original_prompt=project_in.originalPrompt,
            input_images=project_in.inputImages
        )
        
        if collection is not None:
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
        else:
            doc["_id"] = ObjectId()
            logger.warning("MongoDB offline: Created project doc in-memory.")

        return ProjectResponse(**ProjectModel.format_response(doc))

    @staticmethod
    def get_user_projects(user_id: str) -> List[ProjectResponse]:
        collection = get_collection("projects")
        if collection is not None:
            cursor = collection.find({"userId": user_id}).sort("createdAt", -1)
            return [ProjectResponse(**ProjectModel.format_response(doc)) for doc in cursor]
        
        # Fallback list if DB connection unavailable
        return []

    @staticmethod
    def get_project_by_id(project_id: str, user_id: Optional[str] = None) -> ProjectResponse:
        collection = get_collection("projects")
        if collection is not None and ObjectId.is_valid(project_id):
            query = {"_id": ObjectId(project_id)}
            if user_id:
                query["userId"] = user_id
            doc = collection.find_one(query)
            if doc:
                return ProjectResponse(**ProjectModel.format_response(doc))

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )

    @staticmethod
    def delete_project(project_id: str, user_id: str) -> bool:
        collection = get_collection("projects")
        if collection is not None and ObjectId.is_valid(project_id):
            result = collection.delete_one({"_id": ObjectId(project_id), "userId": user_id})
            if result.deleted_count > 0:
                return True
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found or access denied."
            )
        return True
