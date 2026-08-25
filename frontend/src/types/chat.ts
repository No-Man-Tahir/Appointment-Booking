export type ChatSessionStatus =
  | "active"
  | "closed";

export type ChatSession = {
  id: string;
  user_id: string;
  status: ChatSessionStatus;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRole =
  | "user"
  | "assistant"
  | "system";

export type ChatMessage = {
  id: string;
  chat_session_id: string;
  role: ChatMessageRole;
  content: string;
  created_at: string;
};