# PromptFlow AI

**PromptFlow AI** is a multi-modal content creation platform designed to analyze user intent from text and image prompts and orchestrate AI content generation across Images, Videos, Captions, Hashtags, Logos, and Audio.

> **Note**: This repository contains the **clean, scalable boilerplate foundation** for PromptFlow AI. AI model API integrations (Gemini, Imagen 3, Veo, etc.) are stubbed cleanly inside the `backend/app/ai/` module for implementation in Phase 2.

---

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Glassmorphism design theme)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (Centralized instance with `VITE_API_BASE_URL` and auth token interceptors)
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.10+ & FastAPI
- **Database**: MongoDB & PyMongo
- **Authentication**: JWT Access Tokens + bcrypt password hashing (`passlib`)
- **Data Validation**: Pydantic v2 & Pydantic Settings
- **File Storage**: Local Disk Storage served via FastAPI Static Files (`/uploads`)
- **Server**: Uvicorn

---

## Folder Structure

```
PromptFlow-AI/
│
├── frontend/                     # React + TypeScript + Vite Application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/           # Navbar, Sidebar, ProtectedRoute
│   │   ├── context/              # AuthContext (React Auth Provider)
│   │   ├── hooks/                # Custom hooks (useAuth)
│   │   ├── layouts/              # MainLayout, AuthLayout
│   │   ├── pages/                # Login, Register, Dashboard, CreateWorkspace, Results, History
│   │   ├── services/             # Centralized Axios instance & service modules
│   │   ├── types/                # Auth, Project, and Generation TypeScript interfaces
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css             # Tailwind CSS & glassmorphic styles
│   ├── .env / .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Python FastAPI Service
│   ├── app/
│   │   ├── ai/                   # AI Orchestrator & Generator module stubs
│   │   │   ├── orchestrator.py
│   │   │   ├── intent_analyzer.py
│   │   │   ├── image_generator.py
│   │   │   ├── video_generator.py
│   │   │   └── text_generator.py
│   │   ├── api/routes/           # API route controllers (auth, projects, generation, uploads)
│   │   ├── core/                 # Config & security (JWT, bcrypt)
│   │   ├── db/                   # MongoDB PyMongo connection instance
│   │   ├── models/               # MongoDB BSON document models
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Business logic layer
│   │   └── main.py               # FastAPI entry point & CORS configuration
│   ├── uploads/                  # Local storage directories
│   │   ├── images/
│   │   ├── videos/
│   │   └── audio/
│   ├── .env / .env.example
│   └── requirements.txt
│
└── README.md
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local MongoDB Community Server running on `mongodb://localhost:27017` (or MongoDB Atlas URI)

---

## Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=promptflow_ai
JWT_SECRET=promptflow_ai_dev_secret_key_2026_super_secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Setup & Running Instructions

### 1. Backend Setup (FastAPI)

1. Open terminal and navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create & activate Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Start the backend server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Root: `http://localhost:8000`
   - Health Check: `http://localhost:8000/api/health`
   - Interactive Swagger API Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend Application: `http://localhost:5173`

---

## Available API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and obtain JWT access token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/projects` | Create a new content generation project |
| `GET` | `/api/projects` | List user projects |
| `GET` | `/api/projects/{id}` | Get project details by ID |
| `DELETE` | `/api/projects/{id}` | Delete a project by ID |
| `POST` | `/api/generate` | Trigger AI generation pipeline (placeholder) |
| `GET` | `/api/generate/{id}/status` | Check generation task status |
| `POST` | `/api/uploads/image` | Upload image to local disk storage (`/uploads/images/`) |

---

## Verifying MongoDB Connection

1. Ensure your MongoDB server is running:
   ```bash
   # On Windows Service or mongod command:
   mongod --dbpath C:\data\db
   ```
2. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Observe terminal output:
   ```text
   INFO: Successfully connected to MongoDB database 'promptflow_ai' at mongodb://localhost:27017
   ```
4. Using MongoDB Compass or `mongosh`, inspect the `promptflow_ai` database to view generated collections:
   - `users`
   - `projects`
   - `generations`
   - `assets`
