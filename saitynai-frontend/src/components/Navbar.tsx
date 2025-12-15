import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { isAuthed, logout, hasRole, me } = useAuth();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link to="/" onClick={onClick} className="hover:underline">
        Home
      </Link>

      {isAuthed && hasRole("SysAdmin") && (
        <Link to="/faculties" onClick={onClick} className="hover:underline">
          Faculties
        </Link>
      )}

      {isAuthed && hasRole("Coordinator") && (
        <Link to="/mentors" onClick={onClick} className="hover:underline">
          Mentors
        </Link>
      )}

      {isAuthed && hasRole("Mentor") && (
        <Link to="/groups" onClick={onClick} className="hover:underline">
          Groups
        </Link>
      )}
    </>
  );

  const AuthActions = ({ onClick }: { onClick?: () => void }) =>
    isAuthed ? (
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <span className="text-sm text-muted-foreground">
          {me?.userName} ({me?.roles.join(", ")})
        </span>
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
            onClick?.();
          }}
        >
          Logout
        </Button>
      </div>
    ) : (
      <div className="flex gap-3">
        <Link to="/login" onClick={onClick} className="hover:underline">
          Login
        </Link>
        <Link to="/register" onClick={onClick} className="hover:underline">
          Register
        </Link>
      </div>
    );

  return (
    <header className="border-b">
      <nav className="font-mono h-14 px-4 flex items-center gap-4">
        {/* Left: brand + desktop links */}
        <div className="flex items-center gap-4">
          {/* Desktop links */}
          <div className="hidden md:flex gap-4 items-center">
            <NavLinks />
          </div>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            <AuthActions />
          </div>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-6">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <NavLinks onClick={() => setOpen(false)} />
                  </div>

                  <div className="border-t pt-4">
                    <AuthActions onClick={() => setOpen(false)} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
