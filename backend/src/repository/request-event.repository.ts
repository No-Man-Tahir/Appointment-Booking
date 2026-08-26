import { pool } from "../db/pool.js";

export type RequestEventPayload =
  Record<string, unknown>;

export type RequestEventRecord = {
  id: number;
  request_id: string;
  user_id: string | null;
  event_type: string;
  payload: RequestEventPayload | null;
  created_at: Date;
};

export async function createRequestEvent(input: {
  requestId: string;
  userId?: string | null;
  eventType: string;
  payload?: RequestEventPayload;
}) {
  const result =
    await pool.query<RequestEventRecord>(
      `
        INSERT INTO request_events (
          request_id,
          user_id,
          event_type,
          payload
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        input.requestId,
        input.userId ?? null,
        input.eventType,
        input.payload
          ? JSON.stringify(input.payload)
          : null,
      ]
    );

  return result.rows[0];
}

export async function findRequestEvents(
  requestId: string
) {
  const result =
    await pool.query<RequestEventRecord>(
      `
        SELECT
          id,
          request_id,
          user_id,
          event_type,
          payload,
          created_at
        FROM request_events
        WHERE request_id = $1
        ORDER BY id ASC
      `,
      [requestId]
    );

  return result.rows;
}