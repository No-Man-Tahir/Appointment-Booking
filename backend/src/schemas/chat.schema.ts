import { z } from "zod";

export const chatSessionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createChatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
});