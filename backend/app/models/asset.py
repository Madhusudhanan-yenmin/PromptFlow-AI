from datetime import datetime, timezone
from typing import Dict, Any

class AssetModel:
    @staticmethod
    def create_document(
        project_id: str,
        user_id: str,
        asset_type: str,
        file_name: str,
        file_path: str,
        mime_type: str,
        status: str = "completed"
    ) -> Dict[str, Any]:
        """Format a new asset document for MongoDB insertion."""
        now = datetime.now(timezone.utc)
        return {
            "projectId": project_id,
            "userId": user_id,
            "type": asset_type,
            "fileName": file_name,
            "filePath": file_path,
            "mimeType": mime_type,
            "status": status,
            "createdAt": now
        }

    @staticmethod
    def format_response(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format MongoDB asset document for JSON API response."""
        return {
            "id": str(doc["_id"]),
            "projectId": str(doc.get("projectId", "")),
            "userId": str(doc.get("userId", "")),
            "type": doc.get("type", "image"),
            "fileName": doc.get("fileName", ""),
            "filePath": doc.get("filePath", ""),
            "mimeType": doc.get("mimeType", ""),
            "status": doc.get("status", "completed"),
            "createdAt": doc.get("createdAt", datetime.now(timezone.utc))
        }
