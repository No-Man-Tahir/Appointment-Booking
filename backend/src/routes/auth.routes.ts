import { Router } from "express";

import {
  login,
  logout,
  me,
  register,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
} from "../schemas/auth.schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate({
    body: registerSchema,
  }),
  asyncHandler(register)
);

authRouter.post(
  "/login",
  validate({
    body: loginSchema,
  }),
  asyncHandler(login)
);

authRouter.post(
  "/logout",
  asyncHandler(logout)
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(me)
);