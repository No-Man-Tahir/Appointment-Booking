import type {
  NextFunction,
  Request,
  Response,
} from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

type JwtPayload = {
  sub: string;
};

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(
      new AppError(
        401,
        "Authentication required",
        "AUTHENTICATION_REQUIRED"
      )
    );
  }

  try {
    const payload = jwt.verify(
      token,
      env.JWT_SECRET
    ) as JwtPayload;

    req.user = {
      id: payload.sub,
    };

    next();
  } catch {
    next(
      new AppError(
        401,
        "Invalid or expired authentication token",
        "INVALID_TOKEN"
      )
    );
  }
}