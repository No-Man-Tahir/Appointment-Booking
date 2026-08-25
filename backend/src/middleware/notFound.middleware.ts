import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../utils/AppError.js";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  next(
    new AppError(
      404,
      `Route ${req.method} ${req.originalUrl} not found`,
      "ROUTE_NOT_FOUND"
    )
  );
}