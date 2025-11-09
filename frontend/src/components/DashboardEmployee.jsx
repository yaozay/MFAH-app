import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function DashboardEmployee() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-neutral-800 mb-2 tracking-tight">
          Employee Dashboard
        </h1>
        <p className="text-neutral-600 mb-10">
          Welcome
          {user ? `, ${user.first_name || ""} ${user.last_name || ""}` : ""}!
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <PortalCard
            title="Manage Artists"
            desc="Add new artists or update existing ones."
            to="/artists"
            cta="Open Artists"
          />
          <PortalCard
            title="Manage Artworks"
            desc="Create or edit artworks and link them to artists."
            to="/artworks"
            cta="Open Artworks"
          />
          <PortalCard
            title="Manage Events"
            desc="Create, update, or delete upcoming exhibitions."
            to="/events"
            cta="Open Events"
          />
          <PortalCard
            title="View Reports"
            desc="See collection and visitor insights."
            to="/reports"
            cta="Open Reports"
          />
          <PortalCard
            title="Manage Gift Shop"
            desc="Add, update, or remove gift shop items."
            to="/giftshop"
            cta="Open Gift Shop"
          />
          <PortalCard
            title="Manage Exhibitions"
            desc="Add, update, or remove exhibitions."
            to="/exhibitions"
            cta="Open Exhibitions"
          />
        </div>
      </div>
    </div>
  );
}

function PortalCard({ title, desc, to, cta }) {
  return (
    <div className="rounded-2xl bg-white shadow-md border border-neutral-200 hover:shadow-lg transition-all duration-300 p-6">
      <div className="text-xl font-serif text-neutral-900 mb-2">{title}</div>
      <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{desc}</p>
      <Link
        to={to}
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition"
      >
        {cta}
      </Link>
    </div>
  );
}
