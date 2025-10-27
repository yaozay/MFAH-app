import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";

const API = import.meta.env.VITE_API_BASE;

export default function Reports() {
  const [artworksPerArtist, setArtworksPerArtist] = useState([]);
  const [modernArtworks, setModernArtworks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const [r1, r2, r3] = await Promise.all([
          fetch(`${API}/api/reports/artworks-per-artist`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/reports/modern-artworks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/reports/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Statuses:", {
          artworks: r1.status,
          modern: r2.status,
          employees: r3.status,
        });

        if (!r1.ok || !r2.ok || !r3.ok) throw new Error("Error fetching reports");

        const data1 = await r1.json();
        const data2 = await r2.json();
        const data3 = await r3.json();

        setArtworksPerArtist(data1);
        setModernArtworks(data2);
        setEmployees(data3);

      } catch (err) {
        console.error("Reports fetch error:", err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

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

      {/* Artworks per Artist Report */}
      <section className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-100 to-amber-100 px-8 py-6 border-b-2 border-rose-200">
          <h2 className="text-2xl font-bold text-neutral-800">
            📊 Artworks per Artist
          </h2>
          <p className="text-neutral-600 mt-1">
            Collection distribution by artist
          </p>
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
                {artworksPerArtist.map((a, idx) => (
                  <tr key={a.artist_id}>
                    <td className="px-6 py-4 text-neutral-700">#{a.artist_id}</td>
                    <td className="px-6 py-4 font-semibold text-neutral-800">{a.artist_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {a.artwork_count} {a.artwork_count === 1 ? 'piece' : 'pieces'}
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

      {/* Modern Artworks Report */}
      <section className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-100 to-amber-100 px-8 py-6 border-b-2 border-rose-200">
          <h2 className="text-2xl font-bold text-neutral-800">
            🎨 Modern Artworks (After 1900)
          </h2>
          <p className="text-neutral-600 mt-1">
            Contemporary and modern art pieces
          </p>
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
                          ${art.estimated_price.toLocaleString()}
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

      {/* Employees Report */}
      <section className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-100 to-amber-100 px-8 py-6 border-b-2 border-rose-200">
          <h2 className="text-2xl font-bold text-neutral-800">
            👥 Employee Directory
          </h2>
          <p className="text-neutral-600 mt-1">
            Staff information sorted by salary
          </p>
        </div>

        {employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Department</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Hire Date</th>
                  <th className="px-6 py-4 text-left">Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.employee_id}>
                    <td className="px-6 py-4 text-neutral-700">#{e.employee_id}</td>
                    <td className="px-6 py-4 font-semibold text-neutral-800">
                      {e.first_name} {e.last_name}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        Dept {e.department_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {e.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">
                      {e.hire_date ? new Date(e.hire_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {e.salary ? (
                        <span className="font-bold text-emerald-600">
                          ${e.salary.toLocaleString()}
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
    </div>
  );
}