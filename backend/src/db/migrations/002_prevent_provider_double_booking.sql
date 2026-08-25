CREATE UNIQUE INDEX
uq_appointments_provider_active_slot
ON appointments (
    provider_id,
    scheduled_at
)
WHERE status IN (
    'pending',
    'confirmed'
);