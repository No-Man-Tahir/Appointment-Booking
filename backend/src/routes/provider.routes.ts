import { Router } from "express";

import { listProviders } from "../controllers/provider.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const providerRouter = Router();

providerRouter.get(
  "/",
  requireAuth,
  asyncHandler(listProviders)
);