import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repository/user.repository.js";
import { AppError } from "../utils/AppError.js";

type PublicUser = {
  id: string;
  name: string;
  email: string;
};

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function createAccessToken(userId: string) {
  return jwt.sign(
    { sub: userId },
    env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(
      409,
      "An account with this email already exists",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    12
  );

  const user = await createUser({
    name: input.name.trim(),
    email,
    passwordHash,
  });

  return {
    user: toPublicUser(user),
    token: createAccessToken(user.id),
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  const user = await findUserByEmail(
    input.email.trim().toLowerCase()
  );

  if (!user) {
    throw new AppError(
      401,
      "Invalid email or password",
      "INVALID_CREDENTIALS"
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "Invalid email or password",
      "INVALID_CREDENTIALS"
    );
  }

  return {
    user: toPublicUser(user),
    token: createAccessToken(user.id),
  };
}

export async function getCurrentUser(
  userId: string
) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(
      404,
      "User not found",
      "USER_NOT_FOUND"
    );
  }

  return toPublicUser(user);
}