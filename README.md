### 🔧 Project Overview
**Smart Assistant** is a full-stack web application built with **FastAPI** (backend) and **React + Vite (TypeScript)** (frontend).  
It includes user authentication, product & sales management, a dashboard, and a Retrieval-Augmented Generation (RAG) assistant backed by **ChromaDB** + **sentence-transformers** (embeddings) with optional LLM synthesis (Google Generative AI).

---

### ✨ Key Features
- **Auth**: Sign up & JWT auth (login endpoint returns Bearer token) 🔐  
- **Products & Sales**: CRUD interactions and DB-backed analytics 📊  
- **Dashboard**: Overview & KPIs 📈  
- **RAG assistant**: Vector store retrieval + optional LLM synthesis (via Google Generative AI) for answering questions about products and sales 🧠

---

### 🧱 Tech Stack
- Backend: **Python**, **FastAPI**, **SQLAlchemy**, **Uvicorn**  
- Embeddings & Vector DB: **sentence-transformers**, **chromadb**  
- Frontend: **React + TypeScript**, **Vite**  
- DB: **SQLite** (default), configurable via `DATABASE_URL`  
- Dev & Tools: `python-dotenv`, `uvicorn`, many ML & LangChain related libs

---

### ⚙️ Prerequisites
- Python 3.10+  
- Node.js & npm/yarn for frontend  
- (Optional) API keys for LLMs if you want synthesis: Google Generative AI, OpenRouter, HuggingFace, etc.

---

### 🚀 Quickstart

Backend
```bash
# 1. Create & activate virtual env
python -m venv venv
# Windows
venv\Scripts\activate

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Create a .env file or edit the included .env with your values (see ENV VARS below)

# 4. Run the app
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend
```bash
cd front-end/front-end
npm install
npm run dev
# Open http://localhost:5173 (vite default)
```

API base: http://127.0.0.1:8000/  
Frontend Axios default baseURL: `http://127.0.0.1:8000/` (see axiosConfig.ts)

---

### 🧾 Environment Variables
Store these in .env (do NOT commit secrets to git):
- `SECRET_KEY` — JWT secret  
- `ALGORITHM` — e.g., `HS256`  
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token expiry  
- `DATABASE_URL` — e.g., `sqlite:///./stock.db`  
- `HF_TOKEN` / `OPENROUTER_API_KEY` / `GOOGLE_API_KEY` — optional LLM/GenAI keys

> ⚠️ Note: The repo already includes a .env example — replace values with your own secrets.

---

### 🔍 Important Endpoints (examples)
- GET `/` — health / root message  
- POST `/auth/` — login (payload: `{ "email": "...", "password": "..." }`) -> returns `access_token`  
- POST `/auth/SignUp` — create user  
- POST `/rag/ask/` — RAG question (payload: `{ "question": "...", "k": 4 }`)  
- (Other routers: `/products`, `/sales`, `/dashboard`)

Example: ask RAG via curl:
```bash
curl -X POST http://127.0.0.1:8000/rag/ask/ -H 'Content-Type: application/json' \
  -d '{"question":"How many products do we have?", "k": 4}'
```

---

### 🧠 RAG & Vector Store Notes
- Uses `chromadb` with a persistent local path chroma_db (see RAG.py).  
- Embeddings computed with `sentence-transformers` model `all-MiniLM-L6-v2`.  
- If `GOOGLE_API_KEY` is provided, the app will attempt to synthesize final answers using Google Generative AI (Gemini); otherwise the response is based on retrieved passages or DB-aggregations.

---

### 🛠 Development Tips
- DB tables are auto-created from models (`models.Base.metadata.create_all(bind=engine)`), so a simple start-up creates required tables with the configured `DATABASE_URL`.  
- For auth-protected requests, include `Authorization: Bearer <access_token>` header.  
- Frontend auto-mounts token from `localStorage` into Axios headers.

---

### 📄 Contributing
- Fork -> branch -> PR.  
- Keep changes small and focused (feature or fix), add tests if you add complex logic.
