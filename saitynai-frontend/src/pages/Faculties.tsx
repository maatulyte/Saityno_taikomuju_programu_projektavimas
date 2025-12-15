import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/axios";
import type { Faculty } from "../types";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/auth/AuthContext";

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

type FacultyListItem = Faculty & {
  address?: string | null; // in case list endpoint includes it
};

type FacultyDto = {
  name: string;
  address: string;
};

function errMsg(e: unknown) {
  return axios.isAxiosError(e)
    ? (e.response?.data as any)?.message ||
        (e.response?.data as any)?.title ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        e.message
    : (e as Error).message;
}

export default function Faculties() {
  const { hasRole } = useAuth();
  const canManage = hasRole("SysAdmin");

  const [items, setItems] = useState<FacultyListItem[]>([]);
  const [generalError, setGeneralError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<FacultyDto>({
    name: "",
    address: "",
  });

  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadFaculties() {
    setGeneralError("");
    try {
      const res = await api.get<FacultyListItem[]>("/Faculty");
      setItems(res.data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setItems([]);
        setGeneralError("No faculties found.");
        return;
      }
      setGeneralError(errMsg(e));
    }
  }

  useEffect(() => {
    loadFaculties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    if (!canManage) return;
    setModalError("");
    setEditingId(null);
    setForm({ name: "", address: "" });
    setOpen(true);
  }

  function openEdit(f: FacultyListItem) {
    if (!canManage) return;
    setModalError("");
    setEditingId(f.id);
    setForm({
      name: f.name ?? "",
      address: f.address ?? "",
    });
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;

    setModalError("");
    setSaving(true);

    try {
      const name = form.name.trim();
      const address = form.address.trim();

      if (!name || !address) {
        setModalError("Name and address are required.");
        return;
      }

      const body = { name, address };

      if (editingId) {
        await api.put(`/Faculty/${editingId}`, { id: editingId, ...body });
      } else {
        await api.post("/Faculty", body);
      }

      setOpen(false);
      await loadFaculties();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 422) {
        const msg =
          (e.response.data as any)?.message ||
          (e.response.data as any)?.title ||
          (typeof e.response.data === "string"
            ? e.response.data
            : "Validation error. Please check the form.");
        setModalError(msg);
        return;
      }

      setModalError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!canManage) return;
    setGeneralError("");
    setDeletingId(id);

    try {
      await api.delete(`/Faculty/${id}`);
      await loadFaculties();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 422) {
        const msg =
          (e.response.data as any)?.message ||
          (e.response.data as any)?.title ||
          (typeof e.response.data === "string"
            ? e.response.data
            : "Validation error.");
        setGeneralError(msg);
        return;
      }

      setGeneralError(errMsg(e));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Faculties</h1>
          {canManage && <Button onClick={openCreate}>Create Faculty</Button>}
        </div>

        {generalError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {generalError}
          </div>
        )}

        <div className="space-y-2">
          {items.map((f) => (
            <div
              key={f.id}
              className="rounded-lg border p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-sm text-muted-foreground">
                  {f.address ?? "—"}
                </div>
              </div>

              {canManage && (
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => openEdit(f)}>
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={deletingId === f.id}
                      >
                        {deletingId === f.id ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete faculty?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId === f.id}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => remove(f.id)}
                          disabled={deletingId === f.id}
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
                {editingId ? "Edit Faculty" : "Create Faculty"}
              </DialogTitle>
              <DialogDescription>
                Fill faculty details and save.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  required
                />
              </div>

              {modalError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {modalError}
                </div>
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
