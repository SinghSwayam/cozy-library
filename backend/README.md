# Backend (Node.js + Express + MongoDB)

This service handles authentication, user collections, ratings, book search, and recommendation proxying to the ML service.

## Features

- JWT cookie-based authentication (`/api/auth/*`)
- User collection management (`/api/users/collection`)
- User ratings (`/api/ratings`)
- Book catalog search and detail (`/api/books`, `/api/books/:id`)
- Recommendation proxy to FastAPI ML service (`/api/recommendations/:book_id`)
- MongoDB keep-alive script (`keepAlive.js`) for scheduled pings

## Tech Stack

- Node.js (CommonJS)
- Express
- Mongoose (MongoDB Atlas/local MongoDB)
- Axios
- Cookie Parser + CORS

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Notes:

- `FRONTEND_URL` is used by CORS.
- `ML_SERVICE_URL` defaults to `http://localhost:8000` if not set.
- Auth cookies are configured for cross-origin production usage:
	- `secure: process.env.NODE_ENV === 'production'`
	- `sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'`

## Install

```bash
cd backend
npm install
```

## Run

```bash
cd backend
npm start
```

The API runs on `http://localhost:5000` by default.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)

### Books & Recommendations

- `GET /api/books?search=...`
- `GET /api/books/:id`
- `GET /api/recommendations/:book_id`

### User Collection

- `POST /api/users/collection` (protected)
- `DELETE /api/users/collection/:book_id` (protected)
- `GET /api/users/collection` (protected)

### Ratings

- `POST /api/ratings` (protected)
- `GET /api/ratings` (protected)
- `GET /api/ratings/:book_id` (protected)

## MongoDB Keep-Alive Script

To manually ping MongoDB:

```bash
cd backend
node keepAlive.js
```

This script:

- Connects using `MONGO_URI`
- Executes `mongoose.connection.db.admin().ping()`
- Logs success/failure
- Gracefully disconnects
