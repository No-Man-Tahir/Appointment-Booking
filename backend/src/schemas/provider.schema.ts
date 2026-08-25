import {
  z,
} from "zod";


export const providerParamsSchema =
  z.object({
    id: z.string().uuid(),
  });


export const providerBookedSlotsQuerySchema =
  z.object({
    date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Date must use YYYY-MM-DD"
      ),

    timezone: z
      .string()
      .trim()
      .min(1)
      .max(100),
  });