import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isAuthed, logout, hasRole, me } = useAuth();

  return (
    <nav className="p-4 flex gap-4 items-center border-b">
      <Link to="/">Home</Link>

      {isAuthed && hasRole("SysAdmin") && (
        <Link to="/faculties">Faculties</Link>
      )}

      {isAuthed && hasRole("Coordinator") && <Link to="/mentors">Mentors</Link>}

      {isAuthed && hasRole("Mentor") && <Link to="/groups">Groups</Link>}

      <div className="ml-auto flex gap-3 items-center">
        {isAuthed ? (
          <>
            <span className="text-sm text-muted-foreground">
              {me?.userName} ({me?.roles.join(", ")})
            </span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
