# AI Appointment Booking

A full-stack appointment booking prototype with an AI-assisted conversational booking flow.

Users can:

- Sign up and log in
- View available providers
- Book and cancel appointments using a structured form
- View existing appointments
- Book appointments conversationally through an AI chatbot
- Continue multi-turn conversations when booking information is incomplete

The project focuses on clean frontend/backend separation, practical PostgreSQL modeling, secure authentication, AI integration with clear business boundaries, and simple production-style architecture without unnecessary infrastructure.

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- Zod
- JWT authentication using HttpOnly cookies

### Database
- PostgreSQL
- Raw SQL migrations
- `pg`

### AI
- Mistral API
- Structured JSON responses
- Zod validation of AI output

### Infrastructure
- Docker
- Docker Compose

---

## Architecture

The backend follows a simple layered structure:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

Responsibilities are intentionally separated:

- **Routes** define endpoints.
- **Middleware** handles authentication, validation, logging, rate limiting, and request IDs.
- **Controllers** translate HTTP requests and responses.
- **Services** contain application and business logic.
- **Repositories** contain SQL/database access.
- **AIService** communicates with the LLM but does not directly modify business data.

This keeps the application easy to understand without introducing unnecessary microservices or frameworks.

---

## Main Features

### Authentication

Authentication uses JWTs stored in HttpOnly cookies.

This was chosen instead of browser `localStorage` so JavaScript cannot directly access the authentication token.

Implemented endpoints include:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

## Appointments

Users can create, list, retrieve, and cancel appointments.

```text
POST  /api/appointments
GET   /api/appointments
GET   /api/appointments/:id
PATCH /api/appointments/:id/cancel
```

Appointments currently use a globally configured duration:

```env
APPOINTMENT_DURATION_MINUTES=30
```

The frontend therefore displays appointment times in 30-minute intervals rather than allowing arbitrary time input.

Past slots are disabled.

Booked slots are retrieved through:

```text
GET /api/providers/:id/booked-slots
```

Only slot information is exposed; another user's appointment information is never returned.

---

## Preventing Double Booking

Application-level availability checks improve the user experience, but they are not considered sufficient for concurrency protection.

PostgreSQL remains the final source of truth.

Each appointment stores:

```text
scheduled_at
ends_at
```

and PostgreSQL uses an exclusion constraint on the provider and appointment time range.

This prevents cases such as:

```text
10:00 - 10:30
10:15 - 10:45   ❌ rejected

10:00 - 10:30
10:30 - 11:00   ✅ allowed
```

This protects against two users attempting to book the same provider concurrently even if both previously saw the slot as available.

---

## AI Booking Flow

The chatbot uses Mistral to understand natural-language appointment requests.

Example:

```text
User:
I want to book an appointment.

Assistant:
Which provider would you like?

User:
Dr. Ali.

Assistant:
Which date would you prefer?

User:
Tomorrow at 16:30.

Assistant:
I have Dr. Ali tomorrow at 16:30.
Would you like me to book this appointment?

User:
Yes.

Assistant:
Your appointment has been booked.
```

The AI extracts structured information such as:

```json
{
  "providerId": "...",
  "date": "2026-08-27",
  "time": "16:30",
  "missingFields": []
}
```

AI output is validated with Zod before the application trusts it.

---

## AI vs Business Logic

A deliberate design decision was made to prevent the LLM from directly creating appointments.

The flow is:

```text
User message
    ↓
ChatService
    ↓
AIService
    ↓
Structured AI result
    ↓
Application validation
    ↓
AppointmentService
    ↓
PostgreSQL
```

The AI can understand intent and suggest an action, but only `AppointmentService` can perform the booking.

This ensures the same provider validation, future-time validation, duration rules, and database constraints are used by both:

```text
Appointment form
        ↓
AppointmentService

AI chatbot
        ↓
AppointmentService
```

The application only reports a successful booking after PostgreSQL confirms that the appointment was created.

---

## Multi-Turn Conversation

Chat sessions and messages are persisted in PostgreSQL.

```text
chat_sessions
chat_messages
```

Recent conversation messages are provided to the AI so information from earlier turns can be reused.

The chatbot supports states such as:

```text
collect_details
update_booking
request_confirmation
confirm_booking
cancel_booking
unsupported
```

The structured booking form remains available as a fallback when a user prefers not to continue conversationally.

---

## Request Event Analytics

The project includes lightweight database-backed request tracing.

Every important request receives a `request_id`, and lifecycle events can be stored in:

```text
request_events
```

A conversational booking request may produce:

```text
request_received
user_message_saved
ai_request_started
ai_response_received
booking_confirmation_requested
appointment_booking_started
appointment_created
assistant_message_saved
response_sent
```

Events share the same request ID, making it possible to inspect the lifecycle of an individual request and perform basic analytics.

This is intentionally **not event sourcing**.

For a larger system these events could instead be forwarded asynchronously to Kafka, an observability platform, or an analytics pipeline.

---

## Why PostgreSQL + Raw SQL?

Raw SQL and lightweight repositories were used instead of introducing an ORM.

The data model is small, and the assessment places emphasis on database modeling, constraints, indexes, and DDL.

Using SQL directly makes important behavior such as:

- foreign keys
- indexes
- partial/exclusion constraints
- migrations
- overlap prevention

explicit and easy to review.

---

## Database Model

Main tables:

```text
users
providers
appointments
chat_sessions
chat_messages
request_events
```

Important indexes are based on actual query patterns, including:

```text
appointments(user_id, scheduled_at)
appointments(provider_id, scheduled_at)
chat_sessions(user_id, created_at)
chat_messages(chat_session_id, created_at)
request_events(request_id, id)
```

---

## Real-Time Chat Decision

WebSockets were considered but intentionally not added to the prototype.

The current chat request waits for the AI response and updates the UI immediately, which provides a sufficiently near-real-time experience for the project scope.

WebSockets would become more valuable if AI token streaming, background jobs, or asynchronous notifications were introduced.

This avoided adding infrastructure that did not materially improve the current workflow.

---

## Provider Scheduling Assumption

To keep the prototype focused, provider-specific working schedules are not modeled.

Providers are assumed to potentially accept appointments throughout the day, while:

- appointments use fixed time intervals
- past slots are disabled
- already booked slots are disabled
- PostgreSQL prevents overlapping bookings

A production system could introduce provider availability schedules, holidays, services, and provider-specific appointment durations.

---

## Testing Decision

A dedicated automated test suite was intentionally omitted to keep the prototype focused on demonstrating the requested end-to-end functionality within the assessment scope.

Important flows were manually verified, including:

- authentication
- form-based booking
- conversational booking
- booking confirmation
- appointment cancellation
- occupied-slot handling
- provider ownership/data isolation
- AI error handling

For production use, unit tests, API integration tests, database integration tests, and end-to-end tests would be added.

---

# Running Locally with Docker

The complete application can be started using Docker Compose.

## 1. Clone the repository

```bash
git clone https://github.com/No-Man-Tahir/Appointment-Booking
cd ai-appointment-booking
```

## 2. Create environment file

```bash
cp .env.example .env
```

Configure:

```env
POSTGRES_DB=appointment_app
POSTGRES_USER=appointment_user
POSTGRES_PASSWORD=appointment_password

JWT_SECRET=replace-with-a-secret-at-least-32-characters-long

MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_MODEL=mistral-small-latest

APPOINTMENT_DURATION_MINUTES=30
```

## 3. Start everything

```bash
docker compose up --build
```

Docker starts:

```text
PostgreSQL
    ↓
database migrations
    ↓
backend
    ↓
development seed
    ↓
frontend
```

Open:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:4000

Health:
http://localhost:4000/api/health
```

The development seed creates a sample provider so the booking workflow can be tested immediately.

---

## Stop the Application

```bash
docker compose down
```

Database data remains persisted in the Docker volume.

To completely reset the database:

```bash
docker compose down -v
docker compose up --build
```

---

# Running Without Docker

Start PostgreSQL, then:

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## Key Tradeoffs

This prototype intentionally favors clarity over unnecessary production complexity.

Not included:

- Microservices
- Kafka/RabbitMQ
- Redis
- Kubernetes
- WebSockets
- LangChain/LangGraph
- Complex agent orchestration
- Provider working-hour management
- Automated test suite

These could be valuable at larger scale, but they are not required to demonstrate the core architecture and booking workflow.

---

## Known Limitations / Future Improvements

Potential future improvements include:

- WebSocket or token-streamed AI responses
- Provider-specific working schedules
- Different appointment types and durations
- Rescheduling
- Email/SMS notifications
- Retry strategy for temporary AI failures
- Dedicated analytics/observability platform
- Automated unit, integration, and E2E tests
- Admin/provider dashboards
- Multi-tenant business support

---

## Summary

The project demonstrates a complete appointment-booking workflow across:

```text
Next.js UI
    ↓
Express API
    ↓
AI-assisted conversation
    ↓
Application business rules
    ↓
PostgreSQL constraints
```

The main design goal was to keep AI responsible for **understanding user intent**, while keeping deterministic application code and PostgreSQL responsible for **validating and executing bookings**.