import { pool } from "../db/pool.js";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `
      SELECT *
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findUserById(
  id: string
): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `
      INSERT INTO users (
        name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [
      input.name,
      input.email,
      input.passwordHash,
    ]
  );

  return result.rows[0];
}