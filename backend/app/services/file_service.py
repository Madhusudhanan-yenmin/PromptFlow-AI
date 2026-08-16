import os
import uuid
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.db.mongodb import get_collection
from app.models.asset import AssetModel

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}

class FileService:
    @staticmethod
    async def save_image(file: UploadFile, project_id: str = "default", user_id: str = "anonymous") -> dict:
        filename = file.filename or "upload.png"
        ext = os.path.splitext(filename)[1].lower()

        if ext not in ALLOWED_IMAGE_EXTENSIONS or (file.content_type and file.content_type not in ALLOWED_MIME_TYPES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{ext}'. Allowed image extensions: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
            )

        unique_filename = f"{uuid.uuid4().hex}{ext}"
        target_dir = os.path.join(settings.UPLOAD_DIR, "images")
        os.makedirs(target_dir, exist_ok=True)
        
        file_path = os.path.join(target_dir, unique_filename)
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        relative_url = f"/uploads/images/{unique_filename}"

        # Save metadata to MongoDB if database connected
        collection = get_collection("assets")
        if collection is not None:
            asset_doc = AssetModel.create_document(
                project_id=project_id,
                user_id=user_id,
                asset_type="image",
                file_name=filename,
                file_path=relative_url,
                mime_type=file.content_type or "image/png",
                status="completed"
            )
            collection.insert_one(asset_doc)

        return {
            "fileName": filename,
            "savedName": unique_filename,
            "url": relative_url,
            "size": len(content),
            "mimeType": file.content_type or "image/png",
            "status": "completed"
        }
