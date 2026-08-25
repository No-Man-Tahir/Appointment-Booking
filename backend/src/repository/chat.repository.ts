import type { PoolClient } from "pg";

import { pool } from "../db/pool.js";

export type ChatSessionRecord = {
  id: string;
  user_id: string;
  status: "active" | "closed";
  created_at: Date;
  updated_at: Date;
};

export type ChatMessageRole =
  | "user"
  | "assistant"
  | "system";

export type ChatMessageRecord = {
  id: string;
  chat_session_id: string;
  role: ChatMessageRole;
  content: string;
  created_at: Date;
};

export async function createChatSession(
  userId: string
): Promise<ChatSessionRecord> {
  const result =
    await pool.query<ChatSessionRecord>(
      `
        INSERT INTO chat_sessions (
          user_id
        )
        VALUES ($1)
        RETURNING *
      `,
      [userId]
    );

  return result.rows[0];
}

export async function findChatSessionsByUser(
  userId: string
): Promise<ChatSessionRecord[]> {
  const result =
    await pool.query<ChatSessionRecord>(
      `
        SELECT
          id,
          user_id,
          status,
          created_at,
          updated_at
        FROM chat_sessions
        WHERE user_id = $1
        ORDER BY updated_at DESC
      `,
      [userId]
    );

  return result.rows;
}

export async function findChatSessionByIdAndUser(
  sessionId: string,
  userId: string
): Promise<ChatSessionRecord | null> {
  const result =
    await pool.query<ChatSessionRecord>(
      `
        SELECT
          id,
          user_id,
          status,
          created_at,
          updated_at
        FROM chat_sessions
        WHERE
          id = $1
          AND user_id = $2
        LIMIT 1
      `,
      [sessionId, userId]
    );

  return result.rows[0] ?? null;
}

export async function findMessagesBySession(
  sessionId: string
): Promise<ChatMessageRecord[]> {
  const result =
    await pool.query<ChatMessageRecord>(
      `
        SELECT
          id,
          chat_session_id,
          role,
          content,
          created_at
        FROM chat_messages
        WHERE chat_session_id = $1
        ORDER BY created_at ASC
      `,
      [sessionId]
    );

  return result.rows;
}

async function insertChatMessage(
  client: PoolClient,
  input: {
    sessionId: string;
    role: ChatMessageRole;
    content: string;
  }
): Promise<ChatMessageRecord> {
  const result =
    await client.query<ChatMessageRecord>(
      `
        INSERT INTO chat_messages (
          chat_session_id,
          role,
          content
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          chat_session_id,
          role,
          content,
          created_at
      `,
      [
        input.sessionId,
        input.role,
        input.content,
      ]
    );

  return result.rows[0];
}

export async function createChatMessage(
  input: {
    sessionId: string;
    role: ChatMessageRole;
    content: string;
  }
): Promise<ChatMessageRecord> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const message =
      await insertChatMessage(
        client,
        input
      );

    await client.query(
      `
        UPDATE chat_sessions
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [input.sessionId]
    );

    await client.query("COMMIT");

    return message;
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
}