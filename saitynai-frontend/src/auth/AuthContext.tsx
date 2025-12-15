import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/axios";
import {
  saveAccessToken,
  removeAccessToken,
  getAccessToken,
} from "../storage/tokenStorage";
import type { RegisterDto } from "@/types";
import { useNavigate } from "react-router-dom";

type MeDto = {
  id: string;
  userName: string;
  email?: string | null;
  roles: string[];
};

type AuthContextValue = {
  isAuthed: boolean;
  loading: boolean; // ✅ add
  me: MeDto | null;
  roles: string[];
  hasRole: (...roles: string[]) => boolean;
  login: (dto: { username: string; password: string }) => Promise<void>;
  register(dto: RegisterDto): Promise<void>;
  logout(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [isAuthed, setIsAuthed] = useState(false);
  const [me, setMe] = useState<MeDto | null>(null);

  const hasRole = (...need: string[]) => need.some((r) => roles.includes(r));

  async function loadMe() {
    try {
      // if you store access token locally, ensure api interceptor attaches it
      // otherwise refresh it first:
      if (!getAccessToken()) {
        const at = await api.post<{ accessToken: string }>("/User/accessToken");
        saveAccessToken(at.data.accessToken ?? (at.data as any));
      }

      const me = await api.get<MeDto>("/User/me");
      setRoles(me.data.roles ?? []);
      setMe(me.data);
      setIsAuthed(true);
    } catch {
      setRoles([]);
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function login(dto: { username: string; password: string }) {
    await api.post("/User/login", dto);
    const at = await api.post<{ accessToken: string }>("/User/accessToken");
    saveAccessToken(at.data.accessToken ?? (at.data as any));
    await loadMe();
  }

  async function logout() {
    await api.post("/User/logout");
    removeAccessToken();
    setRoles([]);
    setIsAuthed(false);
    window.location.assign("/");
  }

  async function register(dto: RegisterDto) {
    await api.post("/User/register", dto);
    await login({ username: dto.username, password: dto.password });
  }

  const value = useMemo(
    () => ({ isAuthed, loading, me, roles, hasRole, login, register, logout }),
    [isAuthed, loading, roles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
