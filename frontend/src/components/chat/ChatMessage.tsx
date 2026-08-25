import type {
  ChatMessage as ChatMessageType,
} from "@/types/chat";

type Props = {
  message: ChatMessageType;
};

export function ChatMessage({
  message,
}: Props) {
  const isUser =
    message.role === "user";

  const isSystem =
    message.role === "system";

  if (isSystem) {
    return (
      <div className="my-3 text-center text-xs text-gray-400">
        {message.content}
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-black text-white"
            : "border bg-white text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap">
          {message.content}
        </p>

        <p
          className={`mt-1 text-[10px] ${
            isUser
              ? "text-gray-300"
              : "text-gray-400"
          }`}
        >
          {new Date(
            message.created_at
          ).toLocaleTimeString(
            undefined,
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </p>
      </div>
    </div>
  );
}