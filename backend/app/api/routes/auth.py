from fastapi import APIRouter, Depends, status
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister):
    """Register a new user and receive a JWT access token."""
    return AuthService.register_user(user_in)

@router.post("/login", response_model=Token)
def login(user_in: UserLogin):
    """Authenticate user with email/password and receive a JWT access token."""
    return AuthService.login_user(user_in)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Fetch current authenticated user profile."""
    user_id = current_user.get("sub")
    return AuthService.get_user_by_id(user_id)
