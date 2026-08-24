import "dotenv/config";
import express from "express";

import { pool } from "./db/pool.js";

const app = express();

const port = Number(process.env.PORT) || 4000;

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});