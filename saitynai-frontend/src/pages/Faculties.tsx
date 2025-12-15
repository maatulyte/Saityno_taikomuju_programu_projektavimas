import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { api } from "../api/axios";
import type { Faculty } from "../types";
import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";

type CreateFacultyDto = {
  name: string;
  address: string;
};

export default function Faculties() {
  const [items, setItems] = useState<Faculty[]>([]);
  const [error, setError] = useState("");

  const { hasRole } = useAuth();
  const canManage = hasRole("SysAdmin");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [form, setForm] = useState<CreateFacultyDto>({
    name: "",
    address: "",
  });

  async function loadFaculties() {
    try {
      const res = await api.get<Faculty[]>("/Faculty");
      setItems(res.data);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : (err as Error).message
      );
    }
  }

  useEffect(() => {
    loadFaculties();
  }, []);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setLoading(true);

    try {
      await api.post("/Faculty", form); // POST /Faculty
      setOpen(false);
      setForm({ name: "", address: "" });
      await loadFaculties();
    } catch (err) {
      setCreateError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : (err as Error).message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Navbar />
        <h2 className="text-2xl font-semibold">Faculties</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Create Faculty</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Faculty</DialogTitle>
            </DialogHeader>

            <form onSubmit={submitCreate} className="space-y-4">
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

              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      <div className="space-y-2">
        {items.map((f) => (
          <div key={f.id}>
            <Link
              to={`/faculties/${f.id}`}
              className="text-primary hover:underline"
            >
              {f.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
