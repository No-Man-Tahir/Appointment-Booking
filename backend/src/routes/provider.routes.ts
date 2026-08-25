import { Router } from "express";

import { listProviderBookedSlots, listProviders } from "../controllers/provider.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { providerBookedSlotsQuerySchema, providerParamsSchema } from "../schemas/provider.schema.js";
import { validate } from "../middleware/validate.middleware.js";

export const providerRouter = Router();

providerRouter.get(
  "/",
  requireAuth,
  asyncHandler(listProviders)
);

providerRouter.get(
  "/:id/booked-slots",

  validate({
    params:
        providerParamsSchema,

    query:
      providerBookedSlotsQuerySchema,
  }),

  asyncHandler(
        listProviderBookedSlots
  )
);