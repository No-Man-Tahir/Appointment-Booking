import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { requestContext } from "./middleware/request-context.middleware.js";

import { apiRouter } from "./routes/index.js";

export const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(requestContext);

app.use(requestLogger);

app.use(
  "/api",
  apiRateLimiter,
  apiRouter
);

app.use(notFoundHandler);

app.use(errorHandler);