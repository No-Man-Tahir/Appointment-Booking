CREATE EXTENSION IF NOT EXISTS btree_gist;


ALTER TABLE appointments
ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30;


ALTER TABLE appointments
ADD COLUMN ends_at TIMESTAMPTZ;


UPDATE appointments
SET ends_at =
  scheduled_at + INTERVAL '30 minutes'
WHERE ends_at IS NULL;


ALTER TABLE appointments
ALTER COLUMN ends_at SET NOT NULL;


DROP INDEX IF EXISTS uq_appointments_provider_active_slot;


ALTER TABLE appointments
ADD CONSTRAINT appointments_no_provider_overlap
EXCLUDE USING gist (
  provider_id WITH =,
  tstzrange(
    scheduled_at,
    ends_at,
    '[)'
  ) WITH &&
)
WHERE (
  status IN ('pending', 'confirmed')
);