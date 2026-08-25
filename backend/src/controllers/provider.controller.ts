import type {
  Request,
  Response,
} from "express";

import { getProviders } from "../services/provider.service.js";

export async function listProviders(
  _req: Request,
  res: Response
) {
  const providers = await getProviders();

  res.status(200).json({
    providers,
  });
}