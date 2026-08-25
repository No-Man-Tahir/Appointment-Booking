import { z } from "zod";

export const bookingDraftSchema =
  z.object({
    providerId:
      z.string().uuid().nullable(),

    date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/
      )
      .nullable(),

    time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/
      )
      .nullable(),

    notes: z
      .string()
      .nullable(),

    missingFields: z.array(
      z.enum([
        "provider",
        "date",
        "time",
      ])
    ),
  });

export const aiResponseSchema =
  z.object({
    assistantMessage: z
      .string()
      .trim()
      .min(1),

    booking:
      bookingDraftSchema,
  });

export type AIResponse =
  z.infer<
    typeof aiResponseSchema
  >;

export type BookingDraft =
  z.infer<
    typeof bookingDraftSchema
  >;