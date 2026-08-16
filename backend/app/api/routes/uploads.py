from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, status
from app.services.file_service import FileService
from app.core.security import get_current_user_optional

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    projectId: Optional[str] = Form("default"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Upload image to local disk storage (`backend/uploads/images/`).
    Returns image URL path and metadata.
    """
    user_id = current_user.get("sub") if current_user else "anonymous"
    return await FileService.save_image(file=file, project_id=projectId, user_id=user_id)
