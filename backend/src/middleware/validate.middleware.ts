import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { ZodType } from "zod";

import { AppError } from "../utils/AppError.js";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: RequestSchemas) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);

      if (!result.success) {
        return next(
          new AppError(
            400,
            "Invalid request body",
            "VALIDATION_ERROR"
          )
        );
      }

      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);

      if (!result.success) {
        return next(
          new AppError(
            400,
            "Invalid route parameters",
            "VALIDATION_ERROR"
          )
        );
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);

      if (!result.success) {
        return next(
          new AppError(
            400,
            "Invalid query parameters",
            "VALIDATION_ERROR"
          )
        );
      }
    }

    next();
  };
}