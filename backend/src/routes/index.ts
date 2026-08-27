import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { appointmentRouter } from "./appointment.routes.js";
import { chatRouter } from "./chat.routes.js";
import { providerRouter } from "./provider.routes.js";

export const apiRouter = Router();

apiRouter.use(
  "/auth",
  authRouter
);

apiRouter.use(
  "/appointments",
  appointmentRouter
);

apiRouter.use(
  "/chat",
  chatRouter
);

apiRouter.use(
  "/providers",
  providerRouter
);

apiRouter.get(
  "/health",
  (_req, res) => {
    res.status(200).json({
      status: "ok",
    });
  }
);