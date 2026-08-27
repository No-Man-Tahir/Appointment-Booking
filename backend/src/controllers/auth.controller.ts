import type {
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";

const COOKIE_NAME = "access_token";

const authCookieOptions = {
  httpOnly: true,

  secure:
    env.NODE_ENV ===
    "production",

  sameSite:
    "lax" as const,

  path: "/",

  maxAge:
    60 * 60 * 1000,
};

export async function register(
  req: Request,
  res: Response
) {
  const result = await registerUser(req.body);

  res
    .cookie(
      COOKIE_NAME,
      result.token,
      authCookieOptions   
    )
    .status(201)
    .json({
      user: result.user,
    });
}

export async function login(
  req: Request,
  res: Response
) {
  const result = await loginUser(req.body);

  res
    .cookie(
      COOKIE_NAME,
      result.token,
      authCookieOptions
    )
    .status(200)
    .json({
      user: result.user,
    });
}

export async function logout(
  _req: Request,
  res: Response
) {
  res.clearCookie(
  "access_token",
  {
    httpOnly: true,

    secure:
      env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path: "/",
  }
);

  res.status(204).send();
}

export async function me(
  req: Request,
  res: Response
) {
  const user = await getCurrentUser(
    req.user!.id
  );

  res.status(200).json({
    user,
  });
}