# Frontend (Next.js)

This is the UI for the AI Book Recommender system. It provides discovery, authentication flows, collection management, ratings, AI summaries, and ML-powered similar book recommendations.

## Features

- Landing page with book carousel and search
- Authentication pages (`/login`, `/register`) with cookie-based session support
- Protected collection page (`/collection`)
- Book detail page with:
	- Add/remove collection
	- 1-5 star user rating
	- AI summary generation
	- ML similar-books discovery
- Next.js API route for summaries: `POST /api/summary` (Groq)

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Lucide icons
- Groq SDK

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
GROQ_API_KEY=your_groq_api_key
```

Notes:

- `NEXT_PUBLIC_API_URL` points to the Node backend base API URL.
- `GROQ_API_KEY` is used by the server-side Next API route in `src/app/api/summary/route.ts`.
- Do not commit real API keys.

## Install

```bash
cd frontend
npm install
```

## Run

```bash
cd frontend
npm run dev
```

App URL: `http://localhost:3000`

## Production Build

```bash
cd frontend
npm run build
npm start
```

## Important App Routes

- `/` discovery home
- `/login` sign in
- `/register` sign up
- `/collection` user collection (protected)
- `/books/[id]` book detail
