import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const token = localStorage.getItem("token");
const API_BASE = import.meta.env.VITE_API_BASE;

export default function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters
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

  // Data
  const [data, setData] = useState({
    rows: [],
    total: 0,
    page: 1,
    pageSize: 10,
    error: null,
  });
  const [loading, setLoading] = useState(false);

  // Metrics
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [metrics, setMetrics] = useState({
    total_visitors: 0,
    ticket_sales: 0,
    shop_sales: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  const fmtInt = (n) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      n ?? 0
    );
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(Number.isFinite(n) ? n : 0);

  const firstDayISO = (yyyyMm) => `${yyyyMm}-01`;
  const lastDayISO = (yyyyMm) => {
    const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
    const d = new Date(y, m, 0);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // Fetch metrics
  useEffect(() => {
    let ignore = false;
    (async () => {
      setMetricsLoading(true);
      try {
        const start = firstDayISO(selectedMonth);
        const end = lastDayISO(selectedMonth);
        const res = await fetch(
          `${API_BASE}/api/reports/admin-metrics?start=${start}&end=${end}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (!res.ok) throw new Error(`Metrics request failed: ${res.status}`);
        const json = await res.json();
        if (!ignore)
          setMetrics({
            total_visitors: Number(json.total_visitors ?? 0),
            ticket_sales: Number(json.ticket_sales ?? 0),
            shop_sales: Number(json.shop_sales ?? 0),
          });
      } catch (err) {
        if (!ignore) setMetricsError(String(err.message || err));
      } finally {
        if (!ignore) setMetricsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selectedMonth]);

  // Employees
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
        if (!ignore)
          setData((d) => ({ ...d, rows: [], total: 0, error: String(e) }));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [query]);

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

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-white to-neutral-50 min-h-screen text-neutral-900">
      <h1 className="text-3xl font-semibold text-neutral-800">
        Admin Dashboard
      </h1>
      <p className="text-sm text-neutral-600">
        Welcome
        {user ? `, ${user.first_name || ""} ${user.last_name || ""}` : ""} You
        have full control over Artists, Artworks, Employees, and Users.
      </p>

      {/* Performance Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-neutral-800">
            Monthly Performance
          </h2>
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
          <div className="p-4 text-red-500">
            Failed to load metrics: {metricsError}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Visitors"
              value={fmtInt(metrics.total_visitors)}
            />
            <MetricCard
              title="Ticket Sales"
              value={fmtCurrency(metrics.ticket_sales)}
            />
            <MetricCard
              title="Shop Sales"
              value={fmtCurrency(metrics.shop_sales)}
            />
            <UserCard />
          </div>
        )}
      </section>

      {/*Member Ticket Engagement Chart */}
      <MemberTicketChart selectedMonth={selectedMonth} />

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

        <button
          type="submit"
          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-400 text-sm"
        >
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
    </div>
  );
}

// --- Reusable components ---
function MetricCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 shadow-sm p-5 flex flex-col">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold mt-2 text-neutral-800">{value}</div>
    </div>
  );
}

function UserCard() {
  const token = localStorage.getItem("token");
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch users");
      setUsers(json);
    } catch (err) {
      alert("Error fetching users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white border border-neutral-200 shadow-sm p-5 flex flex-col justify-between relative">
      <div>
        <div className="text-sm text-neutral-500">User Management</div>
        <div className="text-2xl font-semibold mt-2 text-neutral-800">Users</div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={async () => {
            const first_name = prompt("Enter first name:");
            const last_name = prompt("Enter last name:");
            const email = prompt("Enter email:");
            const password = prompt("Enter password:");
            const role = prompt("Enter role (admin, employee, visitor):", "visitor");
            if (!email || !password) return alert("Email and password are required.");
            try {
              const res = await fetch(`${API_BASE}/api/users`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ first_name, last_name, email, password, role }),
              });
              const data = await res.json();
              if (res.ok) alert("User created successfully!");
              else alert(`Failed: ${data.error || res.statusText}`);
            } catch (err) {
              alert("Error: " + err.message);
            }
          }}
          className="flex-1 bg-rose-500 hover:bg-rose-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add User
        </button>

        <button
          onClick={async () => {
            await fetchUsers();
            setShowUsers(true);
          }}
          className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          View Users
        </button>
      </div>

      {showUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white h-full shadow-xl overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold text-neutral-800">
                Registered Users
              </h3>
              <button
                onClick={() => setShowUsers(false)}
                className="text-sm px-3 py-1.5 bg-neutral-200 rounded-lg hover:bg-neutral-300"
              >
                Close
              </button>
            </div>

            {loading ? (
              <div className="text-neutral-500">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-neutral-500">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-neutral-800 border-t border-neutral-200">
                  <thead className="bg-neutral-100 text-neutral-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">ID</th>
                      <th className="px-3 py-2 text-left font-semibold">First</th>
                      <th className="px-3 py-2 text-left font-semibold">Last</th>
                      <th className="px-3 py-2 text-left font-semibold">Email</th>
                      <th className="px-3 py-2 text-left font-semibold">Role</th>
                      <th className="px-3 py-2 text-left font-semibold">Created</th>
                      <th className="px-3 py-2 text-left font-semibold">Updated</th>
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
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-neutral-500">
                          {new Date(u.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Member Ticket Engagement Bar Chart ---
function MemberTicketChart({ selectedMonth }) {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🗓 helper functions (same logic used in metrics)
  const firstDayISO = (yyyyMm) => `${yyyyMm}-01`;
  const lastDayISO = (yyyyMm) => {
    const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
    const d = new Date(y, m, 0);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const start = firstDayISO(selectedMonth);
        const end = lastDayISO(selectedMonth);

        // ✅ Now send date range to backend
        const res = await fetch(
          `${API_BASE}/api/reports/member-ticket-purchases?start=${start}&end=${end}`
        );

        if (!res.ok) throw new Error(`Chart data request failed: ${res.status}`);
        const rows = await res.json();

        const grouped = rows.reduce((acc, row) => {
          const type = row.membership_type || "Unknown";
          if (!acc[type]) {
            acc[type] = {
              membership_type: type,
              total_tickets: 0,
              total_spent: 0,
            };
          }
          acc[type].total_tickets += Number(row.total_tickets_bought || 0);
          acc[type].total_spent += Number(row.total_amount_spent || 0);
          return acc;
        }, {});
        setChartData(Object.values(grouped));
      } catch (err) {
        console.error("Error loading chart data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [API_BASE, selectedMonth]); // 🧠 refetch every time month changes

  if (loading) {
    return <div className="p-4 text-neutral-500">Loading chart...</div>;
  }

  return (
    <div className="mt-8 rounded-xl bg-white border border-neutral-200 shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">
          🎟️ Member Ticket Engagement
        </h3>
        <p className="text-sm text-neutral-500">
          Tickets purchased and spending by membership tier ({selectedMonth})
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="membership_type"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={80}
          />
          <YAxis />
          <Tooltip
            formatter={(value, name) =>
              name === "total_spent" ? `$${value.toFixed(2)}` : value
            }
          />
          <Legend />
          <Bar dataKey="total_tickets" fill="#82ca9d" name="Tickets Bought" />
          <Bar dataKey="total_spent" fill="#8884d8" name="Total Spent ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
