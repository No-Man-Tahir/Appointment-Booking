import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .default(4000),

  DATABASE_URL: z
    .string()
    .min(1),

  CLIENT_ORIGIN: z
    .string()
    .min(1),

  JWT_SECRET: z
    .string()
    .min(32),

  MISTRAL_API_KEY: z
    .string()
    .min(1),

  MISTRAL_MODEL: z
    .string()
    .default("mistral-small-latest"),

  APPOINTMENT_DURATION_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(30),
});

export const env =
  envSchema.parse(process.env);