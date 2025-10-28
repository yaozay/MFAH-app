import { useAuth } from "../lib/auth.jsx";

export default function DashboardVisitor() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Visitor";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome {fullName}!</h1>
      <p>Browse artists and artworks freely.</p>
    </div>
  );
}
