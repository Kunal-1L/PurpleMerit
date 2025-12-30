# Purple Merit Technologies

## Project Overview

Purple Merit is a simple user management web application with authentication and an admin panel. Users can sign up, log in, view and update their profile, and change their password. Admins can view a paginated list of users and activate/deactivate accounts.

## Tech Stack

- Frontend: React (Vite), React Router, Axios, react-toastify, CSS Modules
- Backend: Node.js, Express, MongoDB (Mongoose)
- Authentication: JSON Web Tokens (JWT)
- Password hashing: bcryptjs
- Dev / tooling: Vite, ESLint, nodemon (dev)

## Repo Structure

- `frontend/` — React app (Vite)
- `backend/` — Express API server

## Environment Variables

Create `.env` files (do not commit secrets). Required variables:

- Backend (`backend/.env`)
  - `DB_URI` — MongoDB connection string
  - `JWT_SECRET` — secret used to sign JWTs
  - `PORT` — (optional) port for backend server (default 5000)

- Frontend (`frontend/.env.development`, `frontend/.env.production`)
  - `VITE_API_URL` — full URL of backend API (e.g. `http://localhost:5000`)

## Setup Instructions (Local)

Prerequisites: Node.js (>=16), npm, and a MongoDB instance (local or cloud).

1. Backend

```bash
cd backend
npm install
# create backend/.env with DB_URI and JWT_SECRET
# start server:
node server.js
# or install nodemon and run:
npx nodemon server.js
```

2. Frontend

```bash
cd frontend
npm install
# set VITE_API_URL in frontend/.env.development
npm run dev
```

Open the frontend at the URL shown by Vite (usually `http://localhost:5173`).

## Deployment Instructions

Frontend (example: Vercel / Netlify)

- Build the app: `npm run build` inside `frontend/`.
- Deploy the `frontend/dist` output to your hosting provider.
- Set the environment variable `VITE_API_URL` on the hosting platform to point to your backend.

Backend (example: Render / Heroku)

- Ensure `DB_URI` and `JWT_SECRET` are configured on the host.
- Use `node server.js` or a `Procfile` with `web: node server.js`.
- Configure the platform to expose the port via the `PORT` env var.

Optional: Containerize with Docker and deploy to any container service.

## API Documentation

Base URL: `{{VITE_API_URL}}` (set in frontend env)

Headers: For protected endpoints include `Authorization: Bearer <token>`

1) POST /signup

- Request body (JSON):

```json
{
  "user_email": "user@example.com",
  "user_password": "password123",
  "user_name": "Jane Doe"
}
```

- Success response (201):

```json
{
  "message": "User registered successfully",
  "user": { "email": "user@example.com", "name": "Jane Doe", "role": "user" }
}
```

2) POST /login

- Request body (JSON):

```json
{
  "user_email": "user@example.com",
  "user_password": "password123"
}
```

- Success response (200):

```json
{
  "token": "<jwt-token>",
  "user": { "email": "user@example.com", "name": "Jane Doe", "role": "user" }
}
```

3) GET /profile (protected)

- Headers: `Authorization: Bearer <token>`
- Success response (200):

```json
{
  "userProfile": { "email": "user@example.com", "name": "Jane Doe", "role": "user" }
}
```

4) PUT /update-profile (protected)

- Request body (JSON):

```json
{
  "userId": "<userId>",
  "new_email": "new@example.com",
  "new_name": "New Name"
}
```

- Success response (200):

```json
{
  "message": "Profile updated successfully",
  "user": { "email": "new@example.com", "name": "New Name", "role": "user" }
}
```


5) GET /users?page=1&limit=10 (protected, admin only)

- Query params: `page` (default 1), `limit` (default 10)
- Success response (200):

```json
{
  "users": [ /* array of users (no passwords) */ ],
  "totalUsers": 123,
  "currentPage": 1,
  "totalPages": 13
}
```

6) PUT /user/:id/status (protected, admin only)

- Request body (JSON):

```json
{ "status": "active" }
```

- Success response (200):

```json
{ "message": "User status updated successfully" }
```

