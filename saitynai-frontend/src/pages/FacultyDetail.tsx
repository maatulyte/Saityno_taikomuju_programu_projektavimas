import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import type { Faculty, Group } from "../types";
import axios from "axios";

export default function FacultyDetail() {
  const { id } = useParams<{ id: string }>();
  const facultyId = Number(id);

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!Number.isFinite(facultyId)) return;

    let mounted = true;

    (async () => {
      try {
        const [facultyRes, groupsRes] = await Promise.all([
          api.get<Faculty>(`/Faculty/${facultyId}`),
          api.get<Group[]>(`/Faculty/${facultyId}/mentors/groups`),
        ]);

        if (!mounted) return;

        setFaculty(facultyRes.data);
        setGroups(groupsRes.data);
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
  }, [facultyId]);

  return (
    <div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h2>{faculty?.name}</h2>
      <h3>Groups</h3>
      {groups.map((g) => (
        <div key={g.id}>{g.name}</div>
      ))}
    </div>
  );
}
