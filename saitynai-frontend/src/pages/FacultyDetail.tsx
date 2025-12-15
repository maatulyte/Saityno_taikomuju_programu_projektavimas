import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../api/axios";
import type { Faculty, Group } from "../types";
import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type UpdateFacultyDto = {
  id: number;
  name: string;
  address: string;
};

function getErrMsg(err: unknown) {
  if (axios.isAxiosError(err)) {
    return (
      (err.response?.data as any)?.message ||
      (err.response?.data as any)?.title ||
      err.message
    );
  }
  return (err as Error).message;
}

export default function FacultyDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const facultyId = Number(id);
  const canLoad = useMemo(
    () => Number.isFinite(facultyId) && facultyId > 0,
    [facultyId]
  );

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [groups, setGroups] = useState<Group[]>([]); // kol kas tuščia (produkijoje groups endpointas 404)
  const [error, setError] = useState("");

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateFacultyDto>({
    id: facultyId,
    name: "",
    address: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function loadFaculty() {
    setError("");
    try {
      const res = await api.get<Faculty>(`/Faculty/${facultyId}`);
      setFaculty(res.data);

      // Užpildom edit formą pagal tai ką gavom iš API
      setEditForm({
        id: res.data.id,
        name: res.data.name ?? "",
        address: res.data.address ?? "",
      });

      // Produkcijoje /Faculty/{id}/mentors/groups yra 404, todėl kol kas nerodom
      setGroups([]);
    } catch (err) {
      setError(getErrMsg(err));
      setFaculty(null);
      setGroups([]);
    }
  }

  useEffect(() => {
    if (!canLoad) return;
    loadFaculty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, facultyId]);

  function openEdit() {
    setEditError("");
    setEditForm({
      id: faculty?.id ?? facultyId,
      name: faculty?.name ?? "",
      address: faculty?.address ?? "",
    });
    setEditOpen(true);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      // TIKRAS variantas pagal tavo logus: PUT /Faculty/{id}
      await api.put(`/Faculty/${facultyId}`, {
        id: facultyId,
        name: editForm.name,
        address: editForm.address,
      });

      setEditOpen(false);
      await loadFaculty();
    } catch (err) {
      setEditError(getErrMsg(err));
    } finally {
      setEditLoading(false);
    }
  }

  async function submitDelete() {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      await api.delete(`/Faculty/${facultyId}`);
      nav("/faculties", { replace: true });
    } catch (err) {
      setDeleteError(getErrMsg(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Navbar />
          <p className="text-sm text-muted-foreground">
            <Link to="/faculties" className="hover:underline">
              ← Back to Faculties
            </Link>
          </p>
          <h2 className="text-2xl font-semibold">
            {faculty?.name ?? `Faculty #${facultyId}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEdit} disabled={!faculty}>
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => setDeleteError("")}
                disabled={!faculty}
              >
                Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this faculty?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Faculty will be permanently
                  deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    submitDelete();
                  }}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Address</div>
        <div className="text-base">{faculty?.address ?? "—"}</div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Groups</h3>
        <p className="text-sm text-muted-foreground">
          Groups endpoint production aplinkoje grąžina 404, todėl kol kas jų
          nerodome.
        </p>

        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups found.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div key={g.id} className="rounded-lg border p-3">
                <div className="font-medium">{g.name}</div>
                <div className="text-sm text-muted-foreground">
                  StudyYear: {g.studyYear} • StudyLevel: {g.studyLevel} •
                  MentorId: {g.mentorId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT DIALOG */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => !editLoading && setEditOpen(v)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>
              Update faculty name and address.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, address: e.target.value }))
                }
                required
              />
            </div>

            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
