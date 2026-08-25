import type {
  Request,
  Response,
} from "express";

import { checkHealth } from "../services/health.service.js";

export async function getHealth(
  _req: Request,
  res: Response
) {
  const health = await checkHealth();

  res.status(200).json(health);
}