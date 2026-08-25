import { Router } from "express";

import {
  cancel,
  create,
  getById,
  list,
} from "../controllers/appointment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  appointmentParamsSchema,
  createAppointmentSchema,
} from "../schemas/appointment.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth);

appointmentRouter.get(
  "/",
  asyncHandler(list)
);

appointmentRouter.get(
  "/:id",
  validate({
    params: appointmentParamsSchema,
  }),
  asyncHandler(getById)
);

appointmentRouter.post(
  "/",
  validate({
    body: createAppointmentSchema,
  }),
  asyncHandler(create)
);

appointmentRouter.patch(
  "/:id/cancel",
  validate({
    params: appointmentParamsSchema,
  }),
  asyncHandler(cancel)
);