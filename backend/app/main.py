import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.routes import auth, projects, generation, uploads

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    connect_to_mongo()
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "videos"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "audio"), exist_ok=True)
    yield
    # Shutdown actions
    close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API boilerplate for PromptFlow AI content generation system.",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve local static uploads directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers under /api prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(generation.router, prefix=settings.API_V1_STR)
app.include_router(uploads.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "ok",
        "message": "PromptFlow AI backend is running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
