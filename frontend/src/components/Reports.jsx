import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE;

export default function Reports() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [artworksPerArtist, setArtworksPerArtist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/unauthorized");
  }, [user]);


  // ===== Artworks per Artist filters =====
  const [artistQ, setArtistQ] = useState("");
  const [artistSort, setArtistSort] = useState("artwork_count");
  const [artistDir, setArtistDir] = useState("desc");
  const [artistApplied, setArtistApplied] = useState({
    q: "",
    sort: "artwork_count",
    dir: "desc",
  });

  // Giftshop Report states
  const [giftshopStart, setGiftshopStart] = useState("");
  const [giftshopEnd, setGiftshopEnd] = useState("");
  const [productList, setProductList] = useState([]);
  const [giftshopProductId, setGiftshopProductId] = useState("");

  const [giftshopReport, setGiftshopReport] = useState(null);
  const [giftshopReportLoading, setGiftshopReportLoading] = useState(false);
  const [giftshopReportError, setGiftshopReportError] = useState("");
  const [giftshopPage, setGiftshopPage] = useState(1);

  // ===== Exhibition Popularity filters =====
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

  // =========================
  // Revenue Report
  // =========================
  const [revenue, setRevenue] = useState([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState("");

  const [revTotals, setRevTotals] = useState({
    tickets: 0,
    memberships: 0,
    giftshop: 0,
    grand_total: 0,
  });

  const [revQuery, setRevQuery] = useState("");
  const [revType, setRevType] = useState("");
  const [revStart, setRevStart] = useState("");
  const [revEnd, setRevEnd] = useState("");

  const loadRevenue = async () => {
    setRevLoading(true);
    setRevError("");

    try {
      const params = new URLSearchParams();
      if (revQuery) params.set("q", revQuery);
      if (revType) params.set("type", revType);
      if (revStart) params.set("start", revStart);
      if (revEnd) params.set("end", revEnd);

      const res = await fetch(
        `${API}/api/revenue-detailed?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load revenue");

      setRevenue(json.rows || []);
      setRevTotals(json.totals || {});
    } catch (err) {
      setRevError(String(err.message));
      setRevenue([]);
      setRevTotals({
        tickets: 0,
        memberships: 0,
        giftshop: 0,
        grand_total: 0,
      });
    } finally {
      setRevLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  // ===== Format helpers =====
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(Number.isFinite(Number(n)) ? Number(n) : 0);

  const fmtInt = (n) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(n ?? 0);

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


  const downloadCsvFile = (filename, header, rows) => {
    const escapeCell = (v) => {
      const s = (v ?? "").toString();
      const escaped = s.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    };

    const lines = [
      header.join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API}/api/reports/artworks-per-artist`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) throw new Error("Error fetching reports");

        const data1 = await res.json();
        setArtworksPerArtist(data1);
      } catch (err) {
        console.error("Reports fetch error:", err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ===== Artworks per Artist: apply filters + sort on client =====
  const filteredArtworksPerArtist = useMemo(() => {
    let rows = [...artworksPerArtist];

    const term = artistApplied.q.trim().toLowerCase();
    if (term) {
      rows = rows.filter((a) => {
        const name = (a.artist_name || "").toLowerCase();
        const idStr = String(a.artist_id ?? "");
        return name.includes(term) || idStr.includes(term);
      });
    }

    rows.sort((a, b) => {
      let av;
      let bv;

      switch (artistApplied.sort) {
        case "artist_id":
          av = Number(a.artist_id ?? 0);
          bv = Number(b.artist_id ?? 0);
          break;
        case "artwork_count":
        default:
          av = Number(a.artwork_count ?? 0);
          bv = Number(b.artwork_count ?? 0);
          break;
      }

      if (av < bv) return artistApplied.dir === "asc" ? -1 : 1;
      if (av > bv) return artistApplied.dir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [artworksPerArtist, artistApplied]);

  // ===== Artworks per Artist: summary =====
  const artworksSummary = useMemo(() => {
    if (!filteredArtworksPerArtist.length) return null;

    const artistIds = new Set();
    const collectionIds = new Set();
    let totalArtworks = 0;
    let totalValue = 0;

    let topArtistRow = null;
    let topCollectionRow = null;

    for (const row of filteredArtworksPerArtist) {
      if (row.artist_id != null) artistIds.add(row.artist_id);
      if (row.collection_id != null) collectionIds.add(row.collection_id);

      const count = Number(row.artwork_count ?? 0);
      const value = Number(row.total_value ?? 0);

      totalArtworks += count;
      totalValue += value;

      if (!topArtistRow || count > Number(topArtistRow.artwork_count ?? 0)) {
        topArtistRow = row;
      }

      if (!topCollectionRow || value > Number(topCollectionRow.total_value ?? 0)) {
        topCollectionRow = row;
      }
    }

    return {
      artistCount: artistIds.size,
      collectionCount: collectionIds.size,
      totalArtworks,
      totalValue,
      topArtistName: topArtistRow?.artist_name ?? null,
      topArtistCount: topArtistRow?.artwork_count ?? 0,
      topCollectionName: topCollectionRow?.collection_name ?? null,
      topCollectionValue: topCollectionRow?.total_value ?? 0,
    };
  }, [filteredArtworksPerArtist]);

  // ===== Exhibition Popularity query string =====
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

  // ===== Exhibition Popularity fetch =====
  useEffect(() => {
    let ignore = false;

    const fetchPopularity = async () => {
      setPopData((d) => ({ ...d, loading: true, error: null }));

      try {
        const res = await fetch(
          `${API}/api/reports/exhibition-popularity?${popQuery}`,
          {
            credentials: "include",
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }
        );

        if (!res.ok)
          throw new Error(`Popularity request failed: ${res.status}`);

        const json = await res.json();

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
  }, [token, popQuery, applied.page, applied.pageSize]);

  // ===== Exhibition Popularity=====
  const exhibitionSummary = useMemo(() => {
    const rows = popData.rows || [];
    if (!rows.length) return null;

    let totalVisitors = 0;
    let totalRevenue = 0;
    let topExhibitionRow = null;

    for (const r of rows) {
      const visitors = Number(r.total_tickets ?? 0);
      const revenue = Number(r.total_revenue ?? 0);

      totalVisitors += visitors;
      totalRevenue += revenue;

      if (
        !topExhibitionRow ||
        visitors > Number(topExhibitionRow.total_tickets ?? 0)
      ) {
        topExhibitionRow = r;
      }
    }

    return {
      exhibitionsCount: rows.length,
      totalVisitors,
      totalRevenue,
      topExhibitionTitle: topExhibitionRow?.title ?? null,
      topExhibitionVisitors: topExhibitionRow?.total_tickets ?? 0,
    };
  }, [popData.rows]);

  async function loadGiftshopReport() {
    setGiftshopReportError("");

    if (!giftshopStart || !giftshopEnd) {
      setGiftshopReportError("Please choose a start and end date.");
      return;
    }

    setGiftshopReportLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("start", giftshopStart);
      params.set("end", giftshopEnd);
      if (giftshopProductId) params.set("product_id", giftshopProductId);

      const res = await fetch(
        `${API}/api/giftshop/report?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load report");

      setGiftshopReport(json);
      setGiftshopPage(1);
    } catch (err) {
      setGiftshopReportError(err.message);
    } finally {
      setGiftshopReportLoading(false);
    }
  }


  const onApplyArtists = (e) => {
    e.preventDefault();
    setArtistApplied({
      q: artistQ,
      sort: artistSort,
      dir: artistDir,
    });
  };

  const onApplyPopularity = (e) => {
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

  // ===== CSV downloads for each report =====
  const downloadArtistsCsv = () => {
    if (!filteredArtworksPerArtist.length) {
      alert("No data to export.");
      return;
    }

    downloadCsvFile(
      "artworks_per_artist.csv",
      ["artist_id", "artist_name", "artwork_count"],
      filteredArtworksPerArtist.map((r) => [
        r.artist_id,
        r.artist_name,
        r.artwork_count,
      ])
    );
  };

  const downloadPopularityCsv = async () => {
    try {
      const res = await fetch(
        `${API}/api/reports/exhibition-popularity?${popQuery}&format=csv`,
        {
          method: "GET",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to download CSV (${res.status})`);
      }

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

  // (Optional) total pages for popularity (if you add pagination UI later)
  const totalPages = Math.max(
    1,
    Math.ceil(
      (popData.total || 0) /
      (popData.pageSize || applied.pageSize || 10)
    )
  );

  // ===== Giftshop pagination helpers (10 per page) =====
  const GIFT_PAGE_SIZE = 10;
  const giftshopResults = giftshopReport?.results || [];
  const giftshopTotal = giftshopResults.length;
  const giftshopTotalPages =
    giftshopTotal > 0
      ? Math.max(1, Math.ceil(giftshopTotal / GIFT_PAGE_SIZE))
      : 1;
  const giftshopStartIndex = (giftshopPage - 1) * GIFT_PAGE_SIZE;
  const giftshopEndIndex = giftshopPage * GIFT_PAGE_SIZE;
  const giftshopPageRows = giftshopResults.slice(
    giftshopStartIndex,
    giftshopEndIndex
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
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12 mt-4">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4 bg-rose-600">
          <h2 className="text-2xl font-serif text-white">
            Financial Revenue Report
          </h2>
          <p className="text-sm text-rose-100">
            Tickets • Memberships • Gift Shop • Customer transactions
          </p>
        </div>

        {/* Filters */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadRevenue();
          }}
          className="flex flex-wrap gap-3 items-end p-6"
        >
          <input
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm flex-1"
            placeholder="Search customer or item…"
            value={revQuery}
            onChange={(e) => setRevQuery(e.target.value)}
          />

          <select
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={revType}
            onChange={(e) => setRevType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="ticket">Ticket</option>
            <option value="membership">Membership</option>
            <option value="giftshop">Gift Shop</option>
          </select>

          <input
            type="date"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={revStart}
            onChange={(e) => setRevStart(e.target.value)}
          />

          <input
            type="date"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={revEnd}
            onChange={(e) => setRevEnd(e.target.value)}
          />

          <button
            type="submit"
            className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-rose-700 transition"
          >
            Apply
          </button>
        </form>

        {/* Summary */}
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-2 text-sm">
            <p>
              <strong>Ticket Revenue:</strong>{" "}
              {fmtCurrency(revTotals.tickets)}
            </p>
            <p>
              <strong>Membership Revenue:</strong>{" "}
              {fmtCurrency(revTotals.memberships)}
            </p>
            <p>
              <strong>Gift Shop Revenue:</strong>{" "}
              {fmtCurrency(revTotals.giftshop)}
            </p>
            <p>
              <strong>Grand Total:</strong>{" "}
              <span className="text-rose-600 font-semibold">
                {fmtCurrency(revTotals.grand_total)}
              </span>
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-6 pb-6">
          <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-xl">
            {revLoading ? (
              <div className="p-4 text-neutral-500">Loading…</div>
            ) : revError ? (
              <div className="p-4 text-red-500">{revError}</div>
            ) : revenue.length === 0 ? (
              <div className="p-4 text-neutral-500">
                No transactions found.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-black">Date</th>
                    <th className="px-6 py-3 text-left text-black">Customer</th>
                    <th className="px-6 py-3 text-left text-black">Type</th>
                    <th className="px-6 py-3 text-left text-black">Item</th>
                    <th className="px-6 py-3 text-left text-black">Qty</th>
                    <th className="px-6 py-3 text-left text-black">Unit Price</th>
                    <th className="px-6 py-3 text-left text-black">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((row) => (
                    <tr
                      key={`${row.transaction_type}-${row.transaction_id}`}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-6 py-3">
                        {row.transaction_date
                          ? fmtDateMMDDYYYY(row.transaction_date)
                          : "—"}
                      </td>
                      <td className="px-6 py-3">{row.customer_name}</td>
                      <td className="px-6 py-3 capitalize">
                        {row.transaction_type}
                      </td>
                      <td className="px-6 py-3">{row.item_name}</td>
                      <td className="px-6 py-3">{row.quantity}</td>
                      <td className="px-6 py-3 text-rose-600 font-medium">
                        {fmtCurrency(row.unit_price)}
                      </td>
                      <td className="px-6 py-3 text-rose-600 font-medium">
                        {fmtCurrency(row.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>


      {/* Giftshop Sales Report */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4 bg-rose-600">
          <h2 className="text-2xl font-serif text-white">
            Giftshop Sales Report
          </h2>
          <p className="text-sm text-rose-100">
            Top/worst selling products, revenue breakdowns, and transaction
            details
          </p>
        </div>

        {/* Filters */}
        <form className="flex flex-wrap gap-3 items-end p-6">
          <div>
            <label className="text-sm text-neutral-600">Start Date</label>
            <input
              type="date"
              value={giftshopStart}
              onChange={(e) => setGiftshopStart(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">End Date</label>
            <input
              type="date"
              value={giftshopEnd}
              onChange={(e) => setGiftshopEnd(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          <button
            type="button"
            onClick={loadGiftshopReport}
            className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-rose-700 transition"
          >
            {giftshopReportLoading ? "Loading..." : "Generate"}
          </button>

          <button
            type="button"
            className="bg-rose-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-rose-700 transition"
            onClick={() => {
              if (!giftshopReport || !giftshopResults.length) {
                alert("No data to export.");
                return;
              }

              downloadCsvFile(
                "giftshop_report.csv",
                [
                  "transaction_id",
                  "sale_date",
                  "product_name",
                  "supplier_name",
                  "quantity",
                  "unit_price",
                  "total_price",
                ],
                giftshopResults.map((r) => [
                  r.transaction_id,
                  r.sale_date,
                  r.product_name,
                  r.supplier_name,
                  r.quantity,
                  Number(r.unit_price).toFixed(2),
                  Number(r.total_price).toFixed(2),
                ])
              );
            }}
          >
            Download CSV
          </button>

          {giftshopReportError && (
            <p className="text-red-600 text-sm w-full mt-2">
              {giftshopReportError}
            </p>
          )}
        </form>

        {/* Summary + Table */}
        {giftshopReport && (
          <div className="px-6 pb-6 space-y-4">
            <h3 className="text-lg font-semibold">Summary</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 text-sm">
              <p>
                <strong>Total Revenue:</strong>{" "}
                {fmtCurrency(giftshopReport.summary.totalRevenue)}
              </p>
              <p>
                <strong>Total Transactions:</strong>{" "}
                {giftshopReport.summary.totalTransactions}
              </p>
              <p>
                <strong>Products Sold:</strong>{" "}
                {giftshopReport.summary.productsSold}
              </p>

              <p>
                <strong>Best Grossing Item:</strong>{" "}
                {giftshopReport.summary.bestGrossingItem?.[0] || "—"}
              </p>
              <p>
                <strong>Worst Grossing Item:</strong>{" "}
                {giftshopReport.summary.worstGrossingItem?.[0] || "—"}
              </p>
              <p>
                <strong>Most Sold Item:</strong>{" "}
                {giftshopReport.summary.mostSoldItem?.[0] || "—"}
              </p>
              <p>
                <strong>Least Sold Item:</strong>{" "}
                {giftshopReport.summary.leastSoldItem?.[0] || "—"}
              </p>
              <p>
                <strong>Top Grossing Supplier:</strong>{" "}
                {giftshopReport.summary.bestSupplier?.[0] || "—"}
              </p>

              <p>
                <strong>Lowest Grossing Supplier:</strong>{" "}
                {giftshopReport.summary.worstSupplier?.[0] || "—"}
              </p>

              <p>
                <strong>Most Sold Supplier:</strong>{" "}
                {giftshopReport.summary.mostSoldSupplier?.[0] || "—"}
              </p>

              <p>
                <strong>Least Sold Supplier:</strong>{" "}
                {giftshopReport.summary.leastSoldSupplier?.[0] || "—"}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-neutral-200 rounded-xl mt-6">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-black">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-black">Date</th>
                    <th className="px-6 py-3 text-left text-black">Product</th>
                    <th className="px-6 py-3 text-left text-black">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-black">Qty</th>
                    <th className="px-6 py-3 text-left text-black">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-black">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {giftshopPageRows.length ? (
                    giftshopPageRows.map((r) => (
                      <tr
                        key={r.transaction_id}
                        className="border-t border-neutral-200"
                      >
                        <td className="px-6 py-3">{r.transaction_id}</td>
                        <td className="px-6 py-3">
                          {fmtDateMMDDYYYY(r.sale_date)}
                        </td>
                        <td className="px-6 py-3">{r.product_name}</td>
                        <td className="px-6 py-3">{r.supplier_name}</td>
                        <td className="px-6 py-3">{r.quantity}</td>
                        <td className="px-6 py-3 text-rose-600 font-medium">
                          {fmtCurrency(r.unit_price)}
                        </td>
                        <td className="px-6 py-3 text-rose-600 font-medium">
                          {fmtCurrency(r.total_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-6 text-center text-neutral-500"
                      >
                        No transactions in this date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Giftshop Pagination Controls */}
            {giftshopTotal > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-700">
                <span>
                  Showing{" "}
                  <strong>
                    {giftshopTotal === 0
                      ? 0
                      : giftshopStartIndex + 1}
                    {"–"}
                    {Math.min(giftshopEndIndex, giftshopTotal)}
                  </strong>{" "}
                  of <strong>{giftshopTotal}</strong> transactions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100"
                    onClick={() =>
                      setGiftshopPage((p) => Math.max(1, p - 1))
                    }
                    disabled={giftshopPage <= 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page <strong>{giftshopPage}</strong> of{" "}
                    <strong>{giftshopTotalPages}</strong>
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100"
                    onClick={() =>
                      setGiftshopPage((p) =>
                        Math.min(giftshopTotalPages, p + 1)
                      )
                    }
                    disabled={giftshopPage >= giftshopTotalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Artworks per Artist & Collection */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12">
        <div className="border-b border-neutral-200 px-6 py-4 bg-rose-600">
          <h2 className="text-2xl font-serif text-white">
            Artworks per Artist &amp; Collection
          </h2>
          <p className="text-sm text-rose-100">
            How each artist is represented across MFAH collections
          </p>
        </div>

        {artworksPerArtist.length > 0 ? (
          <>
            {/* Filters */}
            <form
              className="flex flex-wrap gap-3 items-end p-6"
              onSubmit={onApplyArtists}
            >
              <input
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-600 focus:outline-none"
                placeholder="Search artist name or ID..."
                value={artistQ}
                onChange={(e) => setArtistQ(e.target.value)}
              />
              <select
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={artistSort}
                onChange={(e) => setArtistSort(e.target.value)}
              >
                <option value="artwork_count">Artwork Count</option>
                <option value="artist_id">Artist ID</option>
              </select>
              <select
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={artistDir}
                onChange={(e) => setArtistDir(e.target.value)}
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
                onClick={downloadArtistsCsv}
              >
                Download CSV
              </button>
            </form>

            {/* Summary */}
            {artworksSummary && (
              <div className="px-6 pb-2">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 text-sm">
                  <p>
                    <strong>Total Artists:</strong>{" "}
                    {fmtInt(artworksSummary.artistCount)}
                  </p>
                  <p>
                    <strong>Total Collections:</strong>{" "}
                    {fmtInt(artworksSummary.collectionCount)}
                  </p>
                  <p>
                    <strong>Total Artworks (rows):</strong>{" "}
                    {fmtInt(artworksSummary.totalArtworks)}
                  </p>
                  <p>
                    <strong>Total Estimated Value:</strong>{" "}
                    {fmtCurrency(artworksSummary.totalValue)}
                  </p>
                  <p>
                    <strong>Top Artist (by artworks):</strong>{" "}
                    {artworksSummary.topArtistName || "—"}{" "}
                    {artworksSummary.topArtistName && (
                      <span className="text-neutral-500">
                        (
                        {fmtInt(artworksSummary.topArtistCount)}
                        {" "}
                        works)
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Top Collection (by value):</strong>{" "}
                    {artworksSummary.topCollectionName || "—"}{" "}
                    {artworksSummary.topCollectionName && (
                      <span className="text-neutral-500">
                        (
                        {fmtCurrency(
                          artworksSummary.topCollectionValue
                        )}
                        )
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto px-6 pb-6">
              <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-black">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-black">
                        Collection
                      </th>
                      <th className="px-6 py-3 text-left text-black">
                        Artwork Count
                      </th>
                      <th className="px-6 py-3 text-left text-black">
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArtworksPerArtist.length ? (
                      filteredArtworksPerArtist.map((row) => (
                        <tr
                          key={`${row.artist_id}-${row.collection_id ?? "none"}`}
                          className="border-t border-neutral-200 bg-white"
                        >
                          <td className="px-6 py-3 font-semibold text-black">
                            {row.artist_name}
                          </td>
                          <td className="px-6 py-3 text-neutral-600">
                            {row.collection_name || "Not assigned"}
                          </td>
                          <td className="px-6 py-3 text-rose-600 font-medium">
                            {row.artwork_count ?? 0}
                          </td>
                          <td className="px-6 py-3 text-rose-600 font-medium">
                            {fmtCurrency(row.total_value || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-neutral-500"
                        >
                          No artists match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="px-8 py-12 text-center text-neutral-500">
            No data available.
          </div>
        )}
      </section>

      {/* Exhibition Popularity */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-6 py-4 bg-rose-600">
          <h2 className="text-2xl font-serif text-white">
            Exhibition Popularity
          </h2>
          <p className="text-sm text-rose-100">
            Title search, date filters, sorting & CSV export
          </p>
        </div>

        {/* Filters */}
        <form
          className="flex flex-wrap gap-3 items-end p-6"
          onSubmit={onApplyPopularity}
        >
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
            <option value="total_tickets">Visitors</option>
            <option value="total_revenue">Revenue</option>
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
            onClick={downloadPopularityCsv}
          >
            Download CSV
          </button>
        </form>

        {/* Summary */}
        {exhibitionSummary && (
          <div className="px-6 pb-2">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 text-sm">
              <p>
                <strong>Exhibitions in view:</strong>{" "}
                {fmtInt(exhibitionSummary.exhibitionsCount)}
              </p>
              <p>
                <strong>Total Visitors (current set):</strong>{" "}
                {fmtInt(exhibitionSummary.totalVisitors)}
              </p>
              <p>
                <strong>Total Revenue (current set):</strong>{" "}
                {fmtCurrency(exhibitionSummary.totalRevenue)}
              </p>
              <p>
                <strong>Top Exhibition (by visitors):</strong>{" "}
                {exhibitionSummary.topExhibitionTitle || "—"}{" "}
                {exhibitionSummary.topExhibitionTitle && (
                  <span className="text-neutral-500">
                    (
                    {fmtInt(exhibitionSummary.topExhibitionVisitors)}{" "}
                    visitors)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto px-6 pb-6">
          <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-4 py-3 text-left text-black">
                    Exhibition
                  </th>
                  <th className="px-4 py-3 text-left text-black">Start</th>
                  <th className="px-4 py-3 text-left text-black">End</th>
                  <th className="px-4 py-3 text-left text-black">
                    Run Days
                  </th>
                  <th className="px-4 py-3 text-left text-black">
                    Visitors
                  </th>
                  <th className="px-4 py-3 text-left text-black">
                    Top Ticket Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {popData.rows.length ? (
                  popData.rows.map((r, i) => {
                    const runDays =
                      r.run_days ?? calcRunDays(r.start_date, r.end_date);
                    return (
                      <tr key={i} className="border-t border-neutral-200">
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
                          {r.top_ticket_type || "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-neutral-500"
                      colSpan={6}
                    >
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
