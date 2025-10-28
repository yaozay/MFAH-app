import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";

// Minimal Employee Portal – avoids duplicating Artists/Artworks/Reports UIs
// Shows quick actions only (you already have top‑nav routes for those pages)
export default function DashboardEmployee() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // OPTIONAL: auto‑redirect employees straight to Artists
  // Uncomment if you prefer skipping this page entirely
  // useEffect(() => {
  //   navigate("/artists", { replace: true });
  // }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employee Portal</h1>
      <p className="text-sm opacity-80">
        Welcome{user ? `, ${user.first_name || ""} ${user.last_name || ""}` : ""}!
        Use the quick actions below to manage content.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PortalCard
          title="Manage Artists"
          desc="Add new artists or update existing ones."
          to="/artists"
          cta="Open Artists"
        />
        <PortalCard
          title="Manage Artworks"
          desc="Create or edit artworks and link to artists."
          to="/artworks"
          cta="Open Artworks"
        />
        <PortalCard
          title="Manage Events"
          desc="Create, update, or delete events."
          to="/events"
          cta="Open Events"
        />
        <PortalCard
          title="View Reports"
          desc="See collection and activity insights (read‑only)."
          to="/reports"
          cta="Open Reports"
        />
      </div>



    </div>
  );
}

function PortalCard({ title, desc, to, cta }) {
  return (
    <div className="rounded-2xl border border-neutral-800 p-5 bg-white/5">
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-sm opacity-80 mt-1 mb-4">{desc}</p>
      <Link
        to={to}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white hover:opacity-90 transition"
      >
        {cta}
      </Link>
    </div>
  );
}
