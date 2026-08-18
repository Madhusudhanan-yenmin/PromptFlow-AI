import logging
from datetime import datetime, timezone
from typing import Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import get_collection
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import UserModel
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

logger = logging.getLogger("promptflow.auth")

# In-memory storage fallback when MongoDB is not running locally or for demo users
_in_memory_users_by_email: Dict[str, dict] = {}
_in_memory_users_by_id: Dict[str, dict] = {}

def _seed_demo_user():
    demo_email = "demo@promptflow.ai"
    if demo_email not in _in_memory_users_by_email:
        demo_id = "65cf123456789abcdef01234"
        pwd_hash = get_password_hash("demo123")
        now = datetime.now(timezone.utc)
        user_data = {
            "id": demo_id,
            "name": "Demo User",
            "email": demo_email,
            "passwordHash": pwd_hash,
            "createdAt": now
        }
        _in_memory_users_by_email[demo_email] = user_data
        _in_memory_users_by_id[demo_id] = user_data

_seed_demo_user()


class AuthService:
    @staticmethod
    def register_user(user_in: UserRegister) -> Token:
        clean_email = user_in.email.lower().strip()
        collection = get_collection("users")
        
        if collection is not None:
            try:
                existing = collection.find_one({"email": clean_email})
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="A user with this email address already exists."
                    )
                
                pwd_hash = get_password_hash(user_in.password)
                doc = UserModel.create_document(user_in.name, user_in.email, pwd_hash)
                result = collection.insert_one(doc)
                doc["_id"] = result.inserted_id
                user_resp = UserResponse(**UserModel.format_response(doc))

                # Mirror in memory as well
                _in_memory_users_by_email[clean_email] = {
                    "id": user_resp.id,
                    "name": user_resp.name,
                    "email": clean_email,
                    "passwordHash": pwd_hash,
                    "createdAt": user_resp.createdAt
                }
                _in_memory_users_by_id[user_resp.id] = _in_memory_users_by_email[clean_email]

                access_token = create_access_token(subject=user_resp.id)
                return Token(access_token=access_token, token_type="bearer", user=user_resp)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"MongoDB register error: {e}. Falling back to in-memory registration.")
                collection = None

        # Fallback to persistent in-memory user registry for local dev
        if clean_email in _in_memory_users_by_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        fake_id = str(ObjectId())
        pwd_hash = get_password_hash(user_in.password)
        now = datetime.now(timezone.utc)

        user_data = {
            "id": fake_id,
            "name": user_in.name,
            "email": clean_email,
            "passwordHash": pwd_hash,
            "createdAt": now
        }

        _in_memory_users_by_email[clean_email] = user_data
        _in_memory_users_by_id[fake_id] = user_data

        user_resp = UserResponse(
            id=fake_id,
            name=user_in.name,
            email=clean_email,
            createdAt=now
        )
        logger.info(f"User '{clean_email}' successfully registered in in-memory database.")

        access_token = create_access_token(subject=user_resp.id)
        return Token(access_token=access_token, token_type="bearer", user=user_resp)

    @staticmethod
    def login_user(user_in: UserLogin) -> Token:
        clean_email = user_in.email.lower().strip()
        collection = get_collection("users")
        
        # 1. Try MongoDB first if collection exists
        if collection is not None:
            try:
                user_doc = collection.find_one({"email": clean_email})
                if user_doc:
                    if not verify_password(user_in.password, user_doc.get("passwordHash", "")):
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email address or password."
                        )
                    user_resp = UserResponse(**UserModel.format_response(user_doc))
                    access_token = create_access_token(subject=user_resp.id)
                    return Token(access_token=access_token, token_type="bearer", user=user_resp)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"MongoDB login error: {e}. Falling back to in-memory login.")

        # 2. Check in-memory user store (handles demo credentials & local dev users)
        user_data = _in_memory_users_by_email.get(clean_email)
        if user_data:
            if not verify_password(user_in.password, user_data.get("passwordHash", "")):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email address or password."
                )

            user_resp = UserResponse(
                id=user_data["id"],
                name=user_data["name"],
                email=user_data["email"],
                createdAt=user_data["createdAt"]
            )
            access_token = create_access_token(subject=user_resp.id)
            return Token(access_token=access_token, token_type="bearer", user=user_resp)

        # 3. Special fallback for demo user credentials
        if clean_email == "demo@promptflow.ai" and user_in.password == "demo123":
            now = datetime.now(timezone.utc)
            demo_id = "65cf123456789abcdef01234"
            user_resp = UserResponse(
                id=demo_id,
                name="Demo User",
                email="demo@promptflow.ai",
                createdAt=now
            )
            access_token = create_access_token(subject=user_resp.id)
            return Token(access_token=access_token, token_type="bearer", user=user_resp)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )

    @staticmethod
    def get_user_by_id(user_id: str) -> UserResponse:
        collection = get_collection("users")
        if collection is not None and ObjectId.is_valid(user_id):
            try:
                user_doc = collection.find_one({"_id": ObjectId(user_id)})
                if user_doc:
                    return UserResponse(**UserModel.format_response(user_doc))
            except Exception as e:
                logger.error(f"MongoDB get_user error: {e}")

        # Check in-memory database
        if user_id in _in_memory_users_by_id:
            data = _in_memory_users_by_id[user_id]
            return UserResponse(
                id=data["id"],
                name=data["name"],
                email=data["email"],
                createdAt=data["createdAt"]
            )
        
        # Default fallback for demo user
        now = datetime.now(timezone.utc)
        return UserResponse(
            id=user_id,
            name="Demo User",
            email="demo@promptflow.ai",
            createdAt=now
        )
