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

  // ---- Metrics ----
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

  const [giftshopData, setGiftshopData] = useState([]);
  const [giftshopLoading, setGiftshopLoading] = useState(false);
  const [giftshopError, setGiftshopError] = useState(null);

  const [supplierData, setSupplierData] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState(null);

  const fmtInt = (n) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(n ?? 0);

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

  // -----------------------------
  // Pending Events (existing)
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
  // Pending Exhibitions (NEW)
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

  // ---- Fetch metrics ----
  useEffect(() => {
    if (pane !== "dashboard") return;
    loadPendingEvents();
    loadPendingExhibitions();
  }, [pane]);

  useEffect(() => {
    if (pane !== "dashboard") return;
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

  useEffect(() => {
    if (pane !== "dashboard") return;
    let ignore = false;
    (async () => {
      setGiftshopLoading(true);
      try {
        const start = firstDayISO(selectedMonth);
        const end = lastDayISO(selectedMonth);
        const res = await fetch(
          `${API_BASE}/api/reports/member-giftshop-purchases?start=${start}&end=${end}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        if (!ignore) setGiftshopData(json);
      } catch (err) {
        if (!ignore) setGiftshopError(String(err.message || err));
      } finally {
        if (!ignore) setGiftshopLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selectedMonth, pane, token]);

  useEffect(() => {
    if (pane !== "dashboard") return;
    let ignore = false;
    (async () => {
      setSupplierLoading(true);
      try {
        const start = firstDayISO(selectedMonth);
        const end = lastDayISO(selectedMonth);
        const res = await fetch(
          `${API_BASE}/api/reports/supplier-giftshop-sales?start=${start}&end=${end}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        if (!ignore) setSupplierData(json);
      } catch (err) {
        if (!ignore) setSupplierError(String(err.message || err));
      } finally {
        if (!ignore) setSupplierLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selectedMonth, pane, token]);

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

      {/* =======================================
           🔥 EXHIBITION APPROVAL QUEUE (NEW)
      ======================================== */}
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
                        {ex.start_date} – {ex.end_date}
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
                            onClick={() => approveExhibition(ex.exhibition_id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectExhibition(ex.exhibition_id)}
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

      {/* THE REST OF YOUR ORIGINAL DASHBOARD (metrics, reports, employees, users) */}
      {pane === "dashboard" ? (
        <>
          {/* Monthly Performance */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </div>
            )}
          </section>

          {/* Giftshop Purchases */}
          <section className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-neutral-800">
              Member Gift Shop Purchases
            </h2>
            <div className="rounded-xl border border-neutral-300 overflow-x-auto bg-white shadow-sm">
              {giftshopLoading ? (
                <div className="p-4 text-neutral-500">
                  Loading gift shop purchases…
                </div>
              ) : giftshopError ? (
                <div className="p-4 text-red-500">
                  Failed to load report: {giftshopError}
                </div>
              ) : giftshopData.length === 0 ? (
                <div className="p-4 text-neutral-500">
                  No data available for this month.
                </div>
              ) : (
                <table className="min-w-full text-sm text-neutral-800">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">
                        Membership Type
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Total Transactions
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Average Purchase
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Total Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftshopData.map((row, idx) => (
                      <tr key={idx} className="border-t border-neutral-200">
                        <td className="px-3 py-2">{row.membership_type}</td>
                        <td className="px-3 py-2">
                          {row.total_transactions}
                        </td>
                        <td className="px-3 py-2">
                          {fmtCurrency(parseFloat(row.avg_purchase_value))}
                        </td>
                        <td className="px-3 py-2">
                          {fmtCurrency(parseFloat(row.total_spent))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Supplier Sales */}
          <section className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-neutral-800">
              Supplier Gift Shop Sales
            </h2>
            <div className="rounded-xl border border-neutral-300 overflow-x-auto bg-white shadow-sm">
              {supplierLoading ? (
                <div className="p-4 text-neutral-500">
                  Loading supplier sales…
                </div>
              ) : supplierError ? (
                <div className="p-4 text-red-500">
                  Failed to load report: {supplierError}
                </div>
              ) : supplierData.length === 0 ? (
                <div className="p-4 text-neutral-500">No supplier data.</div>
              ) : (
                <table className="min-w-full text-sm text-neutral-800">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">
                        Supplier Name
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Total Sales
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Transactions
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Unique Products Sold
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierData.map((row, idx) => (
                      <tr key={idx} className="border-t border-neutral-200">
                        <td className="px-3 py-2">{row.supplier_name}</td>
                        <td className="px-3 py-2 text-right">
                          {fmtCurrency(parseFloat(row.total_sales))}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.total_transactions}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.unique_products_sold}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Employee Search */}
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

          {/* Employee Table */}
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

// ------------------------------------------------------
// Reusable Components
// ------------------------------------------------------

function MetricCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 shadow-sm p-5 flex flex-col">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold mt-2 text-neutral-800">
        {value}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// Users Pane — unchanged
// ------------------------------------------------------
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed to fetch users`);

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
    // eslint-disable-next-line
  }, []);

  const createUser = async () => {
    const first_name = prompt("Enter first name:") || "";
    const last_name = prompt("Enter last name:") || "";
    const email = prompt("Enter email:") || "";
    const password = prompt("Enter password:") || "";
    const role =
      prompt("Enter role (admin, employee, visitor):", "visitor") || "visitor";

    if (!email || !password) return alert("Email and password are required.");

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          role,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");

      await fetchUsers();
      alert("User created.");
    } catch (e) {
      alert("Error: " + e.message);
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");

      setUsers((prev) => prev.filter((u) => u.user_id !== id));
    } catch (e) {
      alert("Error deleting user: " + e.message);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-800">
          User Management
        </h2>
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

          <button
            onClick={fetchUsers}
            className="px-3 py-2 rounded-lg text-sm bg-neutral-200 hover:bg-neutral-300"
          >
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
