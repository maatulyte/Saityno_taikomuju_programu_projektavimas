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
  return e.message || "Request failed.";
}

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [_, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // small client-side checks (still rely on backend as source of truth)
    if (!name.trim() || !surname.trim() || !username.trim() || !password) {
      setError("Please fill in name, surname, username and password.");
      return;
    }

    setSaving(true);
    try {
      await register({
        name: name.trim(),
        surname: surname.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      nav("/");
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Navbar />
      <form onSubmit={submit} className="p-4 space-y-3">
        <h1 className="text-2xl font-semibold">Register</h1>

        <Field
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <Field
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Field
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-destructive">{error}</p>}
        <Button className="border rounded px-3 py-2">Register</Button>
      </form>
    </div>
  );
}
