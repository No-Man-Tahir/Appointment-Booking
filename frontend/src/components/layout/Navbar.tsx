"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/hooks/useAuth";

export function Navbar() {
  const router = useRouter();

  const {
    user,
    logout,
  } = useAuth();

  async function handleLogout() {
    await logout();

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/appointments"
          className="font-semibold"
        >
          AI Appointment Booking
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/appointments"
            className="text-sm"
          >
            Appointments
          </Link>

          <Link
            href="/chat"
            className="text-sm"
          >
            Chat
          </Link>

          {user && (
            <span className="text-sm text-gray-500">
              {user.name}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}