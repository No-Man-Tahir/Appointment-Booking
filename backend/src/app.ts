import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { apiRouter } from "./routes/index.js";
import { env } from "./config/env.js";

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


app.use(
  "/api",
  apiRateLimiter,
  apiRouter
);


app.use(notFoundHandler);


app.use(errorHandler);