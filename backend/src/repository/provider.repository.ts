import { pool } from "../db/pool.js";

export type ProviderRecord = {
  id: string;
  name: string;
  specialty: string | null;
};

export async function findProviders() {
  const result = await pool.query<ProviderRecord>(
    `
      SELECT
        id,
        name,
        specialty
      FROM providers
      ORDER BY name
    `
  );

  return result.rows;
}

export async function findProviderById(
  id: string
) {
  const result = await pool.query<ProviderRecord>(
    `
      SELECT
        id,
        name,
        specialty
      FROM providers
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}