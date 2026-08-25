# AI Appointment Booking

A full-stack appointment booking prototype with a Next.js frontend, Express backend, PostgreSQL database, and planned AI-assisted booking flow.

## Tech Stack

- Next.js + TypeScript
- Node.js + Express
- PostgreSQL
- `pg`
- Zod
- Docker

## Project Structure

```text
frontend/
backend/
  src/
    config/
    controllers/
    db/
    middleware/
    repositories/
    routes/
    services/
    utils/
```

The backend follows a simple layered structure:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

Routes handle HTTP routing, controllers handle request/response concerns, services contain business logic, and repositories will handle database access.

## Database

Current entities:

- `users`
- `providers`
- `appointments`
- `chat_sessions`
- `chat_messages`

A user can book an appointment with a provider.

Relevant indexes are added for:

- user appointments by scheduled time
- provider appointments by scheduled time
- user chat sessions
- chat messages by session

PostgreSQL migrations are versioned and executed transactionally.

## Backend Middleware

The backend currently includes:

- request logging
- request validation foundation
- basic rate limiting
- CORS
- Helmet
- centralized error handling
- not-found handling

The current rate limiter is in-memory because this prototype runs as a single backend instance. In a distributed setup, a shared store such as Redis would be more appropriate.

## Local Setup

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create `backend/.env` from `backend/.env.example`.

Example:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://appointment_user:appointment_password@localhost:5432/appointment_app
CLIENT_ORIGIN=http://localhost:3000
```

Create `frontend/.env.local` from `frontend/.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres
```

### 4. Run migrations

```bash
cd backend
npm run db:migrate
```

### 5. Start backend

```bash
npm run dev
```

Backend:

```text
http://localhost:4000
```

Health check:

```text
GET /api/health
```

### 6. Start frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Current Progress

Implemented:

- frontend/backend project setup
- PostgreSQL schema
- migrations
- connection pooling
- backend architecture
- request logging
- validation foundation
- rate limiting
- centralized error handling
- health endpoint

Next:

- JWT authentication
- provider and appointment APIs
- chat flow
- AI-assisted appointment booking

## Key Decisions

- PostgreSQL is used because the domain is relational and benefits from constraints and foreign keys.
- `pg` is used directly to keep database behavior explicit and easy to review.
- UUIDs are used for public-facing entity IDs.
- `TIMESTAMPTZ` is used for appointment times to avoid timezone ambiguity.
- AI will interpret user requests, but business logic and database writes will remain in the application service layer.

## Known Limitations

This is a functional prototype, not a production-scale system.

Current limitations include:

- no authentication yet
- no provider availability model yet
- no distributed rate limiting
- no multi-tenancy
- no AI integration yet