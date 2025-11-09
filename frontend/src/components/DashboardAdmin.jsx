// src/pages/DashboardAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ---- pane toggle ----
  const [pane, setPane] = useState("dashboard"); // 'dashboard' | 'users'

  // ---- Filters (Employees) ----
  const [q, setQ] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("id");
  const [dir, setDir] = useState("asc");
  const [pageSize, setPageSize] = useState(10);

  const [applied, setApplied] = useState({
    q: "",
    departmentId: "",
    role: "",
    sort: "id",
    dir: "asc",
    page: 1,
    pageSize: 10,
  });

  // ---- Data (Employees) ----
  const [data, setData] = useState({
    rows: [],
    total: 0,
    page: 1,
    pageSize: 10,
    error: null,
  });
  const [loading, setLoading] = useState(false);

  // ---- Metrics ----
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [metrics, setMetrics] = useState({ total_visitors: 0, ticket_sales: 0, shop_sales: 0 });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  const fmtInt = (n) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n ?? 0);
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number.isFinite(n) ? n : 0);

  const firstDayISO = (yyyyMm) => `${yyyyMm}-01`;
  const lastDayISO = (yyyyMm) => {
    const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
    const d = new Date(y, m, 0);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // ---- Fetch metrics ----
  useEffect(() => {
    if (pane !== "dashboard") return;
    let ignore = false;
    (async () => {
      setMetricsLoading(true);
      try {
        const start = firstDayISO(selectedMonth);
        const end = lastDayISO(selectedMonth);
        const res = await fetch(`${API_BASE}/api/reports/admin-metrics?start=${start}&end=${end}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Metrics request failed: ${res.status}`);
        const json = await res.json();
        if (!ignore) {
          setMetrics({
            total_visitors: Number(json.total_visitors ?? 0),
            ticket_sales: Number(json.ticket_sales ?? 0),
            shop_sales: Number(json.shop_sales ?? 0),
          });
        }
      } catch (err) {
        if (!ignore) setMetricsError(String(err.message || err));
      } finally {
        if (!ignore) setMetricsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selectedMonth, pane, token]);

  // ---- Employees ----
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
        const res = await fetch(`${API_BASE}/api/reports/employees?${query}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        if (!ignore) setData({ ...json, error: null });
      } catch (e) {
        if (!ignore) setData((d) => ({ ...d, rows: [], total: 0, error: String(e) }));
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
    setApplied((prev) => ({ ...prev, q, departmentId, role, sort, dir, page: 1, pageSize }));
  };

  const openEmployeeForm = (id) => (id ? navigate(`/employee-form?id=${id}`) : navigate("/employee-form"));

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || applied.pageSize || 10)));

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-white to-neutral-50 min-h-screen text-neutral-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-800">Admin Dashboard</h1>
          <p className="text-sm text-neutral-600">
            Welcome{user ? `, ${user.first_name || ""} ${user.last_name || ""}` : ""} You have full control over
            Artists, Artworks, Employees, and Users.
          </p>
        </div>

        {/* Segmented toggle */}
        <div className="inline-flex bg-neutral-100 rounded-3xl p-1 shadow-inner">
          <button
            onClick={() => setPane("dashboard")}
            className={`px-6 py-2 rounded-2xl text-sm font-medium transition ${
              pane === "dashboard" ? "bg-white shadow text-neutral-900" : "text-neutral-600 hover:text-neutral-800"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setPane("users")}
            className={`px-6 py-2 rounded-2xl text-sm font-medium transition ${
              pane === "users" ? "bg-white shadow text-neutral-900" : "text-neutral-600 hover:text-neutral-800"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {pane === "dashboard" ? (
        <>
          {/* Performance Section */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-semibold text-neutral-800">Monthly Performance</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-600">Month</label>
                <input
                  type="month"
                  className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            {metricsLoading ? (
              <div className="p-4 text-neutral-500">Loading metrics…</div>
            ) : metricsError ? (
              <div className="p-4 text-red-500">Failed to load metrics: {metricsError}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard title="Total Visitors" value={fmtInt(metrics.total_visitors)} />
                <MetricCard title="Ticket Sales" value={fmtCurrency(metrics.ticket_sales)} />
                <MetricCard title="Shop Sales" value={fmtCurrency(metrics.shop_sales)} />
              </div>
            )}
          </section>

          {/* Employee Section */}
          <h1 className="text-lg font-semibold text-neutral-800">Employee Search</h1>
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

            <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-400 text-sm">
              Apply
            </button>
          </form>

          {/* Employee Table */}
          <div className="rounded-xl border border-neutral-300 overflow-x-auto bg-white shadow-sm">
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
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.employee_id} className="border-t border-neutral-200">
                      <td className="px-3 py-2">{r.employee_id}</td>
                      <td className="px-3 py-2">{r.first_name}</td>
                      <td className="px-3 py-2">{r.last_name}</td>
                      <td className="px-3 py-2">{r.employee_role}</td>
                      <td className="px-3 py-2">{r.email}</td>
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

// ---- Reusable components ----
function MetricCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 shadow-sm p-5 flex flex-col">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold mt-2 text-neutral-800">{value}</div>
    </div>
  );
}

// ---- Full-width Users Pane inside Dashboard ----
function UsersPane() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const token = localStorage.getItem("token");

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (role) p.set("role", role);

      const res = await fetch(`${API_BASE}/api/users?${p.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Failed to fetch users (${res.status})`);
      setUsers(Array.isArray(json) ? json : json.rows || []);
    } catch (e) {
      setErr(String(e.message || e));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUser = async () => {
    const first_name = prompt("Enter first name:") || "";
    const last_name = prompt("Enter last name:") || "";
    const email = prompt("Enter email:") || "";
    const password = prompt("Enter password:") || "";
    const role = prompt("Enter role (admin, employee, visitor):", "visitor") || "visitor";
    if (!email || !password) return alert("Email and password are required.");
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify({ first_name, last_name, email, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Create failed (${res.status})`);
      await fetchUsers();
      alert("User created.");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const deleteUser = async (userId, email) => {
    const ok = confirm(`Delete user ${email}? This cannot be undone.`);
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Delete failed (${res.status})`);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (e) {
      alert("Error deleting user: " + e.message);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-800">User Management</h2>
        <div className="flex gap-2">
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
          <button onClick={fetchUsers} className="px-3 py-2 rounded-lg text-sm bg-neutral-200 hover:bg-neutral-300">
            Apply
          </button>
          <button
            onClick={createUser}
            className="px-3 py-2 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-400"
          >
            + Add User
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="rounded-xl border border-neutral-300 overflow-x-auto bg-white shadow-sm">
        {loading ? (
          <div className="p-4 text-neutral-500">Loading users…</div>
        ) : users.length === 0 ? (
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
              {users.map((u) => (
                <tr key={u.user_id} className="border-t border-neutral-200">
                  <td className="px-3 py-2">{u.user_id}</td>
                  <td className="px-3 py-2">{u.first_name}</td>
                  <td className="px-3 py-2">{u.last_name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 text-neutral-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-neutral-500">
                    {u.updated_at ? new Date(u.updated_at).toLocaleDateString() : "—"}
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
