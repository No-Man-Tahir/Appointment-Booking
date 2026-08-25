import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum([
      "development",
      "test",
      "production",
    ])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),

  DATABASE_URL: z
    .string()
    .min(1),

  CLIENT_ORIGIN: z
    .string()
    .url(),

  JWT_SECRET: z
    .string()
    .min(32),

  MISTRAL_API_KEY: z
    .string()
    .min(1),

  MISTRAL_MODEL: z
    .string()
    .default(
      "mistral-small-latest"
    ),
    APPOINTMENT_DURATION_MINUTES: z.coerce
  .number()
  .int()
  .positive()
  .default(30),
});

const parsedEnv =
  envSchema.safeParse(
    process.env
  );

if (!parsedEnv.success) {
  console.error(
    "Invalid environment configuration:",
    parsedEnv.error.flatten()
      .fieldErrors
  );

  process.exit(1);
}

export const env =
  parsedEnv.data;