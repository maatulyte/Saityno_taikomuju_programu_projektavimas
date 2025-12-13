import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import type { Faculty } from "../types";
import axios from "axios";

export default function Faculties() {
  const [items, setItems] = useState<Faculty[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get<Faculty[]>("/Faculty");
        if (mounted) setItems(res.data);
      } catch (err) {
        if (mounted) {
          const msg = axios.isAxiosError(err)
            ? (err.response?.data as any)?.message ||
              (err.response?.data as any)?.title ||
              err.message
            : (err as Error).message;

          setError(msg);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h2>Faculties</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {items.map((f) => (
        <div key={f.id}>
          <Link to={`/faculties/${f.id}`}>{f.name}</Link>
        </div>
      ))}
    </div>
  );
}
