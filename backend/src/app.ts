import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { apiRouter } from "./routes/index.js";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { appointmentRouter } from "./routes/appointment.routes.js";

export const app = express();


app.use(helmet());


app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);


app.use(express.json());


app.use(requestLogger);

app.use(cookieParser());

app.use(
  "/api",
  apiRateLimiter,
  apiRouter
);

apiRouter.use(
  "/auth",
  authRouter
);

apiRouter.use(
  "/appointments",
  appointmentRouter
);


app.use(notFoundHandler);


app.use(errorHandler);