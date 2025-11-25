import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [pane, setPane] = useState("dashboard");

  const [q, setQ] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("id");
  const [dir, setDir] = useState("asc");
  const [pageSize, setPageSize] = useState(100);

  const [applied, setApplied] = useState({
    q: "",
    departmentId: "",
    role: "",
    sort: "id",
    dir: "asc",
    page: 1,
    pageSize: 100,
  });

  const [data, setData] = useState({
    rows: [],
    total: 0,
    page: 1,
    pageSize: 10,
    error: null,
  });

  const [loading, setLoading] = useState(false);


  // -----------------------------
  // Pending Events
  // -----------------------------
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");

  const loadPendingEvents = async () => {
    setPendingLoading(true);
    setPendingError("");

    try {
      const res = await fetch(`${API_BASE}/api/events/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load events");

      setPendingEvents(json);
    } catch (err) {
      setPendingError(String(err.message));
      setPendingEvents([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const approveEvent = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/approve`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Approve failed");

      loadPendingEvents();
    } catch (e) {
      alert("Error approving event: " + e.message);
    }
  };

  const rejectEvent = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/reject`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reject failed");

      loadPendingEvents();
    } catch (e) {
      alert("Error rejecting event: " + e.message);
    }
  };

  // -----------------------------
  // Pending Exhibitions
  // -----------------------------
  const [pendingExhibitions, setPendingExhibitions] = useState([]);
  const [pendingExhLoading, setPendingExhLoading] = useState(false);
  const [pendingExhError, setPendingExhError] = useState("");

  const loadPendingExhibitions = async () => {
    setPendingExhLoading(true);
    setPendingExhError("");

    try {
      const res = await fetch(`${API_BASE}/api/exhibitions/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load exhibitions");

      setPendingExhibitions(json);
    } catch (err) {
      setPendingExhError(String(err.message));
      setPendingExhibitions([]);
    } finally {
      setPendingExhLoading(false);
    }
  };

  const approveExhibition = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/exhibitions/${id}/approve`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Approve failed");

      loadPendingExhibitions();
    } catch (e) {
      alert("Error approving exhibition: " + e.message);
    }
  };

  const rejectExhibition = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/exhibitions/${id}/reject`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reject failed");

      loadPendingExhibitions();
    } catch (e) {
      alert("Error rejecting exhibition: " + e.message);
    }
  };

  // ---- Fetch dashboard data (non-metrics) ----
  useEffect(() => {
    if (pane !== "dashboard") return;
    loadPendingEvents();
    loadPendingExhibitions();
  }, [pane]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (applied.q) p.set("q", applied.q);
    if (applied.departmentId) p.set("department_id", applied.departmentId);
    if (applied.role) p.set("role", applied.role);
    p.set("sort", applied.sort);
    p.set("dir", applied.dir);
    p.set("page", String(applied.page));
    p.set("pageSize", String(applied.pageSize));
    return p.toString();
  }, [applied]);

  useEffect(() => {
    if (pane !== "dashboard") return;
    let ignore = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/employees?${query}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        if (!ignore) setData({ ...json, error: null });
      } catch (e) {
        if (!ignore)
          setData((d) => ({ ...d, rows: [], total: 0, error: String(e) }));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [query, pane, token]);

  const onApply = (e) => {
    e.preventDefault();
    setApplied((prev) => ({
      ...prev,
      q,
      departmentId,
      role,
      sort,
      dir,
      page: 1,
      pageSize,
    }));
  };

  const openEmployeeForm = (id) =>
    id ? navigate(`/employee-form?id=${id}`) : navigate("/employee-form");

  const totalPages = Math.max(
    1,
    Math.ceil((data.total || 0) / (data.pageSize || applied.pageSize || 10))
  );

  const filteredRows = useMemo(() => {
    const needle = applied.q.trim().toLowerCase();
    const dep = applied.departmentId;
    const r = applied.role;

    let rows = data.rows || [];

    if (needle) {
      rows = rows.filter((row) => {
        const fullName = `${row.first_name} ${row.last_name}`.toLowerCase();
        const email = (row.email || "").toLowerCase();
        const phone = (row.phone || "").toLowerCase();
        return (
          fullName.includes(needle) ||
          email.includes(needle) ||
          phone.includes(needle)
        );
      });
    }

    if (dep)
      rows = rows.filter(
        (row) => String(row.department_id) === String(dep)
      );
    if (r) rows = rows.filter((row) => row.employee_role === r);

    return rows;
  }, [data.rows, applied]);

  const toggleActive = async (userId, currentActive) => {
    if (!userId) return alert("This employee has no linked user.");
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ is_active: currentActive ? 0 : 1 }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Toggle failed (${res.status})`);

      setData((prev) => ({
        ...prev,
        rows: prev.rows.map((row) =>
          row.user_id === userId
            ? { ...row, is_active: currentActive ? 0 : 1 }
            : row
        ),
      }));
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return "";

    // Handles: "2025-11-29T06:00:00.000Z" OR "2025-11-29"
    const clean = dateStr.slice(0, 10);
    const [yyyy, mm, dd] = clean.split("-");

    return `${mm}/${dd}/${yyyy}`;
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-white to-neutral-50 min-h-screen text-neutral-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-800">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-600">
            Welcome
            {user ? `, ${user.first_name || ""} ${user.last_name || ""}` : ""} — You
            have full control over Artists, Artworks, Events, Exhibitions,
            Employees, and Users.
          </p>
        </div>

        <div className="inline-flex bg-neutral-100 rounded-3xl p-1 shadow-inner">
          <button
            onClick={() => setPane("dashboard")}
            className={`px-6 py-2 rounded-2xl text-sm font-medium transition ${pane === "dashboard"
              ? "bg-white shadow text-neutral-900"
              : "text-neutral-600 hover:text-neutral-800"
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setPane("users")}
            className={`px-6 py-2 rounded-2xl text-sm font-medium transition ${pane === "users"
              ? "bg-white shadow text-neutral-900"
              : "text-neutral-600 hover:text-neutral-800"
              }`}
          >
            Users
          </button>
        </div>
      </div>

      {pane === "dashboard" && (
        <>
          {(pendingEvents.length > 0 || pendingExhibitions.length > 0) && (
            <div className="p-4 mb-4 rounded-lg border border-rose-300 bg-rose-50 text-black shadow-sm">
              <h3 className="text-lg font-semibold mb-1">Event & Exhibition Alerts</h3>

              {pendingEvents.length > 0 && (
                <p className="text-sm">
                  • <strong>{pendingEvents.length}</strong> event
                  {pendingEvents.length !== 1 ? "s" : ""} pending approval
                </p>
              )}

              {pendingExhibitions.length > 0 && (
                <p className="text-sm">
                  • <strong>{pendingExhibitions.length}</strong> exhibition
                  {pendingExhibitions.length !== 1 ? "s" : ""} pending approval
                </p>
              )}
            </div>
          )}
        </>
      )}

      {pane === "dashboard" && (
        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            Event Approval Queue
          </h2>

          <div className="rounded-xl border border-neutral-300 bg-white shadow-sm overflow-hidden">
            {pendingLoading ? (
              <div className="p-4 text-neutral-500">Loading pending events…</div>
            ) : pendingError ? (
              <div className="p-4 text-red-600">{pendingError}</div>
            ) : pendingEvents.length === 0 ? (
              <div className="p-4 text-neutral-500">
                No pending events to approve.
              </div>
            ) : (
              <table className="min-w-full text-sm text-neutral-800">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Title</th>
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                    <th className="px-3 py-2 text-left font-semibold">Venue</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map((ev) => (
                    <tr
                      key={ev.event_id}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-3 py-2">{ev.title}</td>
                      <td className="px-3 py-2">
                        {new Date(ev.event_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{ev.venue_name || "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveEvent(ev.event_id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded-md"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => rejectEvent(ev.event_id)}
                            className="bg-red-500 hover:bg-red-400 text-white text-xs px-3 py-1 rounded-md"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* EXHIBITION APPROVAL QUEUE */}
      {pane === "dashboard" && (
        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            Exhibition Approval Queue
          </h2>

          <div className="rounded-xl border border-neutral-300 bg-white shadow-sm overflow-hidden">
            {pendingExhLoading ? (
              <div className="p-4 text-neutral-500">
                Loading pending exhibitions…
              </div>
            ) : pendingExhError ? (
              <div className="p-4 text-red-600">{pendingExhError}</div>
            ) : pendingExhibitions.length === 0 ? (
              <div className="p-4 text-neutral-500">
                No pending exhibitions to approve.
              </div>
            ) : (
              <table className="min-w-full text-sm text-neutral-800">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Title</th>
                    <th className="px-3 py-2 text-left font-semibold">Dates</th>
                    <th className="px-3 py-2 text-left font-semibold">Venue</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Organizer
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingExhibitions.map((ex) => (
                    <tr
                      key={ex.exhibition_id}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-3 py-2">{ex.title}</td>
                      <td className="px-3 py-2">
                        {ex.start_date ? formatDate(ex.start_date) : "—"}{" "}
                        –{" "}
                        {ex.end_date ? formatDate(ex.end_date) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {ex.venue_name ||
                          (ex.venue_id ? `Venue #${ex.venue_id}` : "—")}
                      </td>

                      <td className="px-3 py-2">
                        {ex.organizer || "—"}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approveExhibition(ex.exhibition_id)
                            }
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded-md"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectExhibition(ex.exhibition_id)
                            }
                            className="bg-red-500 hover:bg-red-400 text-white text-xs px-3 py-1 rounded-md"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}



      {/* EMPLOYEE SEARCH + TABLE */}
      {pane === "dashboard" ? (
        <>
          <h1 className="text-lg font-semibold text-neutral-800 mt-10">
            Employee Search
          </h1>
          <form className="flex flex-wrap gap-2 items-end" onSubmit={onApply}>
            <input
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm flex-1"
              placeholder="Search name/email/phone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="1">Administration / IT</option>
              <option value="2">Curatorial</option>
              <option value="3">Exhibitions & Events</option>
              <option value="4">Visitor Services</option>
              <option value="5">Retail / Shop</option>
              <option value="6">Development</option>
            </select>

            <select
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="curator">Curator</option>
              <option value="manager">Manager</option>
              <option value="security">Security</option>
              <option value="guide">Guide</option>
            </select>

            <button
              type="submit"
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-400 text-sm"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={() => openEmployeeForm()}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 text-sm"
            >
              + Add Employee
            </button>
          </form>

          <div className="rounded-xl border border-neutral-300 bg-white shadow-sm overflow-x-auto max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-neutral-500">Loading…</div>
            ) : data.error ? (
              <div className="p-4 text-red-500">{data.error}</div>
            ) : (
              <table className="min-w-full text-sm text-neutral-800">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">ID</th>
                    <th className="px-3 py-2 text-left font-semibold">First</th>
                    <th className="px-3 py-2 text-left font-semibold">Last</th>
                    <th className="px-3 py-2 text-left font-semibold">Role</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr
                      key={r.employee_id}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-3 py-2">{r.employee_id}</td>
                      <td className="px-3 py-2">{r.first_name}</td>
                      <td className="px-3 py-2">{r.last_name}</td>
                      <td className="px-3 py-2">{r.employee_role}</td>
                      <td className="px-3 py-2">{r.email}</td>

                      <td className="px-3 py-2">
                        {r.user_id ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-neutral-200 text-neutral-700"
                              }`}
                          >
                            {r.is_active ? "Active" : "Inactive"}
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-xs">
                            No user
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEmployeeForm(r.employee_id)}
                            className="px-2 py-1 rounded-md text-xs bg-neutral-200 hover:bg-neutral-300"
                            title="Edit employee"
                          >
                            Edit
                          </button>

                          {r.user_id ? (
                            <button
                              onClick={() =>
                                toggleActive(r.user_id, r.is_active)
                              }
                              className={`px-2 py-1 rounded-md text-xs ${r.is_active
                                ? "bg-red-500 hover:bg-red-400 text-white"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                }`}
                              title={
                                r.is_active ? "Disable login" : "Enable login"
                              }
                            >
                              {r.is_active ? "Disable" : "Enable"}
                            </button>
                          ) : (
                            <span className="text-neutral-500 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <UsersPane />
      )}
    </div>
  );
}

/* ------------------------- Users Pane stays same ------------------------- */

function UsersPane() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const token = localStorage.getItem("token");

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);        // all users from backend
  const [filtered, setFiltered] = useState([]);  // users after search/filter
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // --- Add User form state ---
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "visitor",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      let json;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        json = await res.json();
      } else {
        if (!res.ok) {
          throw new Error(`Failed to fetch users (status ${res.status})`);
        }
        json = [];
      }

      if (!res.ok) {
        throw new Error(json?.error || `Failed to fetch users`);
      }

      const rows = Array.isArray(json) ? json : json.rows || [];
      setUsers(rows);
      setFiltered(rows);
    } catch (e) {
      setErr(String(e.message || e));
      setUsers([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const needle = q.trim().toLowerCase();
    const selectedRole = role.trim().toLowerCase();

    let rows = [...users];

    if (needle) {
      rows = rows.filter((u) => {
        const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(needle) || email.includes(needle);
      });
    }

    if (selectedRole) {
      rows = rows.filter(
        (u) => (u.role || "").toLowerCase() === selectedRole
      );
    }

    setFiltered(rows);
  };

  const handleCreateChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const createUser = async (e) => {
    e.preventDefault();
    setCreateErr("");

    if (!form.email || !form.password) {
      setCreateErr("Email and password are required.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          first_name: form.first_name.trim() || null,
          last_name: form.last_name.trim() || null,
          email: form.email.trim(),
          password: form.password,
          role: form.role || "visitor",
        }),
      });

      let json;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        json = await res.json();
      } else {
        json = {};
      }

      if (!res.ok) throw new Error(json.error || "Create failed");

      // refresh list
      await fetchUsers();

      // reset form + close
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "visitor",
      });
      setShowCreate(false);
    } catch (e) {
      setCreateErr(e.message || "Error creating user.");
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (id, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      let json = {};
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        try {
          json = await res.json();
        } catch {
          json = {};
        }
      }

      if (!res.ok) {
        throw new Error(json.error || `Delete failed (status ${res.status})`);
      }

      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      setFiltered((prev) => prev.filter((u) => u.user_id !== id));
    } catch (e) {
      alert("Error deleting user: " + e.message);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header + filters + Add User button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-neutral-800">
          User Management
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Search name/email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="visitor">Visitor</option>
          </select>

          <button
            onClick={applyFilters}
            className="px-3 py-2 rounded-lg text-sm bg-neutral-200 hover:bg-neutral-300"
          >
            Apply
          </button>

          <button
            onClick={() => setShowCreate((s) => !s)}
            className="px-3 py-2 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-400"
          >
            {showCreate ? "Close" : "+ Add User"}
          </button>
        </div>
      </div>

      {/* Add User inline card */}
      {showCreate && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">
            Create New User
          </h3>

          {createErr && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {createErr}
            </div>
          )}

          <form
            onSubmit={createUser}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">
                First Name
              </label>
              <input
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={form.first_name}
                onChange={(e) =>
                  handleCreateChange("first_name", e.target.value)
                }
                placeholder="First name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">
                Last Name
              </label>
              <input
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={form.last_name}
                onChange={(e) =>
                  handleCreateChange("last_name", e.target.value)
                }
                placeholder="Last name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">
                Email<span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => handleCreateChange("email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">
                Temporary Password<span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={form.password}
                onChange={(e) =>
                  handleCreateChange("password", e.target.value)
                }
                placeholder="Set initial password"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">
                Role
              </label>
              <select
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => handleCreateChange("role", e.target.value)}
              >
                <option value="visitor">Visitor</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {err && <div className="text-sm text-red-600">{err}</div>}

      {/* Users table */}
      <div className="rounded-xl border border-neutral-300 overflow-x-auto bg-white shadow-sm">
        {loading ? (
          <div className="p-4 text-neutral-500">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-neutral-500">No users found.</div>
        ) : (
          <table className="min-w-full text-sm text-neutral-800">
            <thead className="bg-neutral-100 text-neutral-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">ID</th>
                <th className="px-3 py-2 text-left font-semibold">First</th>
                <th className="px-3 py-2 text-left font-semibold">Last</th>
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Role</th>
                <th className="px-3 py-2 text-left font-semibold">Created</th>
                <th className="px-3 py-2 text-left font-semibold">Updated</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.user_id} className="border-t border-neutral-200">
                  <td className="px-3 py-2">{u.user_id}</td>
                  <td className="px-3 py-2">{u.first_name}</td>
                  <td className="px-3 py-2">{u.last_name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 text-neutral-500">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-neutral-500">
                    {u.updated_at
                      ? new Date(u.updated_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteUser(u.user_id, u.email)}
                      className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded-md text-xs"
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
