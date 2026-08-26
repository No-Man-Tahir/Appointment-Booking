CREATE TABLE request_events (
  id BIGSERIAL PRIMARY KEY,

  request_id UUID NOT NULL,

  user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

  event_type VARCHAR(100) NOT NULL,

  payload JSONB,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT NOW()
);

CREATE INDEX idx_request_events_request_id
ON request_events(request_id, id);

CREATE INDEX idx_request_events_event_type
ON request_events(event_type);

CREATE INDEX idx_request_events_created_at
ON request_events(created_at DESC);