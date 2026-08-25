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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/appointments"
          className="font-semibold"
        >
          AI Appointment Booking
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/chat"
            className="text-sm text-gray-700 hover:text-black"
          >
            Chat
          </Link>

          <Link
            href="/appointments"
            className="text-sm text-gray-700 hover:text-black"
          >
            Appointments
          </Link>

          {user && (
            <span className="hidden text-sm text-gray-500 sm:inline">
              {user.name}
            </span>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}