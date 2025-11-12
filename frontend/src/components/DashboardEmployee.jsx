import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";

export default function DashboardEmployee() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE;

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      const res = await fetch(`${API}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Cannot resolve this alert yet — stock still low.");
        return;
      }
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }


  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [API, token]);

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

        <div className="mb-10">
          <h2 className="text-2xl font-serif text-neutral-900 mb-4">
            Low Stock Alerts
          </h2>

          {loading && <p className="text-neutral-500">Loading alerts...</p>}

          {!loading && notifications.length === 0 && (
            <p className="text-neutral-600 italic">No low-stock alerts</p>
          )}

          {!loading && notifications.length > 0 && (
            <div className="space-y-3">
              {notifications
                .filter((n) => !n.is_read)
                .slice(0, 5)
                .map((note) => (
                  <div
                    key={note.notification_id}
                    className="border border-rose-600 bg-white shadow-sm rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
                  >
                    <p className="text-sm text-neutral-900">{note.message}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                    <button
                      onClick={() => markAsRead(note.notification_id)}
                      className="mt-2 text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Mark as resolved
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 🔗 Portal Cards */}
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
