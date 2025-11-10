import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";

const API = import.meta.env.VITE_API_BASE;

export default function Reports() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [artworksPerArtist, setArtworksPerArtist] = useState([]);
  const [modernArtworks, setModernArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState(""); 
  const [toDate, setToDate] = useState("");     
  const [sort, setSort] = useState("total_revenue");
  const [dir, setDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const [applied, setApplied] = useState({
    q: "",
    from: "",
    to: "",
    sort: "total_revenue",
    dir: "desc",
    page: 1,
    pageSize: 10,
  });

  const [popData, setPopData] = useState({
    rows: [],
    total: 0,
    page: 1,
    pageSize: 10,
    error: null,
    loading: false,
  });

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
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">

      <h1 className="text-3xl font-serif mb-6 text-neutral-800">
        Reports Dashboard
      </h1>


      {/* Artworks per Artist */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12">

        <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-50">
          <h2 className="text-2xl font-serif text-black">Artworks per Artist</h2>
          <p className="text-sm text-neutral-500">
            Collection distribution by artist
          </p>
        </div>

        {artworksPerArtist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-black">Artist ID</th>
                  <th className="px-6 py-3 text-left text-black">Artist Name</th>
                  <th className="px-6 py-3 text-left text-black">Artwork Count</th>
                </tr>
              </thead>
              <tbody>
                {artworksPerArtist.map((a) => (
                  <tr key={a.artist_id} className="border-t border-neutral-200">
                    <td className="px-6 py-3 text-neutral-600">#{a.artist_id}</td>
                    <td className="px-6 py-3 font-semibold text-black">
                      {a.artist_name}
                    </td>
                    <td className="px-6 py-3 text-rose-600 font-medium">
                      {a.artwork_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-8 py-12 text-center text-neutral-500">
            No data available.
          </div>
        )}
      </section>

      {/* Modern Artworks */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12">

        <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-50">
          <h2 className="text-2xl font-serif text-black">
            Modern Artworks (After 1900)
          </h2>
          <p className="text-sm text-neutral-500">
            Contemporary and modern art pieces
          </p>
        </div>

        {modernArtworks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-black">Title</th>
                  <th className="px-6 py-3 text-left text-black">Year</th>
                  <th className="px-6 py-3 text-left text-black">Type</th>
                  <th className="px-6 py-3 text-left text-black">
                    Estimated Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {modernArtworks.map((art, i) => (
                  <tr key={i} className="border-t border-neutral-200">
                    <td className="px-6 py-3 font-semibold text-black">
                      {art.title}
                    </td>
                    <td className="px-6 py-3 text-neutral-600">
                      {art.year_created || "—"}
                    </td>
                    <td className="px-6 py-3 text-neutral-600">
                      {art.art_type || "—"}
                    </td>
                    <td className="px-6 py-3 text-rose-600 font-medium">
                      {art.estimated_price
                        ? `$${Number(art.estimated_price).toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-8 py-12 text-center text-neutral-500">
            No data available.
          </div>
        )}
      </section>

      {/* Exhibition Popularity */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-50">
          <h2 className="text-2xl font-serif text-black">Exhibition Popularity</h2>
          <p className="text-sm text-neutral-500">
            Title search, date filters, sorting & CSV export
          </p>
        </div>

        {/* Filters */}
        <form className="flex flex-wrap gap-3 items-end p-6" onSubmit={onApply}>
          <input
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-600 focus:outline-none"
            placeholder="Search title..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            type="date"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <select
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="title">Title</option>
            <option value="run_days">Run Days</option>
            <option value="total_tickets">Total Tickets</option>
            <option value="total_revenue">Total Revenue</option>
          </select>
          <select
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={dir}
            onChange={(e) => setDir(e.target.value)}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <button
            type="submit"
            className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-rose-700 transition"
          >
            Apply
          </button>
          <button
            type="button"
            className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-rose-700 transition"
            onClick={downloadCsv}
          >
            Download CSV
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto px-6 pb-6">
          <table className="min-w-full text-sm border-t border-neutral-200">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-3 text-left text-black">Exhibition</th>
                <th className="px-4 py-3 text-left text-black">Start</th>
                <th className="px-4 py-3 text-left text-black">End</th>
                <th className="px-4 py-3 text-left text-black">Run Days</th>
                <th className="px-4 py-3 text-left text-black">Tickets</th>
                <th className="px-4 py-3 text-left text-black">Revenue</th>
                <th className="px-4 py-3 text-left text-black">Adult</th>
                <th className="px-4 py-3 text-left text-black">Senior</th>
                <th className="px-4 py-3 text-left text-black">Youth</th>
                <th className="px-4 py-3 text-left text-black">Child</th>
              </tr>
            </thead>
            <tbody>
              {popData.rows.length ? (
                popData.rows.map((r, i) => {
                  const runDays =
                    r.run_days ?? calcRunDays(r.start_date, r.end_date);
                  return (
                    <tr key={i} className="border-b border-neutral-200">
                      <td className="px-4 py-3 font-semibold text-black">
                        {r.title || "—"}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {fmtDateMMDDYYYY(r.start_date)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {fmtDateMMDDYYYY(r.end_date)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {fmtInt(runDays)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {fmtInt(r.total_tickets)}
                      </td>
                      <td className="px-4 py-3 text-rose-600 font-medium">
                        {fmtCurrency(r.total_revenue)}
                      </td>
                      <td className="px-4 py-3">{fmtInt(r.adult)}</td>
                      <td className="px-4 py-3">{fmtInt(r.senior)}</td>
                      <td className="px-4 py-3">{fmtInt(r.youth)}</td>
                      <td className="px-4 py-3">{fmtInt(r.child)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-neutral-500"
                    colSpan={10}
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

}
