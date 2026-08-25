import type {
  Request,
  Response,
} from "express";

import {
  getChatMessages,
  getUserChatSession,
  getUserChatSessions,
  sendChatMessage,
  startChatSession,
} from "../services/chat.service.js";

export async function createSession(
  req: Request,
  res: Response
) {
  const session =
    await startChatSession(
      req.user!.id
    );

  res.status(201).json({
    session,
  });
}

export async function listSessions(
  req: Request,
  res: Response
) {
  const sessions =
    await getUserChatSessions(
      req.user!.id
    );

  res.status(200).json({
    sessions,
  });
}

export async function getSession(
  req: Request<{ id: string }>,
  res: Response
) {
  const session =
    await getUserChatSession(
      req.user!.id,
      req.params.id
    );

  res.status(200).json({
    session,
  });
}

export async function listMessages(
  req: Request<{ id: string }>,
  res: Response
) {
  const messages =
    await getChatMessages(
      req.user!.id,
      req.params.id
    );

  res.status(200).json({
    messages,
  });
}

export async function createMessage(
  req: Request<{ id: string }>,
  res: Response
) {
  const message =
    await sendChatMessage({
      userId: req.user!.id,
      sessionId: req.params.id,
      content: req.body.content,
    });

  res.status(201).json({
    message,
  });
}