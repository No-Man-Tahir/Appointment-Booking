INSERT INTO users (
    id,
    name,
    email,
    password_hash
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'Demo User',
    'demo@example.com',
    'development-placeholder-hash'
);


INSERT INTO appointments (
    user_id,
    scheduled_at,
    status,
    notes
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    NOW() + INTERVAL '1 day',
    'confirmed',
    'Initial consultation'
);


INSERT INTO chat_sessions (
    id,
    user_id
)
VALUES (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111'
);


INSERT INTO chat_messages (
    chat_session_id,
    role,
    content
)
VALUES
(
    '22222222-2222-4222-8222-222222222222',
    'user',
    'I would like to book an appointment tomorrow.'
),
(
    '22222222-2222-4222-8222-222222222222',
    'assistant',
    'Sure. What time would you prefer?'
);