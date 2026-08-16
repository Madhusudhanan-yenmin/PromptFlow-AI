from typing import List, Optional
from fastapi import APIRouter, Depends, status
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services.project_service import ProjectService
from app.core.security import get_current_user_optional

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Create a new PromptFlow content creation project."""
    user_id = current_user.get("sub") if current_user else "anonymous"
    return ProjectService.create_project(user_id=user_id, project_in=project_in)

@router.get("", response_model=List[ProjectResponse])
def list_projects(current_user: Optional[dict] = Depends(get_current_user_optional)):
    """Retrieve list of user projects."""
    user_id = current_user.get("sub") if current_user else "anonymous"
    return ProjectService.get_user_projects(user_id=user_id)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str):
    """Get project details by ID."""
    return ProjectService.get_project_by_id(project_id=project_id)

@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Delete a project by ID."""
    user_id = current_user.get("sub") if current_user else "anonymous"
    success = ProjectService.delete_project(project_id=project_id, user_id=user_id)
    return {"status": "success", "message": f"Project '{project_id}' deleted successfully."}
