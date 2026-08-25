"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  ChatMessage as ChatMessageType,
} from "@/types/chat";

import {
  ChatMessage,
} from "./ChatMessage";

type Props = {
  messages: ChatMessageType[];
  loading: boolean;
};

export function ChatMessageList({
  messages,
  loading,
}: Props) {
  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
        Loading conversation...
      </div>
    );
  }

  if (messages.length === 0) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 text-center">
      <div>
        <h2 className="font-medium">
          Start a conversation
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Tell me who you would
          like to book with and
          when.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-5">
      {messages.map(
        (message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        )
      )}

      <div ref={bottomRef} />
    </div>
  );
}