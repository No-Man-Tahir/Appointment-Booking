import { Router } from "express";

import {
  createMessage,
  createSession,
  getSession,
  listMessages,
  listSessions,
} from "../controllers/chat.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  validate,
} from "../middleware/validate.middleware.js";

import {
  chatSessionParamsSchema,
  createChatMessageSchema,
} from "../schemas/chat.schema.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);


chatRouter.post(
  "/sessions",
  asyncHandler(createSession)
);


chatRouter.get(
  "/sessions",
  asyncHandler(listSessions)
);


chatRouter.get(
  "/sessions/:id",
  validate({
    params:
      chatSessionParamsSchema,
  }),
  asyncHandler(getSession)
);


chatRouter.get(
  "/sessions/:id/messages",
  validate({
    params:
      chatSessionParamsSchema,
  }),
  asyncHandler(listMessages)
);


chatRouter.post(
  "/sessions/:id/messages",
  validate({
    params:
      chatSessionParamsSchema,

    body:
      createChatMessageSchema,
  }),
  asyncHandler(createMessage)
);