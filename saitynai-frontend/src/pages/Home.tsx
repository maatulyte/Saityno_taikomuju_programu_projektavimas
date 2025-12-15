import Navbar from "@/components/Navbar";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { isAuthed, me } = useAuth();

  return (
    <div className="p-4 space-y-2">
      <Navbar />
      <h1 className="text-2xl font-semibold">Home</h1>

      {isAuthed ? (
        <p className="text-muted-foreground">
          Logged in as <span className="font-medium">{me?.userName}</span>{" "}
          {me?.roles?.length ? `(roles: ${me.roles.join(", ")})` : ""}
        </p>
      ) : (
        <p className="text-muted-foreground">Not logged in.</p>
      )}
    </div>
  );
}
