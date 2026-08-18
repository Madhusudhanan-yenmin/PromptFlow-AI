import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "PromptFlow AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "promptflow_ai"

    # Security & JWT
    JWT_SECRET: str = "change_this_secret_key_in_production_32chars_min"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # File Storage
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))

    # Ollama LLM Configuration
    OLLAMA_BASE_URL: str = "https://txlzwfs4-11434.inc1.devtunnels.ms"
    OLLAMA_MODEL: str = "llama3.1:8b"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
