import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";

import { pool } from "./pool.js";

const migrationsDirectory = path.join(
  __dirname,
  "migrations"
);

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const filename of files) {
      const existing = await client.query(
        `
          SELECT 1
          FROM schema_migrations
          WHERE filename = $1
        `,
        [filename]
      );

      if (existing.rowCount) {
        continue;
      }

      const sql = await fs.readFile(
        path.join(migrationsDirectory, filename),
        "utf8"
      );

      console.log(`Applying migration: ${filename}`);

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `
            INSERT INTO schema_migrations (filename)
            VALUES ($1)
          `,
          [filename]
        );

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations completed");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});