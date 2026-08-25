import type {
  ChatMessage,
  ChatSession,
} from "@/types/chat";

import {
  apiFetch,
} from "./client";

export function createChatSession() {
  return apiFetch<{
    session: ChatSession;
  }>(
    "/api/chat/sessions",
    {
      method: "POST",
    }
  );
}

export function getChatSessions() {
  return apiFetch<{
    sessions: ChatSession[];
  }>(
    "/api/chat/sessions"
  );
}

export function getChatSession(
  sessionId: string
) {
  return apiFetch<{
    session: ChatSession;
  }>(
    `/api/chat/sessions/${sessionId}`
  );
}

export function getChatMessages(
  sessionId: string
) {
  return apiFetch<{
    messages: ChatMessage[];
  }>(
    `/api/chat/sessions/${sessionId}/messages`
  );
}

export function sendChatMessage(
  sessionId: string,
  content: string
) {
  return apiFetch<{
    message: ChatMessage;
  }>(
    `/api/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }
  );
}