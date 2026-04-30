# AI Book Recommender System

A full-stack recommendation platform with three services:

- `frontend/`: Next.js web app
- `backend/`: Node.js + Express API with MongoDB
- `ml-service/`: FastAPI recommendation microservice

## What It Does

- Book discovery with search and detail pages
- Cookie-based authentication (register, login, logout, profile)
- Personal collection and 1-5 star ratings
- AI-generated book summaries (Groq via frontend API route)
- ML-powered similar book recommendations (FastAPI + cosine similarity)

## Architecture

- Frontend calls backend APIs for books, auth, collection, and ratings.
- Backend calls ML service for recommendations.
- MongoDB stores books, users, favorites, and ratings.

## Prerequisites

- Node.js 20+
- Python 3.10+
- MongoDB Atlas (or local MongoDB)

## Environment Setup

### 1) Backend env (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 2) Frontend env (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
GROQ_API_KEY=your_groq_api_key
```

### 3) ML service env

No required env variables for basic local run based on current setup.

## Run Locally

Open three terminals.

### ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### Backend

```bash
cd backend
npm install
npm runstart
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Service URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- ML service: `http://localhost:8000`

## Deployment Notes

- Backend CORS uses `FRONTEND_URL` and supports credentials.
- Auth cookies are production-ready for cross-origin use (`secure` + `sameSite=none` in production).
- Backend ML endpoint uses `ML_SERVICE_URL` with fallback to `http://localhost:8000`.

## MongoDB Keep-Alive (GitHub Actions)

To reduce inactivity pause risk on free MongoDB Atlas tiers, this repo includes:

- Script: `backend/keepAlive.js`
- Workflow: `.github/workflows/mongo-keep-alive.yml`

Workflow behavior:

- Scheduled every 3 days
- Manual trigger via `workflow_dispatch`
- Uses `MONGO_URI` from GitHub Secrets

Add this repository secret before enabling the workflow:

- `MONGO_URI`