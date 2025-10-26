
/*const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:4000";

export default function DashboardAdmin() {
  const download = async (path, filename) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p>Full control over Artists, Artworks, and Reports.</p>

      <div className="flex gap-3">
        <button
          onClick={() =>
            download("/api/reports/employees.csv", "employees.csv")
          }
          className="bg-violet-600 text-white px-4 py-2 rounded-xl shadow hover:opacity-90 transition"
        >
          Download Employee List (CSV)
        </button>
      </div>
    </div>
  );
}

*/


import { useEffect, useMemo, useState } from "react";

const token = localStorage.getItem("token")

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:4000";

export default function DashboardAdmin() {
  // ---- STAGED (what the user is editing) ----
  const [q, setQ] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("id");
  const [dir, setDir] = useState("asc");
  const [pageSize, setPageSize] = useState(10);

  // ---- APPLIED (what the table is actually using) ----
  const [applied, setApplied] = useState({
    q: "",
    departmentId: "",
    role: "",
    sort: "id",
    dir: "asc",
    page: 1,
    pageSize: 10,
  });

  // data
  const [data, setData] = useState({
    rows: [],
    total: 0,
    page: 1,
    pageSize: 10,
    error: null,
  });
  const [loading, setLoading] = useState(false);

  // build query string from APPLIED filters
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

  // fetch whenever APPLIED query changes
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/reports/employees?${query}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          if (!ignore)
            setData((d) => ({
              ...d,
              rows: [],
              total: 0,
              error: `Request failed: ${res.status}`,
            }));
          return;
        }
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

  // submit handler: applies staged -> applied (Enter key or button)
  const onApply = (e) => {
    e.preventDefault(); // lets Enter submit without page reload
    setApplied((prev) => ({
      ...prev,
      q,
      departmentId,
      role,
      sort,
      dir,
      page: 1, // reset to first page on new filters
      pageSize,
    }));
  };

  // download with applied filters
  const downloadCsv = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports/employees?${query}&format=csv`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // <-- ADD
        },
      });
      if (!res.ok) throw new Error(`Failed to download CSV (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employees.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil((data.total || 0) / (data.pageSize || applied.pageSize || 10))
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p>Full control over Artists, Artworks, and Reports.</p>

      <h1 className="text-l font-semibold">Employee Search</h1>
      {/* Filters (press Enter to apply) */}
      <form className="flex flex-wrap gap-2 items-end" onSubmit={onApply}>
        <input
          className="input"
          placeholder="Search name/email/phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="input"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="1">Administration / IT</option>
          <option value="2">Curatorial</option>
          <option value="3">Exhibitions & Events</option>
          <option value="4">Visitor Services / Ticketing</option>
          <option value="5">Retail / Museum Shop</option>
          <option value="6">Development / Fundraising</option>
        </select>

        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="curator">curator</option>
          <option value="manager">manager</option>
          <option value="security">security</option>
          <option value="guide">guide</option>
        </select>

        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="id">ID</option>
          <option value="name">Last Name</option>
          <option value="role">Role</option>
          <option value="dept">Department</option>
          <option value="hired">Hire Date</option>
        </select>

        
        <select
          className="input"
          value={dir}
          onChange={(e) => setDir(e.target.value)}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        

        <select
          className="input w-28"
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
          }}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        {/* Pressing Enter anywhere in this form triggers this submit button */}
        <button type="submit" className="btn bg-violet-600 text-white">
          Apply to see changes
        </button>

        {/* Download does NOT submit the form */}
        <button
          type="button"
          className="btn bg-violet-600 text-white"
          onClick={downloadCsv}
        >
           Download CSV
        </button>
      </form>

      {/* Table (render your rows) */}
      <div className="rounded-xl border border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-4">Loading…</div>
        ) : data.error ? (
          <div className="p-4 text-red-400">{data.error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">First</th>
                <th className="px-3 py-2 text-left">Last</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.employee_id} className="border-t border-neutral-800">
                  <td className="px-3 py-2">{r.employee_id}</td>
                  <td className="px-3 py-2">{r.first_name}</td>
                  <td className="px-3 py-2">{r.last_name}</td>
                  <td className="px-3 py-2">{r.employee_role}</td>
                  <td className="px-3 py-2">{r.department_name}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.phone}</td> 
                </tr>
              ))}
              {!loading && data.rows.length === 0 && (
                <tr>
                  <td className="px-3 py-4" colSpan={6}>
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination (drives APPLIED state) */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost"
          disabled={applied.page <= 1}
          onClick={() =>
            setApplied((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
          }
        >
          Prev
        </button>
        <span>
          Page {data.page} of {totalPages}
        </span>
        <button
          className="btn btn-ghost"
          disabled={applied.page >= totalPages}
          onClick={() => setApplied((p) => ({ ...p, page: p.page + 1 }))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
