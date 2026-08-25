import { pool } from "../db/pool.js";

export async function checkHealth() {
  await pool.query("SELECT 1");

  return {
    status: "ok",
    database: "connected",
  };
}