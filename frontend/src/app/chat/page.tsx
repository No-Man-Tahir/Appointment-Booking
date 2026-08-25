import {
  RequireAuth,
} from "@/components/auth/RequireAuth";

import {
  ChatInterface,
} from "@/components/chat/ChatInterface";

import {
  Navbar,
} from "@/components/layout/Navbar";

export default function ChatPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <ChatInterface />
      </div>
    </RequireAuth>
  );
}