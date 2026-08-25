import type {
  AuthResponse,
} from "@/types/auth";

import { apiFetch } from "./client";

export function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function login(input: {
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function logout() {
  return apiFetch<void>(
    "/api/auth/logout",
    {
      method: "POST",
    }
  );
}

export function getMe() {
  return apiFetch<AuthResponse>(
    "/api/auth/me"
  );
}