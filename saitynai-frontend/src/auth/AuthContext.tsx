import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/axios";
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from "../storage/tokenStorage";
import type { LoginDto, RegisterDto } from "../types";

interface AuthContextValue {
  isAuthed: boolean;
  login(dto: LoginDto): Promise<void>;
  register(dto: RegisterDto): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() =>
    Boolean(getAccessToken())
  );

  async function login(dto: LoginDto) {
    // 1) sets refresh cookie
    await api.post("/User/login", dto);

    // 2) uses refresh cookie to get access token
    const res = await api.post<string>("/User/accessToken");

    // IMPORTANT: res.data must be the token string. If backend returns { token: "..." } adjust below.
    saveAccessToken((res.data as any).accessToken);

    setIsAuthed(true);
  }

  async function register(dto: RegisterDto) {
    await api.post("/User/register", dto);
    await login({ username: dto.username, password: dto.password });
  }

  async function logout() {
    try {
      await api.post("/User/logout");
    } finally {
      removeAccessToken();
      setIsAuthed(false);
    }
  }

  const value = useMemo(
    () => ({ isAuthed, login, register, logout }),
    [isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
