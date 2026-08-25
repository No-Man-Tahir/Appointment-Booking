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
export type ProviderBookedAppointment = {
  scheduled_at: Date;
  duration: number;
  ends_at: Date;
};

export async function createAppointment(input: {
  userId: string;
  providerId: string;
  scheduledAt: string;
  notes?: string;
  endsAt: string;
}) {
  const result = await pool.query<AppointmentRecord>(
    `
      INSERT INTO appointments (
        user_id,
        provider_id,
        scheduled_at,
        notes,
        ends_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      input.userId,
      input.providerId,
      input.scheduledAt,
      input.notes ?? null,
      input.endsAt,
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
        a.ends_at,

        p.id AS provider_id,
        p.name AS provider_name,
        p.specialty AS provider_specialty

      FROM appointments a

      JOIN providers p
        ON p.id = a.provider_id

      WHERE a.user_id = $1

      ORDER BY a.scheduled_at ASC
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

export async function findProviderBookedAppointmentsForDay(
  providerId: string,
  startOfDay: Date,
  endOfDay: Date
): Promise<ProviderBookedAppointment[]> {
  const result =
    await pool.query<ProviderBookedAppointment>(
      `
        SELECT
          scheduled_at,
          ends_at,
          duration_minutes
        FROM appointments
        WHERE provider_id = $1
          AND status IN ('pending', 'confirmed')
          AND scheduled_at < $3
          AND ends_at > $2
        ORDER BY scheduled_at ASC
      `,
      [
        providerId,
        startOfDay,
        endOfDay,
      ]
    );

  return result.rows;
}