"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createChatSession,
  getChatMessages,
  getChatSessions,
  sendChatMessage,
} from "@/lib/api/chat";

import type {
  ChatMessage,
  ChatSession,
} from "@/types/chat";

import {
  ChatInput,
} from "./ChatInput";

import {
  ChatMessageList,
} from "./ChatMessageList";

import {
  ChatSessionList,
} from "./ChatSessionList";


export function ChatInterface() {
  const [
    sessions,
    setSessions,
  ] = useState<
    ChatSession[]
  >([]);

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] = useState<
    string | null
  >(null);

  const [
    messages,
    setMessages,
  ] = useState<
    ChatMessage[]
  >([]);

  const [
    loadingSessions,
    setLoadingSessions,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [
    sendingMessage,
    setSendingMessage,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const loadSessions =
    useCallback(
      async () => {
        setError("");

        try {
          const response =
            await getChatSessions();

          setSessions(
            response.sessions
          );

          return response.sessions;
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load conversations"
          );

          return [];
        } finally {
          setLoadingSessions(
            false
          );
        }
      },
      []
    );


  const loadMessages =
    useCallback(
      async (
        sessionId: string
      ) => {
        setLoadingMessages(
          true
        );

        setError("");

        try {
          const response =
            await getChatMessages(
              sessionId
            );

          setMessages(
            response.messages
          );
        } catch (error) {
          setMessages([]);

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load messages"
          );
        } finally {
          setLoadingMessages(
            false
          );
        }
      },
      []
    );


  useEffect(() => {
    async function initialize() {
      const existingSessions =
        await loadSessions();

      if (
        existingSessions.length >
        0
      ) {
        const mostRecent =
          existingSessions[0];

        setSelectedSessionId(
          mostRecent.id
        );

        await loadMessages(
          mostRecent.id
        );
      }
    }

    initialize();
  }, [
    loadSessions,
    loadMessages,
  ]);


  async function handleNewChat() {
    setError("");

    try {
      const response =
        await createChatSession();

      setSessions(
        (current) => [
          response.session,
          ...current,
        ]
      );

      setSelectedSessionId(
        response.session.id
      );

      setMessages([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to start conversation"
      );
    }
  }


  async function handleSelectSession(
    sessionId: string
  ) {
    if (
      sessionId ===
      selectedSessionId
    ) {
      return;
    }

    setSelectedSessionId(
      sessionId
    );

    await loadMessages(
      sessionId
    );
  }


  async function handleSendMessage(
    content: string
  ) {
    setError("");
    setSendingMessage(true);

    let sessionId =
      selectedSessionId;

    try {
      if (!sessionId) {
        const sessionResponse =
          await createChatSession();

        sessionId =
          sessionResponse
            .session.id;

        setSelectedSessionId(
          sessionId
        );

        setSessions(
          (current) => [
            sessionResponse.session,
            ...current,
          ]
        );
      }

      const response =
        await sendChatMessage(
          sessionId,
          content
        );

      setMessages(
        (current) => [
          ...current,

          response.userMessage,

          response.assistantMessage,
        ]
      );

      await loadSessions();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setSendingMessage(false);
    }
  }


  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden border-t">
      <ChatSessionList
        sessions={
          sessions
        }

        selectedSessionId={
          selectedSessionId
        }

        loading={
          loadingSessions
        }

        onSelect={
          handleSelectSession
        }

        onNewChat={
          handleNewChat
        }
      />

      <section className="flex min-w-0 flex-1 flex-col bg-gray-50">
        <div className="border-b bg-white px-5 py-4">
          <h1 className="font-semibold">
            Appointment Assistant
          </h1>

          <p className="text-xs text-gray-500">
            Tell me who and when
            you&apos;d like to
            book.
          </p>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <ChatMessageList
          messages={
            messages
          }

          loading={
            loadingMessages
          }
        />

        {sendingMessage && (
          <div className="px-5 pb-2 text-sm text-gray-400">
            Assistant is
            thinking...
          </div>
        )}

        <ChatInput
          disabled={
            loadingMessages ||
            sendingMessage
          }

          onSend={
            handleSendMessage
          }
        />
      </section>
    </div>
  );
}