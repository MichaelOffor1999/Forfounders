# Forfounders

A full-stack web app to connect members of a founding team, helping them network and build products together.

## Features

- User registration and authentication (JWT)
- Onboarding with specialization and interests
- Founder discovery and matching
- Wave requests and connection management
- Messaging between connected users
- Profile management
- Responsive UI

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Flask, Flask-JWT-Extended, Flask-CORS, Flask-PyMongo
- **Database:** MongoDB Atlas
- **Deployment:** Render (backend), Vercel (frontend)

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.x & pip
- MongoDB Atlas account

### Local Setup

#### Backend

1. Clone the repo and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with (replace values):
   ```env
   MONGO_URI=your_mongo_uri
   JWT_SECRET_KEY=your_jwt_secret
   SECRET_KEY=your_flask_secret
   ```
4. Run the server:
   ```bash
   python app.py
   ```

#### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Run the app (development):
   ```bash
   npm run dev
   ```

## Deployment

- Backend: Deploy to Render (or similar). Set environment variables (`MONGO_URI`, `JWT_SECRET_KEY`, `SECRET_KEY`) in the Render dashboard. Set the service root to the `backend` folder, build command `pip install -r requirements.txt`, and start command `gunicorn app:app` (or `python app.py` for testing).

- Frontend: Deploy to Vercel. Set the project root to the `frontend` folder and define an environment variable `VITE_API_URL` pointing to your backend production URL (for example `https://forfounders.onrender.com`).

## API Endpoints

- `POST /api/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT
- `GET /api/me` — Get current user profile (requires Authorization header)
- `GET /api/discovery` — Discover founders
- `POST /api/waved/<user_id>` — Wave at a user
- `POST /api/accept_wave/<user_id>` — Accept a wave request
- `GET /api/wave_requests` — List incoming wave requests
- `POST /api/messages/send` — Send a message (requires connection)
- `GET /api/messages/<user_id>` — Get messages with a connected user

## Environment Variables

**Backend** (set on Render or in `.env` for local development):

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET_KEY` — Secret key used to sign JWTs
- `SECRET_KEY` — Flask secret key (sessions, CSRF if used)

**Frontend** (in `frontend/.env` or Vercel environment variables):

- `VITE_API_URL` — Base URL of the backend API (e.g. `https://forfounders.onrender.com`)

