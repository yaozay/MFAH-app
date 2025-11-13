import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";

const API = import.meta.env.VITE_API_BASE;

export default function Reports() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [artworksPerArtist, setArtworksPerArtist] = useState([]);
  const [modernArtworks, setModernArtworks] = useState([]);
  const [collectionValue, setCollectionValue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingCollection, setLoadingCollection] = useState(false);

  // ===== Artworks per Artist filters =====
  const [artistQ, setArtistQ] = useState("");
  const [artistSort, setArtistSort] = useState("artwork_count"); // artwork_count | artist_id
  const [artistDir, setArtistDir] = useState("desc");
  const [artistApplied, setArtistApplied] = useState({
    q: "",
    sort: "artwork_count",
    dir: "desc",
  });

  // ===== Modern Artworks filters =====
  const [modernQ, setModernQ] = useState("");
  const [modernFromYear, setModernFromYear] = useState("");
  const [modernToYear, setModernToYear] = useState("");
  const [modernSort, setModernSort] = useState("year_created"); // year_created | estimated_price
  const [modernDir, setModernDir] = useState("asc");
  const [modernApplied, setModernApplied] = useState({
    q: "",
    fromYear: "",
    toYear: "",
    sort: "year_created",
    dir: "asc",
  });

  // ===== Collection Value filters =====
  const [colFrom, setColFrom] = useState("");
  const [colTo, setColTo] = useState("");
  const [colQ, setColQ] = useState("");
  const [colSort, setColSort] = useState("total_collection_value"); // total_collection_value | total_artworks
  const [colDir, setColDir] = useState("desc");
  const [collectionApplied, setCollectionApplied] = useState({
    q: "",
    from: "",
    to: "",
    sort: "total_collection_value",
    dir: "desc",
  });

  // ===== Exhibition Popularity filters (unchanged logic) =====
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

  // Small helper to build & download CSV on the client
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

  // ===== INITIAL: basic data fetches (no filters) =====
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API}/api/reports/artworks-per-artist`, {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }),
          fetch(`${API}/api/reports/modern-artworks`, {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
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

  // ===== Collection Value fetch (now uses applied.from/to on Apply) =====
  useEffect(() => {
    const fetchCollectionValue = async () => {
      setLoadingCollection(true);

      const p = new URLSearchParams();
      if (collectionApplied.from) p.set("from", collectionApplied.from);
      if (collectionApplied.to) p.set("to", collectionApplied.to);

      try {
        const res = await fetch(
          `${API}/api/reports/collection-value?${p.toString()}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }
        );
        const json = await res.json();
        setCollectionValue(json);
      } catch (err) {
        console.error("collection value fetch err", err);
      } finally {
        setLoadingCollection(false);
      }
    };

    fetchCollectionValue();
  }, [token, collectionApplied]);

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

  // ===== Modern Artworks: apply filters + sort on client =====
  const filteredModernArtworks = useMemo(() => {
    let rows = [...modernArtworks];

    const term = modernApplied.q.trim().toLowerCase();
    if (term) {
      rows = rows.filter((art) => {
        const title = (art.title || "").toLowerCase();
        const type = (art.art_type || "").toLowerCase();
        return title.includes(term) || type.includes(term);
      });
    }

    const fromY = modernApplied.fromYear
      ? parseInt(modernApplied.fromYear, 10)
      : null;
    const toY = modernApplied.toYear
      ? parseInt(modernApplied.toYear, 10)
      : null;

    if (fromY !== null) {
      rows = rows.filter((art) => {
        const y = parseInt(art.year_created, 10);
        return Number.isFinite(y) ? y >= fromY : true;
      });
    }

    if (toY !== null) {
      rows = rows.filter((art) => {
        const y = parseInt(art.year_created, 10);
        return Number.isFinite(y) ? y <= toY : true;
      });
    }

    rows.sort((a, b) => {
      let av;
      let bv;

      switch (modernApplied.sort) {
        case "estimated_price":
          av = Number(a.estimated_price ?? 0);
          bv = Number(b.estimated_price ?? 0);
          break;
        case "year_created":
        default:
          av = Number(a.year_created ?? 0);
          bv = Number(b.year_created ?? 0);
          break;
      }

      if (av < bv) return modernApplied.dir === "asc" ? -1 : 1;
      if (av > bv) return modernApplied.dir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [modernArtworks, modernApplied]);

  // ===== Collection Value: apply name filter + sort on client =====
  const filteredCollectionValue = useMemo(() => {
    let rows = [...collectionValue];

    const term = collectionApplied.q.trim().toLowerCase();
    if (term) {
      rows = rows.filter((c) =>
        (c.collection_name || "").toLowerCase().includes(term)
      );
    }

    rows.sort((a, b) => {
      let av;
      let bv;

      switch (collectionApplied.sort) {
        case "total_artworks":
          av = Number(a.total_artworks ?? 0);
          bv = Number(b.total_artworks ?? 0);
          break;
        case "total_collection_value":
        default:
          av = Number(a.total_collection_value ?? 0);
          bv = Number(b.total_collection_value ?? 0);
          break;
      }

      if (av < bv) return collectionApplied.dir === "asc" ? -1 : 1;
      if (av > bv) return collectionApplied.dir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [collectionValue, collectionApplied]);

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

  // ===== Apply handlers =====
  const onApplyArtists = (e) => {
    e.preventDefault();
    setArtistApplied({
      q: artistQ,
      sort: artistSort,
      dir: artistDir,
    });
  };

  const onApplyModern = (e) => {
    e.preventDefault();
    setModernApplied({
      q: modernQ,
      fromYear: modernFromYear,
      toYear: modernToYear,
      sort: modernSort,
      dir: modernDir,
    });
  };

  const onApplyCollection = (e) => {
    e.preventDefault();
    setCollectionApplied((prev) => ({
      ...prev,
      q: colQ,
      from: colFrom,
      to: colTo,
      sort: colSort,
      dir: colDir,
    }));
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

  const downloadModernCsv = () => {
    if (!filteredModernArtworks.length) {
      alert("No data to export.");
      return;
    }

    downloadCsvFile(
      "modern_artworks.csv",
      ["title", "year_created", "art_type", "estimated_price"],
      filteredModernArtworks.map((r) => [
        r.title,
        r.year_created,
        r.art_type,
        r.estimated_price,
      ])
    );
  };

  const downloadCollectionCsv = () => {
    if (!filteredCollectionValue.length) {
      alert("No data to export.");
      return;
    }

    downloadCsvFile(
      "collection_value.csv",
      ["collection_id", "collection_name", "total_artworks", "total_value"],
      filteredCollectionValue.map((r) => [
        r.collection_id,
        r.collection_name,
        r.total_artworks,
        Number(r.total_collection_value ?? 0).toFixed(2),
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
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
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

  const totalPages = Math.max(
    1,
    Math.ceil(
      (popData.total || 0) /
        (popData.pageSize || applied.pageSize || 10)
    )
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
            {/* Filters (same behavior as before) */}
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

            {/* New table: Artist + Collection + Count + Value */}
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



      {/* Modern Artworks */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12">
        <div className="border-b border-neutral-200 px-6 py-4 bg-rose-600">
          <h2 className="text-2xl font-serif text-white">
            Modern Artworks (After 1900)
          </h2>
          <p className="text-sm text-rose-100">
            Contemporary and modern art pieces
          </p>
        </div>

        {modernArtworks.length > 0 ? (
          <>
            <form
              className="flex flex-wrap gap-3 items-end p-6"
              onSubmit={onApplyModern}
            >
              <input
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-600 focus:outline-none"
                placeholder="Search title or type..."
                value={modernQ}
                onChange={(e) => setModernQ(e.target.value)}
              />
              <input
                type="number"
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-24"
                placeholder="From year"
                value={modernFromYear}
                onChange={(e) => setModernFromYear(e.target.value)}
              />
              <input
                type="number"
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-24"
                placeholder="To year"
                value={modernToYear}
                onChange={(e) => setModernToYear(e.target.value)}
              />
              <select
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={modernSort}
                onChange={(e) => setModernSort(e.target.value)}
              >
                <option value="year_created">Year</option>
                <option value="estimated_price">Estimated Value</option>
              </select>
              <select
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                value={modernDir}
                onChange={(e) => setModernDir(e.target.value)}
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
                onClick={downloadModernCsv}
              >
                Download CSV
              </button>
            </form>

            <div className="overflow-x-auto px-6 pb-6">
              <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-xl">
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
                    {filteredModernArtworks.length ? (
                      filteredModernArtworks.map((art, i) => (
                        <tr
                          key={i}
                          className="border-t border-neutral-200"
                        >
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
                              ? fmtCurrency(art.estimated_price)
                              : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-neutral-500"
                        >
                          No artworks match your filters.
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

      {/* Collection Value Report */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-12">
        <div className="border-b border-neutral-200 px-6 py-4 bg-rose-600">
          <h2 className="text-2xl font-serif text-white">
            Collection Value Report
          </h2>
          <p className="text-sm text-rose-100">
            Total value of each collection — filter by acquisition date
          </p>
        </div>

        {/* Filters: date + search + sort + buttons */}
        <form
          className="flex flex-wrap gap-3 items-end p-6"
          onSubmit={onApplyCollection}
        >
          <input
            type="date"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={colFrom}
            onChange={(e) => setColFrom(e.target.value)}
          />
          <input
            type="date"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={colTo}
            onChange={(e) => setColTo(e.target.value)}
          />
          <input
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-600 focus:outline-none"
            placeholder="Search collection name..."
            value={colQ}
            onChange={(e) => setColQ(e.target.value)}
          />
          <select
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={colSort}
            onChange={(e) => setColSort(e.target.value)}
          >
            <option value="total_collection_value">Total Value</option>
            <option value="total_artworks">Artworks</option>
          </select>
          <select
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            value={colDir}
            onChange={(e) => setColDir(e.target.value)}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
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
            onClick={downloadCollectionCsv}
          >
            Download CSV
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto px-6 pb-6">
          {loadingCollection ? (
            <p className="p-6 text-neutral-500">Loading...</p>
          ) : filteredCollectionValue.length ? (
            <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-black">
                      Collection
                    </th>
                    <th className="px-6 py-3 text-left text-black">
                      Artworks
                    </th>
                    <th className="px-6 py-3 text-left text-black">
                      Total Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollectionValue.map((c) => (
                    <tr
                      key={c.collection_id}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-6 py-3 font-semibold text-black">
                        {c.collection_name}
                      </td>
                      <td className="px-6 py-3 text-neutral-600">
                        {c.total_artworks}
                      </td>
                      <td className="px-6 py-3 text-rose-600 font-medium">
                        {c.total_collection_value
                          ? fmtCurrency(c.total_collection_value)
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
        </div>
      </section>

      {/* Exhibition Popularity */}
      <section className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-4 bg-rose-600">
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

        {/* Table */}
        <div className="overflow-x-auto px-6 pb-6">
          <table className="min-w-full text-sm border-t border-neutral-200">
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
                    r.run_days ??
                    calcRunDays(r.start_date, r.end_date);
                  return (
                    <tr
                      key={i}
                      className="border-b border-neutral-200"
                    >
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
      </section>
    </div>
  );
}

