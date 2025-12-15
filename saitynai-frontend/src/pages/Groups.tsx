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
  DialogDescription,
  DialogFooter,
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
};

type Group = {
  id: number;
  name: string;
  studyYear: number;
  studyLevel: number; // 0/1/2 iš backend
  mentorId: number;
};

type GroupDto = {
  name: string;
  studyYear: number;
  studyLevel: number; // 0/1/2
  mentorId: number;
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

export default function Groups() {
  const { hasRole } = useAuth();
  const canManage = hasRole("Mentor");

  const [items, setItems] = useState<Group[]>([]);
  const [generalError, setGeneralError] = useState("");

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorsError, setMentorsError] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GroupDto>({
    name: "",
    studyYear: new Date().getFullYear(),
    studyLevel: 0,
    mentorId: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setGeneralError("");
    setLoadingList(true);

    try {
      const res = await api.get<Group[]>("/Group");
      setItems(res.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          setItems([]);
          setGeneralError("No groups found.");
          return;
        }
        if (e.response?.status === 422) {
          const msg =
            (e.response.data as any)?.message ||
            (e.response.data as any)?.title ||
            "Validation error.";
          setGeneralError(msg);
          return;
        }
      }

      setGeneralError(errMsg(e));
    } finally {
      setLoadingList(false);
    }
  }

  async function loadMentors() {
    try {
      const res = await api.get<Mentor[]>("/Mentor");
      setMentors(res.data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setMentors([]);
        return;
      }
      setMentorsError(errMsg(e));
    }
  }

  useEffect(() => {
    load();
    loadMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    if (!canManage) return;
    setGeneralError("");
    setModalError("");
    setEditingId(null);
    setForm({
      name: "",
      studyYear: new Date().getFullYear(),
      studyLevel: 0,
      mentorId: 0,
    });
    setOpen(true);
  }

  function openEdit(g: Group) {
    if (!canManage) return;
    setGeneralError("");
    setModalError("");
    setEditingId(g.id);

    setForm({
      name: g.name ?? "",
      studyYear: Number.isFinite(g.studyYear)
        ? g.studyYear
        : new Date().getFullYear(),
      studyLevel: Number.isFinite(g.studyLevel) ? g.studyLevel : 0,
      mentorId: Number.isFinite((g as any).mentorId) ? (g as any).mentorId : 0, // if TS complains, ensure Group includes mentorId
    });

    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;

    setModalError("");
    setSaving(true);

    try {
      const payload: GroupDto = {
        name: form.name.trim(),
        studyYear: Number.isFinite(form.studyYear)
          ? form.studyYear
          : new Date().getFullYear(),
        studyLevel: form.studyLevel,
        mentorId: Number(form.mentorId),
      };

      if (!payload.name) {
        setModalError("Group name is required.");
        return;
      }

      if (!Number.isFinite(payload.mentorId) || payload.mentorId <= 0) {
        setModalError("Please select a mentor.");
        return;
      }

      // ✅ 0 yra validu, todėl tikrinam ar yra skaičius ir range
      if (
        !Number.isFinite(payload.studyLevel) ||
        payload.studyLevel < 0 ||
        payload.studyLevel > 2
      ) {
        setModalError("Please select study level.");
        return;
      }

      if (editingId) {
        await api.put(`/Group/${editingId}`, payload);
      } else {
        await api.post("/Group", payload);
      }

      setOpen(false);
      await load();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 422) {
          const msg =
            (e.response.data as any)?.message ||
            (e.response.data as any)?.title ||
            "Validation error. Please check the form.";
          setModalError(msg);
          return;
        }
      }

      setModalError("Failed to save group. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!canManage) return;

    setGeneralError("");
    setDeletingId(id);

    try {
      await api.delete(`/Group/${id}`);
      await load();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 422) {
        const msg =
          (e.response.data as any)?.message ||
          (e.response.data as any)?.title ||
          "Validation error.";
        setGeneralError(msg);
      } else {
        setGeneralError(errMsg(e));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Groups</h1>

          {canManage && (
            <Button onClick={openCreate} disabled={saving || loadingList}>
              Create Group
            </Button>
          )}
        </div>

        {generalError && <p className="text-destructive">{generalError}</p>}

        {loadingList ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-2">
            {items.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{g.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Year: {g.studyYear} • Level:{" "}
                    {STUDY_LEVELS.find((x) => x.value === g.studyLevel)
                      ?.label ?? g.studyLevel}
                  </div>
                </div>

                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => openEdit(g)}
                      disabled={saving || deletingId === g.id}
                    >
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={saving || deletingId === g.id}
                        >
                          {deletingId === g.id ? "Deleting..." : "Delete"}
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete group?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletingId === g.id}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(g.id)}
                            disabled={deletingId === g.id}
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
        )}

        {/* CREATE / EDIT */}
        <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Group" : "Create Group"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update group details and save changes."
                  : "Fill in group details and create a new group."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="studyYear">Study year</Label>
                <Input
                  id="studyYear"
                  type="number"
                  value={Number.isFinite(form.studyYear) ? form.studyYear : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({
                      ...form,
                      studyYear: v === "" ? NaN : Number(v),
                    });
                  }}
                  required
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
              <div className="space-y-1">
                <Label>Mentor</Label>
                <Select
                  value={form.mentorId ? String(form.mentorId) : ""}
                  onValueChange={(v) =>
                    setForm({ ...form, mentorId: Number(v) })
                  }
                >
                  <SelectTrigger disabled={mentors.length === 0}>
                    <SelectValue placeholder="Select mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name} {m.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {mentorsError && (
                  <p className="text-sm text-destructive">{mentorsError}</p>
                )}
              </div>

              {modalError && (
                <p className="text-sm text-destructive">{modalError}</p>
              )}

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
