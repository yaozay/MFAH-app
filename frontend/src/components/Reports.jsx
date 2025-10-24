import React, { useEffect, useState } from "react";
// removed: import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Reports() {
  // removed unused user destructure
  const [artworksPerArtist, setArtworksPerArtist] = useState([]);
  const [modernArtworks, setModernArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const [r1, r2] = await Promise.all([
          fetch("http://localhost:4000/api/reports/artworks-per-artist", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/reports/modern-artworks", {
            headers: { Authorization: `Bearer ${token}` },
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
  }, []);

  if (loading) return <div className="p-6 text-neutral-700">Loading reports...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Reports Dashboard</h1>

      {/* Artworks per Artist */}
      <section>
        <h2 className="text-2xl font-semibold text-rose-800 mb-4">
          Artworks per Artist
        </h2>
        {artworksPerArtist.length > 0 ? (
          <div className="overflow-x-auto border border-neutral-300 rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-rose-200 text-neutral-900">
                <tr>
                  <th className="px-4 py-3 text-left">Artist ID</th>
                  <th className="px-4 py-3 text-left">Artist Name</th>
                  <th className="px-4 py-3 text-left">Artwork Count</th>
                </tr>
              </thead>
              <tbody>
                {artworksPerArtist.map((a) => (
                  <tr key={a.artist_id} className="odd:bg-white even:bg-rose-50">
                    <td className="px-4 py-2 text-black">{a.artist_id}</td>
                    <td className="px-4 py-2 font-medium text-black">{a.artist_name}</td>
                    <td className="px-4 py-2 text-black">{a.artwork_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-500">No data found.</p>
        )}
      </section>

      {/* Modern Artworks */}
      <section>
        <h2 className="text-2xl font-semibold text-rose-800 mb-4">
          Modern Artworks (After 1900)
        </h2>
        {modernArtworks.length > 0 ? (
          <div className="overflow-x-auto border border-neutral-300 rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-rose-200 text-neutral-900">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Year Created</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Estimated Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {modernArtworks.map((art, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-rose-50">
                    <td className="px-4 py-2 font-medium text-black">{art.title}</td>
                    <td className="px-4 py-2 text-black">{art.year_created || "—"}</td>
                    <td className="px-4 py-2 text-black">{art.art_type || "—"}</td>
                    <td className="px-4 py-2 text-black">
                      {art.estimated_price
                        ? `$${art.estimated_price.toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-500">No data found.</p>
        )}
      </section>
    </div>
  );
}
