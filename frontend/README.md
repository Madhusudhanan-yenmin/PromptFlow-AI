# PromptFlow AI Frontend

React 18 + TypeScript + Vite + Tailwind CSS Frontend Application.

## Features
- Centralized Axios Instance (`src/services/api.ts`) using `VITE_API_BASE_URL`
- Auth Context & Route Guards (`ProtectedRoute`)
- Reactive Pages: Login, Register, Dashboard, Create Workspace, Results, History
- Local File Upload integration with backend static media serving

## Setup & Running

1. Install dependencies:
```bash
npm install
```

2. Environment configuration:
Ensure `.env` contains:
```env
VITE_API_BASE_URL=http://localhost:8000
```

3. Launch development server:
```bash
npm run dev
```

App will be available at: http://localhost:5173
