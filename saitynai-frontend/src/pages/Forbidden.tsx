import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-semibold">403 Forbidden</h1>
      <p className="text-muted-foreground">
        You don’t have access to this page.
      </p>
      <Link to="/" className="text-primary hover:underline">
        Go home
      </Link>
    </div>
  );
}
