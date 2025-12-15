import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Field from "../components/Field";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await register({ name, surname, username, email, password });
      nav("/");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
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
      <button className="border rounded px-3 py-2">Register</button>
    </form>
  );
}
