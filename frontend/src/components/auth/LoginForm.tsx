"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(
        email,
        password
      );

      router.push("/appointments");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting
          ? "Signing in..."
          : "Sign in"}
      </button>

      <p className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}