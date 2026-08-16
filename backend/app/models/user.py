from datetime import datetime, timezone
from typing import Dict, Any

class UserModel:
    @staticmethod
    def create_document(name: str, email: str, password_hash: str) -> Dict[str, Any]:
        """Format a new user document for MongoDB insertion."""
        now = datetime.now(timezone.utc)
        return {
            "name": name,
            "email": email.lower(),
            "passwordHash": password_hash,
            "createdAt": now
        }

    @staticmethod
    def format_response(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Format MongoDB user document for JSON API response."""
        return {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "email": doc["email"],
            "createdAt": doc.get("createdAt", datetime.now(timezone.utc))
        }
