# PromptFlow AI Backend

FastAPI + PyMongo + JWT Authentication + Local Storage Backend Service.

## Requirements
- Python 3.10+
- MongoDB instance (Local `mongodb://localhost:27017` or MongoDB Atlas)

## Setup Instructions

1. Create a Python virtual environment:
```bash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure Environment Variables:
Copy `.env.example` to `.env` and adjust settings:
```bash
cp .env.example .env
```

4. Run FastAPI Development Server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation
- Interactive Swagger UI: http://localhost:8000/docs
- ReDoc UI: http://localhost:8000/redoc
- Health Check: http://localhost:8000/api/health
