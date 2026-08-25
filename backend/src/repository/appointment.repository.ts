import { pool } from "../db/pool.js";

export type AppointmentRecord = {
  id: string;
  user_id: string;
  provider_id: string;
  scheduled_at: Date;
  status: string;
  notes: string | null;
  created_at: Date;
};

export async function createAppointment(input: {
  userId: string;
  providerId: string;
  scheduledAt: string;
  notes?: string;
}) {
  const result = await pool.query<AppointmentRecord>(
    `
      INSERT INTO appointments (
        user_id,
        provider_id,
        scheduled_at,
        notes
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      input.userId,
      input.providerId,
      input.scheduledAt,
      input.notes ?? null,
    ]
  );

  return result.rows[0];
}

export async function findAppointmentsByUser(
  userId: string
) {
  const result = await pool.query(
    `
      SELECT
        a.id,
        a.scheduled_at,
        a.status,
        a.notes,
        a.created_at,

        p.id AS provider_id,
        p.name AS provider_name,
        p.specialty AS provider_specialty

      FROM appointments a

      JOIN providers p
        ON p.id = a.provider_id

      WHERE a.user_id = $1

      ORDER BY a.scheduled_at
    `,
    [userId]
  );

  return result.rows;
}

export async function findAppointmentByIdAndUser(
  appointmentId: string,
  userId: string
) {
  const result = await pool.query(
    `
      SELECT
        a.*,
        p.name AS provider_name,
        p.specialty AS provider_specialty

      FROM appointments a

      JOIN providers p
        ON p.id = a.provider_id

      WHERE
        a.id = $1
        AND a.user_id = $2
    `,
    [
      appointmentId,
      userId,
    ]
  );

  return result.rows[0] ?? null;
}

export async function cancelAppointment(
  appointmentId: string,
  userId: string
) {
  const result = await pool.query(
    `
      UPDATE appointments

      SET
        status = 'cancelled',
        updated_at = NOW()

      WHERE
        id = $1
        AND user_id = $2
        AND status IN (
          'pending',
          'confirmed'
        )

      RETURNING *
    `,
    [
      appointmentId,
      userId,
    ]
  );

  return result.rows[0] ?? null;
}