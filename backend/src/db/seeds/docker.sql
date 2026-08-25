INSERT INTO providers (
  id,
  name,
  specialty
)
VALUES (
  '33333333-3333-4333-8333-333333333333',
  'Dr. Ali Ahmed',
  'General Consultation'
)
ON CONFLICT (id) DO NOTHING;