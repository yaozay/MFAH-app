import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";

const API = import.meta.env.VITE_API_BASE;

export default function Reports() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // ===== Existing reports state =====
  const [artworksPerArtist, setArtworksPerArtist] = useState([]);
  const [modernArtworks, setModernArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== Exhibition Popularity: staged filters (like Employee Search) =====
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState("");     // YYYY-MM-DD
  const [sort, setSort] = useState("total_revenue");
  const [dir, setDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  // ===== Exhibition Popularity: applied filters =====
  const [applied, setApplied] = useState({
    q: "",
    from: "",
    to: "",
    sort: "total_revenue",
    dir: "desc",
    page: 1,
    pageSize: 10,
  });

  // ===== Exhibition Popularity: data =====
  const [popData, setPopData] = useState({
    rows: [],
    total: 0,
    page: 1,
    pageSize: 10,
    error: null,
    loading: false,
  });

  // ===== Helpers =====
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" })
      .format(Number.isFinite(Number(n)) ? Number(n) : 0);

  const fmtInt = (n) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n ?? 0);

  const fmtDateMMDDYYYY = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const calcRunDays = (startISO, endISO) => {
    const s = new Date(startISO);
    const e = new Date(endISO);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const ms = e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0);
    return ms >= 0 ? Math.floor(ms / (1000 * 60 * 60 * 24)) + 1 : null;
  };

  // ===== INITIAL: fetch the two existing reports (unchanged) =====
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API}/api/reports/artworks-per-artist`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          fetch(`${API}/api/reports/modern-artworks`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ]);

        if (!r1.ok || !r2.ok) throw new Error("Error fetching reports");

        const data1 = await r1.json();
        const data2 = await r2.json();

        setArtworksPerArtist(data1);
        setModernArtworks(data2);
      } catch (err) {
        console.error("Reports fetch error:", err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Build query string from APPLIED filters =====
  const popQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (applied.q) p.set("q", applied.q);
    if (applied.from) p.set("from", applied.from);
    if (applied.to) p.set("to", applied.to);
    p.set("sort", applied.sort);
    p.set("dir", applied.dir);
    p.set("page", String(applied.page));
    p.set("pageSize", String(applied.pageSize));
    return p.toString();
  }, [applied]);

  // ===== Fetch Exhibition Popularity whenever APPLIED changes =====
  useEffect(() => {
    let ignore = false;
    const fetchPopularity = async () => {
      setPopData((d) => ({ ...d, loading: true, error: null }));
      try {
        const res = await fetch(
          `${API}/api/reports/exhibition-popularity?${popQuery}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (!res.ok) throw new Error(`Popularity request failed: ${res.status}`);
        const json = await res.json();

        // Normalize: support either array OR { rows,total,page,pageSize }
        let rows = [];
        let total = 0;
        let page = applied.page;
        let pageSize = applied.pageSize;

        if (Array.isArray(json)) {
          rows = json;
          total = json.length;
          page = 1;
          pageSize = json.length || applied.pageSize;
        } else if (json && typeof json === "object") {
          rows = Array.isArray(json.rows) ? json.rows : [];
          total = Number(json.total ?? rows.length);
          page = Number(json.page ?? applied.page);
          pageSize = Number(json.pageSize ?? applied.pageSize);
        }

        if (!ignore) {
          setPopData({
            rows,
            total,
            page,
            pageSize,
            error: null,
            loading: false,
          });
        }
      } catch (err) {
        if (!ignore) {
          setPopData((d) => ({
            ...d,
            rows: [],
            total: 0,
            error: String(err?.message || err),
            loading: false,
          }));
        }
      }
    };

    fetchPopularity();
    return () => {
      ignore = true;
    };
  }, [API, token, popQuery, applied.page, applied.pageSize]);

  // ===== Apply (Enter or button) =====
  const onApply = (e) => {
    e.preventDefault();
    setApplied((prev) => ({
      ...prev,
      q,
      from: fromDate,
      to: toDate,
      sort,
      dir,
      page: 1,
      pageSize,
    }));
  };

  // ===== CSV Download (doesn't submit form) =====
  const downloadCsv = async () => {
    try {
      const res = await fetch(
        `${API}/api/reports/exhibition-popularity?${popQuery}&format=csv`,
        {
          method: "GET",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      if (!res.ok) throw new Error(`Failed to download CSV (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exhibition-popularity.csv";
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
    Math.ceil((popData.total || 0) / (popData.pageSize || applied.pageSize || 10))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 border-t-rose-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-8 py-6 rounded-xl shadow-lg max-w-md">
          <strong className="text-lg">Error:</strong>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-2">
          Reports Dashboard
        </h1>
        <p className="text-neutral-600 text-lg">
          Comprehensive analytics and insights
        </p>
      </div>

      {/* Artworks per Artist Report (unchanged) */}
      <section className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-100 to-amber-100 px-8 py-6 border-b-2 border-rose-200">
          <h2 className="text-2xl font-bold text-neutral-800">
            Artworks per Artist
          </h2>
          <p className="text-neutral-600 mt-1">Collection distribution by artist</p>
        </div>

        {artworksPerArtist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">Artist ID</th>
                  <th className="px-6 py-4 text-left">Artist Name</th>
                  <th className="px-6 py-4 text-left">Artwork Count</th>
                </tr>
              </thead>
              <tbody>
                {artworksPerArtist.map((a) => (
                  <tr key={a.artist_id}>
                    <td className="px-6 py-4 text-neutral-700">#{a.artist_id}</td>
                    <td className="px-6 py-4 font-semibold text-neutral-800">{a.artist_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {a.artwork_count} {a.artwork_count === 1 ? "piece" : "pieces"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-8 py-12 text-center text-neutral-500">
            <p>No data available.</p>
          </div>
        )}
      </section>

      {/* Modern Artworks Report (unchanged) */}
      <section className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-100 to-amber-100 px-8 py-6 border-b-2 border-rose-200">
          <h2 className="text-2xl font-bold text-neutral-800">
            Modern Artworks (After 1900)
          </h2>
          <p className="text-neutral-600 mt-1">Contemporary and modern art pieces</p>
        </div>

        {modernArtworks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">Year Created</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Estimated Value</th>
                </tr>
              </thead>
              <tbody>
                {modernArtworks.map((art, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 font-semibold text-neutral-800">{art.title}</td>
                    <td className="px-6 py-4 text-neutral-700">
                      {art.year_created ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                          {art.year_created}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{art.art_type || "—"}</td>
                    <td className="px-6 py-4">
                      {art.estimated_price ? (
                        <span className="font-bold text-emerald-600">
                          ${Number(art.estimated_price).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-8 py-12 text-center text-neutral-500">
            <p>No data available.</p>
          </div>
        )}
      </section>

      {/* ===== NEW: Exhibition Popularity (replaces Employee Directory) ===== */}
      <section className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-100 to-amber-100 px-8 py-6 border-b-2 border-rose-200">
          <h2 className="text-2xl font-bold text-neutral-800">Exhibition Popularity</h2>
          <p className="text-neutral-600 mt-1">
            Title search, date range filters, sorting & CSV export
          </p>
        </div>

        {/* Filters (press Enter to apply) — mirrors Admin Employee Search */}
        <form className="flex flex-wrap gap-2 items-end p-6" onSubmit={onApply}>
          <input
            className="input"
            placeholder="Search exhibition title"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">From</label>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">To</label>
            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="title">Title</option>
            <option value="run_days">Run Days</option>
            <option value="total_tickets">Total Tickets</option>
            <option value="total_revenue">Total Revenue</option>
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
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          <button type="submit" className="btn bg-rose-500 text-white">
            Apply to see changes
          </button>

          <button type="button" className="btn bg-rose-500 text-white" onClick={downloadCsv}>
            Download CSV
          </button>
        </form>

        {/* Table */}
        <div className="rounded-xl border border-neutral-200 mx-6 mb-6 overflow-x-auto">
          {popData.loading ? (
            <div className="p-4">Loading…</div>
          ) : popData.error ? (
            <div className="p-4 text-red-500">{popData.error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-3 py-2 text-left">Exhibition</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Run Days</th>
                  <th className="px-3 py-2 text-left">Total Tickets</th>
                  <th className="px-3 py-2 text-left">Total Revenue</th>
                  <th className="px-3 py-2 text-left">Adult</th>
                  <th className="px-3 py-2 text-left">Senior</th>
                  <th className="px-3 py-2 text-left">Youth</th>
                  <th className="px-3 py-2 text-left">Child</th>
                </tr>
              </thead>
              <tbody>
                {popData.rows.map((r, idx) => {
                  const runDays =
                    r.run_days ??
                    calcRunDays(r.start_date, r.end_date) ??
                    "—";
                  const totalTickets =
                    r.total_tickets ??
                    (["adult", "senior", "youth", "child"].reduce(
                      (acc, k) => acc + Number(r?.[k] ?? 0),
                      0
                    ) || 0);

                  return (
                    <tr key={r.exhibition_id ?? idx} className="border-t border-neutral-200">
                      <td className="px-3 py-2 font-semibold text-neutral-800">
                        {r.title || "—"}
                      </td>
                      <td className="px-3 py-2">{fmtDateMMDDYYYY(r.start_date)}</td>
                      <td className="px-3 py-2">{fmtDateMMDDYYYY(r.end_date)}</td>
                      <td className="px-3 py-2">{fmtInt(runDays)}</td>
                      <td className="px-3 py-2">{fmtInt(totalTickets)}</td>
                      <td className="px-3 py-2">{fmtCurrency(r.total_revenue)}</td>
                      <td className="px-3 py-2">{fmtInt(r.adult)}</td>
                      <td className="px-3 py-2">{fmtInt(r.senior)}</td>
                      <td className="px-3 py-2">{fmtInt(r.youth)}</td>
                      <td className="px-3 py-2">{fmtInt(r.child)}</td>
                    </tr>
                  );
                })}
                {!popData.loading && popData.rows.length === 0 && (
                  <tr>
                    <td className="px-3 py-4" colSpan={10}>
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 px-6 pb-6">
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
            Page {popData.page} of {totalPages}
          </span>
          <button
            className="btn btn-ghost"
            disabled={applied.page >= totalPages}
            onClick={() => setApplied((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
