
const API_BASE =
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

