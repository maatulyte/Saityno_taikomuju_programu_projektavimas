import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthed, logout } = useAuth();

  return (
    <nav style={{ padding: 16, display: "flex", gap: 12 }}>
      <Link to="/">Home</Link>
      {isAuthed && (
        <>
          <Link to="/faculties">Faculties</Link>
          <Link to="/mentors">Mentors</Link>
          <Link to="/groups">Groups</Link>
          <button onClick={logout}>Logout</button>
        </>
      )}
      {!isAuthed && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
