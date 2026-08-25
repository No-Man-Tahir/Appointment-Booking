"use client";

import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/lib/api/auth";

import type { User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getMe()
      .then((response) => {
        setUser(response.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const response =
      await loginRequest({
        email,
        password,
      });

    setUser(response.user);
  }

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    const response =
      await registerRequest({
        name,
        email,
        password,
      });

    setUser(response.user);
  }

  async function logout() {
    await logoutRequest();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}