CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- Users
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    email VARCHAR(320) NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX uq_users_email_lower
ON users (LOWER(email));


-- =========================================================
-- Appointments
-- =========================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE RESTRICT,

    scheduled_at TIMESTAMPTZ NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_appointments_status
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            )
        )
);


CREATE INDEX idx_appointments_user_scheduled_at
ON appointments (user_id, scheduled_at);

CREATE INDEX idx_appointments_provider_scheduled_at
ON appointments (provider_id, scheduled_at);


-- =========================================================
-- Chat Sessions
-- =========================================================

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_chat_sessions_status
        CHECK (
            status IN (
                'active',
                'closed'
            )
        )
);


CREATE INDEX idx_chat_sessions_user_created_at
ON chat_sessions (user_id, created_at DESC);


-- =========================================================
-- Chat Messages
-- =========================================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    chat_session_id UUID NOT NULL
        REFERENCES chat_sessions(id)
        ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_chat_messages_role
        CHECK (
            role IN (
                'user',
                'assistant',
                'system'
            )
        )
);


CREATE INDEX idx_chat_messages_session_created_at
ON chat_messages (chat_session_id, created_at);

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    specialty VARCHAR(120),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);