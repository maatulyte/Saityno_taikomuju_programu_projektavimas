import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Mentor = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  facultyId: number;
  studyProgram: string;
  studyYear: number;
  studyLevel: number; // enum
};

type MentorDto = {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  facultyId: number;
  studyProgram: string;
  studyYear: number;
  studyLevel: number; // enum
};

const STUDY_LEVELS = [
  { value: 0, label: "Bachelor" },
  { value: 1, label: "Master" },
  { value: 2, label: "PhD" },
] as const;

function errMsg(e: unknown) {
  return axios.isAxiosError(e)
    ? (e.response?.data as any)?.message ||
        (e.response?.data as any)?.title ||
        e.message
    : (e as Error).message;
}

export default function Mentors() {
  const { hasRole } = useAuth();
  const canManage = hasRole("Coordinator");

  const [items, setItems] = useState<Mentor[]>([]);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<MentorDto>({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    facultyId: 0,
    studyProgram: "",
    studyYear: new Date().getFullYear(),
    studyLevel: 0,
  });

  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setGeneralError("");
    try {
      const res = await api.get<Mentor[]>("/Mentor");
      setItems(res.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          setItems([]);
          setGeneralError("No mentors found.");
          return;
        }
      }
      setGeneralError(errMsg(e));
    }
  }

  useEffect(() => {
    load().catch((e) => setError(errMsg(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    if (!canManage) return;
    setError("");
    setEditingId(null);
    setForm({
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      facultyId: 0,
      studyProgram: "",
      studyYear: new Date().getFullYear(),
      studyLevel: 0,
    });
    setOpen(true);
  }

  function openEdit(m: Mentor) {
    if (!canManage) return;
    setError("");
    setEditingId(m.id);
    setForm({
      name: m.name ?? "",
      surname: m.surname ?? "",
      email: m.email ?? "",
      phoneNumber: m.phoneNumber ?? "",
      facultyId: Number.isFinite(m.facultyId) ? m.facultyId : 0,
      studyProgram: m.studyProgram ?? "",
      studyYear: Number.isFinite(m.studyYear)
        ? m.studyYear
        : new Date().getFullYear(),
      studyLevel: Number.isFinite(m.studyLevel) ? m.studyLevel : 0,
    });
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;

    setError("");
    setSaving(true);

    try {
      const name = form.name.trim();
      const surname = form.surname.trim();
      const email = form.email.trim();
      const phoneNumber = form.phoneNumber.trim();
      const facultyId = Number(form.facultyId);
      const studyProgram = form.studyProgram.trim();
      const studyYear = Number(form.studyYear);
      const studyLevel = Number(form.studyLevel);

      if (!name || !surname || !email) {
        setError("Name, surname and email are required.");
        return;
      }

      if (!Number.isFinite(facultyId) || facultyId <= 0) {
        setError("FacultyId must be > 0.");
        return;
      }

      if (!studyProgram) {
        setError("Study program is required.");
        return;
      }

      if (!Number.isFinite(studyYear) || studyYear <= 0) {
        setError("Study year must be valid.");
        return;
      }

      if (!Number.isFinite(studyLevel) || studyLevel < 0 || studyLevel > 2) {
        setError("Study level must be selected.");
        return;
      }

      const body = {
        name,
        surname,
        email,
        phoneNumber,
        facultyId,
        studyProgram,
        studyYear,
        studyLevel,
      };

      if (editingId) {
        await api.put(`/Mentor/${editingId}`, body);
      } else {
        await api.post("/Mentor", body);
      }

      setOpen(false);
      await load();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 422) {
          // backend dažnai grąžina string arba { message }
          const msg =
            (e.response.data as any)?.message ||
            (e.response.data as any)?.title ||
            "Validation error. Please check the form.";

          setGeneralError(msg);
          return;
        }
      }

      setGeneralError("Unexpected error occurred. Please try again later.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!canManage) return;
    setError("");
    setDeletingId(id);
    try {
      await api.delete(`/Mentor/${id}`);

      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Mentors</h1>
          {canManage && <Button onClick={openCreate}>Create Mentor</Button>}
        </div>

        {generalError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {generalError}
          </div>
        )}

        <div className="space-y-2">
          {items.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {m.name} {m.surname}
                </div>
                <div className="text-sm text-muted-foreground">{m.email}</div>
              </div>

              {canManage && (
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => openEdit(m)}>
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={deletingId === m.id}
                      >
                        {deletingId === m.id ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete mentor?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId === m.id}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => remove(m.id)}
                          disabled={deletingId === m.id}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CREATE / EDIT */}
        <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Mentor" : "Create Mentor"}
              </DialogTitle>
              <DialogDescription>
                Fill mentor details and save.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Surname</Label>
                  <Input
                    value={form.surname}
                    onChange={(e) =>
                      setForm({ ...form, surname: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone number</Label>
                  <Input
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Faculty ID</Label>
                  <Input
                    type="number"
                    value={form.facultyId || ""}
                    onChange={(e) =>
                      setForm({ ...form, facultyId: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>Study year</Label>
                  <Input
                    type="number"
                    value={form.studyYear}
                    onChange={(e) =>
                      setForm({ ...form, studyYear: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Study program</Label>
                  <Input
                    value={form.studyProgram}
                    onChange={(e) =>
                      setForm({ ...form, studyProgram: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>Study level</Label>
                  <Select
                    value={String(form.studyLevel)}
                    onValueChange={(v) =>
                      setForm({ ...form, studyLevel: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select study level" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_LEVELS.map((lvl) => (
                        <SelectItem key={lvl.value} value={String(lvl.value)}>
                          {lvl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
