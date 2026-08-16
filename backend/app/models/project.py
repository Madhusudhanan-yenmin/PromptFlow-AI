from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

class ProjectModel:
    @staticmethod
    def create_document(
        user_id: str,
        title: str,
        original_prompt: str,
        input_images: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Format a new project document for MongoDB insertion."""
        now = datetime.now(timezone.utc)
        return {
            "userId": user_id,
            "title": title,
            "originalPrompt": original_prompt,
            "inputImages": input_images or [],
            "intent": None,
            "contentPlan": [],
            "status": "draft",
            "createdAt": now,
            "updatedAt": now
        }

    @staticmethod
    def format_response(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format MongoDB project document for JSON API response."""
        return {
            "id": str(doc["_id"]),
            "userId": str(doc.get("userId", "")),
            "title": doc.get("title", ""),
            "originalPrompt": doc.get("originalPrompt", ""),
            "inputImages": doc.get("inputImages", []),
            "intent": doc.get("intent"),
            "contentPlan": doc.get("contentPlan", []),
            "status": doc.get("status", "draft"),
            "createdAt": doc.get("createdAt", datetime.now(timezone.utc)),
            "updatedAt": doc.get("updatedAt", datetime.now(timezone.utc))
        }
