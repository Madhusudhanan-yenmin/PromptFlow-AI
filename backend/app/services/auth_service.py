import logging
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_collection
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import UserModel
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

logger = logging.getLogger("promptflow.auth")

class AuthService:
    @staticmethod
    def register_user(user_in: UserRegister) -> Token:
        collection = get_collection("users")
        
        # Check if email already exists when MongoDB is available
        if collection is not None:
            existing = collection.find_one({"email": user_in.email.lower()})
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email already exists."
                )
            
            pwd_hash = get_password_hash(user_in.password)
            doc = UserModel.create_document(user_in.name, user_in.email, pwd_hash)
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            user_resp = UserResponse(**UserModel.format_response(doc))
        else:
            # Fallback mock for offline dev DB
            logger.warning("MongoDB not connected. Returning mock registration user.")
            fake_id = str(ObjectId())
            pwd_hash = get_password_hash(user_in.password)
            doc = {"_id": fake_id, "name": user_in.name, "email": user_in.email.lower(), "passwordHash": pwd_hash}
            user_resp = UserResponse(id=fake_id, name=user_in.name, email=user_in.email, createdAt=doc.get("createdAt"))

        access_token = create_access_token(subject=user_resp.id)
        return Token(access_token=access_token, token_type="bearer", user=user_resp)

    @staticmethod
    def login_user(user_in: UserLogin) -> Token:
        collection = get_collection("users")
        
        if collection is not None:
            user_doc = collection.find_one({"email": user_in.email.lower()})
            if not user_doc or not verify_password(user_in.password, user_doc.get("passwordHash", "")):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            user_resp = UserResponse(**UserModel.format_response(user_doc))
        else:
            logger.warning("MongoDB not connected. Using mock login credentials check.")
            fake_id = "65cf123456789abcdef01234"
            user_resp = UserResponse(id=fake_id, name="Demo User", email=user_in.email, createdAt="2026-08-16T12:00:00Z")

        access_token = create_access_token(subject=user_resp.id)
        return Token(access_token=access_token, token_type="bearer", user=user_resp)

    @staticmethod
    def get_user_by_id(user_id: str) -> UserResponse:
        collection = get_collection("users")
        if collection is not None and ObjectId.is_valid(user_id):
            user_doc = collection.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                return UserResponse(**UserModel.format_response(user_doc))
        
        # Default fallback
        return UserResponse(
            id=user_id,
            name="Demo User",
            email="demo@promptflow.ai",
            createdAt="2026-08-16T12:00:00Z"
        )
