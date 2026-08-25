"use client";

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

type Props = {
  disabled?: boolean;

  onSend: (
    content: string
  ) => Promise<void>;
};

export function ChatInput({
  disabled = false,
  onSend,
}: Props) {
  const [content, setContent] =
    useState("");

  const [sending, setSending] =
    useState(false);

  async function submitMessage() {
    const trimmed =
      content.trim();

    if (
      !trimmed ||
      sending ||
      disabled
    ) {
      return;
    }

    setSending(true);

    try {
      await onSend(trimmed);

      setContent("");
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await submitMessage();
  }

  async function handleKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      await submitMessage();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-white p-4"
    >
      <div className="flex items-end gap-3">
        <textarea
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={
            disabled || sending
          }
          rows={2}
          maxLength={4000}
          placeholder="Type your message..."
          className="min-h-[48px] flex-1 resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
        />

        <button
          type="submit"
          disabled={
            disabled ||
            sending ||
            !content.trim()
          }
          className="rounded-xl bg-black px-5 py-3 text-sm text-white disabled:opacity-40"
        >
          {sending
            ? "Sending..."
            : "Send"}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}