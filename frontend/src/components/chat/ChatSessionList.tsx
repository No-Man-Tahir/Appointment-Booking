"use client";

import type {
  ChatSession,
} from "@/types/chat";

type Props = {
  sessions: ChatSession[];
  selectedSessionId:
    | string
    | null;

  loading: boolean;

  onSelect: (
    sessionId: string
  ) => void;

  onNewChat: () => Promise<void>;
};

export function ChatSessionList({
  sessions,
  selectedSessionId,
  loading,
  onSelect,
  onNewChat,
}: Props) {
  return (
    <aside className="hidden w-72 flex-col border-r bg-white md:flex">
      <div className="border-b p-4">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          New conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="p-4 text-sm text-gray-500">
            Loading conversations...
          </p>
        )}

        {!loading &&
          sessions.length === 0 && (
            <p className="p-4 text-sm text-gray-500">
              No previous conversations.
            </p>
          )}

        {sessions.map(
          (session) => {
            const selected =
              session.id ===
              selectedSessionId;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() =>
                  onSelect(
                    session.id
                  )
                }
                className={`w-full border-b px-4 py-3 text-left ${
                  selected
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="text-sm font-medium">
                  Conversation
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(
                    session.updated_at
                  ).toLocaleString()}
                </p>
              </button>
            );
          }
        )}
      </div>
    </aside>
  );
}