import {
  createChatMessage,
  createChatSession,
  findChatSessionByIdAndUser,
  findChatSessionsByUser,
  findMessagesBySession,
} from "../repository/chat.repository";

import { AppError } from "../utils/AppError.js";

export async function startChatSession(
  userId: string
) {
  return createChatSession(userId);
}

export async function getUserChatSessions(
  userId: string
) {
  return findChatSessionsByUser(
    userId
  );
}

export async function getUserChatSession(
  userId: string,
  sessionId: string
) {
  const session =
    await findChatSessionByIdAndUser(
      sessionId,
      userId
    );

  if (!session) {
    throw new AppError(
      404,
      "Chat session not found",
      "CHAT_SESSION_NOT_FOUND"
    );
  }

  return session;
}

export async function getChatMessages(
  userId: string,
  sessionId: string
) {
  const session =
    await findChatSessionByIdAndUser(
      sessionId,
      userId
    );

  if (!session) {
    throw new AppError(
      404,
      "Chat session not found",
      "CHAT_SESSION_NOT_FOUND"
    );
  }

  return findMessagesBySession(
    session.id
  );
}

export async function sendChatMessage(
  input: {
    userId: string;
    sessionId: string;
    content: string;
  }
) {
  const session =
    await findChatSessionByIdAndUser(
      input.sessionId,
      input.userId
    );

  if (!session) {
    throw new AppError(
      404,
      "Chat session not found",
      "CHAT_SESSION_NOT_FOUND"
    );
  }

  if (session.status !== "active") {
    throw new AppError(
      409,
      "Chat session is closed",
      "CHAT_SESSION_CLOSED"
    );
  }

  return createChatMessage({
    sessionId: session.id,
    role: "user",
    content: input.content,
  });
}