import { z } from "zod";

export const createAppointmentSchema = z.object({
  providerId: z.string().uuid(),

  scheduledAt: z.string().datetime(),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});

export const appointmentParamsSchema = z.object({
  id: z.string().uuid(),
});