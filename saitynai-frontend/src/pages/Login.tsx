import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Field from "../components/Field";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import axios from "axios";

function apiErrorMessage(e: unknown) {
  if (!axios.isAxiosError(e)) return (e as Error)?.message ?? "Unknown error.";

  const data = e.response?.data as any;

  // Plain string from backend
  if (typeof data === "string") return data;

  // Common ASP.NET shapes
  const msg = data?.message || data?.title;
  if (msg) return msg;

  // ASP.NET ValidationProblemDetails: { errors: { Field: ["..."] } }
  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    const all = Object.entries(errors)
      .flatMap(([field, arr]) =>
        Array.isArray(arr) ? arr.map((m) => `${field}: ${m}`) : []
      )
      .filter(Boolean);

    if (all.length) return all.join("\n");
  }

  // Fallback
  return e.message || "Login failed.";
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const u = username.trim();
    if (!u || !password) {
      setError("Please enter username and password.");
      return;
    }

    setSaving(true);
    try {
      await login({ username: u, password });
      nav("/");
    } catch (e) {
      // Make common auth errors friendlier
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        if (status === 401 || status === 403) {
          setError("Invalid username or password.");
          return;
        }
      }
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <form onSubmit={submit} className="p-6 space-y-3 max-w-md">
        <h1 className="text-2xl font-semibold">Login</h1>

        <Field
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-line">
            {error}
          </div>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
