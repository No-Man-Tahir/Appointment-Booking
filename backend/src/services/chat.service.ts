import {
  createChatMessage,
  createChatSession,
  findChatSessionByIdAndUser,
  findChatSessionsByUser,
  findMessagesBySession,
} from "../repository/chat.repository";

import {
  findProviders,
} from "../repository/provider.repository";

import {
  generateAIResponse,
} from "./ai.service.js";

import {
  AppError,
} from "../utils/AppError.js";


export async function startChatSession(
  userId: string
) {
  return createChatSession(
    userId
  );
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

  if (
    session.status !== "active"
  ) {
    throw new AppError(
      409,
      "Chat session is closed",
      "CHAT_SESSION_CLOSED"
    );
  }

  const userMessage =
    await createChatMessage({
      sessionId:
        session.id,

      role: "user",

      content:
        input.content,
    });


  const conversationHistory =
    await findMessagesBySession(
      session.id
    );


  const providers =
    await findProviders();


  const aiResponse =
    await generateAIResponse({
      messages:
        conversationHistory,

      providers,
    });


  let providerId =
    aiResponse.booking.providerId;


  if (providerId) {
    const providerExists =
      providers.some(
        (provider) =>
          provider.id ===
          providerId
      );

    if (!providerExists) {
      providerId = null;

      if (
        !aiResponse.booking
          .missingFields.includes(
            "provider"
          )
      ) {
        aiResponse.booking
          .missingFields.push(
            "provider"
          );
      }
    }
  }


  const assistantMessage =
    await createChatMessage({
      sessionId:
        session.id,

      role: "assistant",

      content:
        aiResponse.assistantMessage,
    });


  return {
    userMessage,

    assistantMessage,

    booking: {
      ...aiResponse.booking,
      providerId,
    },
  };
}