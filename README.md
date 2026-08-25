# AI-Assisted Appointment Booking

A full-stack SaaS-style prototype that provides conversational
AI-assisted appointment booking.

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

### Database
- PostgreSQL

### AI
- LLM provider integration

## Project Structure

```text
.
├── frontend/   # Next.js application
├── backend/    # Express API
└── README.md
```

## Database Design

PostgreSQL is used as the primary relational datastore.

Core entities:

- `users` — authentication and profile information
- `appointments` — scheduled appointments belonging to users
- `chat_sessions` — user conversation sessions
- `chat_messages` — normalized conversation history

### Design Decisions

UUIDs are used for externally exposed entity identifiers.

Appointment times use `TIMESTAMPTZ` to avoid timezone ambiguity.

Database-level foreign keys, check constraints, and uniqueness
constraints protect data integrity even if application validation fails.

Indexes are based on expected access patterns:

- user appointments ordered by schedule
- user chat sessions
- messages within a chat session

### Multi-tenancy

Multi-tenancy is intentionally not implemented in the prototype.
A SaaS extension would introduce a `businesses` entity and scope
tenant-owned records using `business_id`.

### Performance Considerations

Indexes are kept limited to known query patterns because additional
indexes improve reads at the cost of storage and write performance.

The backend uses PostgreSQL connection pooling rather than creating a
new database connection per request.