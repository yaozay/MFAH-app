import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";

export default function ExhibitionsForm() {
  const { token, user } = useAuth();
  const [exhibitions, setExhibitions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedExhibitions, setDeletedExhibitions] = useState([]);

  const [form, setForm] = useState({
    title: "",
    start_date: "",
    end_date: "",
    venue_id: "",
    organizer: "",
    description: "",
    image_url: "",
  });

  const API = import.meta.env.VITE_API_BASE;

  // ✅ Fetch Active Exhibitions + Venues
  useEffect(() => {
    async function fetchData() {
      try {
        const [exhRes, venRes] = await Promise.all([
          fetch(`${API}/api/exhibitions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/venues`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const exhData = await exhRes.json();
        const venData = await venRes.json();

        setExhibitions(exhData);
        setVenues(venData);
      } catch (err) {
        console.error("Error loading exhibitions:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!showDeleted) fetchData(); // ✅ only fetch when viewing active
  }, [API, token, showDeleted]);

  // ✅ Fetch Deleted Exhibitions
  async function fetchDeleted() {
    try {
      const res = await fetch(`${API}/api/exhibitions/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load deleted exhibitions");
      setDeletedExhibitions(data);
    } catch (err) {
      console.error("Error loading deleted exhibitions:", err);
      alert(err.message);
      setDeletedExhibitions([]);
    }
  }

  // ✅ Restore Deleted Exhibition
  async function handleRestore(id) {
    try {
      const res = await fetch(`${API}/api/exhibitions/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to restore exhibition");

      alert("Exhibition restored successfully!");
      setShowDeleted(false); // ✅ auto switch to active view
    } catch (err) {
      console.error("Restore failed:", err);
      alert(err.message);
    }
  }

  // ✅ Add / Update Exhibition
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.start_date)
      return alert("Title and start date are required.");

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API}/api/exhibitions/${editing.exhibition_id}`
      : `${API}/api/exhibitions`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save exhibition");

      setForm({
        title: "",
        start_date: "",
        end_date: "",
        venue_id: "",
        organizer: "",
        description: "",
        image_url: "",
      });
      setEditing(null);

      const updated = await fetch(`${API}/api/exhibitions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExhibitions(await updated.json());
    } catch (err) {
      console.error("Save failed:", err);
      alert(err.message);
    }
  }

  // ✅ Delete (Soft Delete)
  async function handleDelete(id) {
    if (!confirm("Delete this exhibition?")) return;
    try {
      const res = await fetch(`${API}/api/exhibitions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete exhibition");
      setExhibitions((prev) => prev.filter((e) => e.exhibition_id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.message);
    }
  }

  function handleEdit(e) {
    setEditing(e);
    setForm({
      title: e.title || "",
      start_date: e.start_date || "",
      end_date: e.end_date || "",
      venue_id: e.venue_id || "",
      organizer: e.organizer || "",
      description: e.description || "",
      image_url: e.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditing(null);
    setForm({
      title: "",
      start_date: "",
      end_date: "",
      venue_id: "",
      organizer: "",
      description: "",
      image_url: "",
    });
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading exhibitions...
      </div>
    );

  const filteredExhibitions = exhibitions.filter((e) => {
    const titleMatch = e.title?.toLowerCase().includes(search.toLowerCase());
    const organizerMatch = e.organizer?.toLowerCase().includes(search.toLowerCase());
    const start = new Date(e.start_date);
    const end = new Date(e.end_date);
    const filterStart = startFilter ? new Date(startFilter) : null;
    const filterEnd = endFilter ? new Date(endFilter) : null;
    const inDateRange =
      (!filterStart || end >= filterStart) &&
      (!filterEnd || start <= filterEnd);
    return (titleMatch || organizerMatch) && inDateRange;
  });

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">
      <h1 className="text-3xl font-serif mb-6">
        {editing ? "Edit Exhibition" : "Manage Exhibitions"}
      </h1>

      {/* ✅ Admin toggle */}
      {user?.role === "admin" && (
        <div className="mb-6">
          <button
            onClick={() => {
              setShowDeleted((prev) => !prev);
              if (!showDeleted) fetchDeleted();
            }}
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
          >
            {showDeleted ? "Show Active Exhibitions" : "Show Deleted Exhibitions"}
          </button>
        </div>
      )}

      {/* ✅ ACTIVE VIEW */}
      {!showDeleted && (
        <>
          {/* FORM SECTION */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border rounded-xl shadow-sm p-6 mb-12"
          >
            <h2 className="text-lg font-serif font-medium mb-4 text-neutral-800">
              {editing ? "Edit Exhibition" : "Add New Exhibition"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {["title", "organizer"].map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-serif text-neutral-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="border rounded-md p-2 text-sm"
                  />
                </div>
              ))}

              {/* Dates */}
              <div className="flex flex-col">
                <label className="text-sm font-serif text-neutral-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="border rounded-md p-2 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-serif text-neutral-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="border rounded-md p-2 text-sm"
                />
              </div>

              {/* Venue Dropdown */}
              <div className="flex flex-col">
                <label className="text-sm font-serif text-neutral-700 mb-1">
                  Venue
                </label>
                <select
                  value={form.venue_id}
                  onChange={(e) => setForm({ ...form, venue_id: e.target.value })}
                  className="border rounded-md p-2 text-sm"
                >
                  <option value="">Select a venue</option>
                  {venues.map((v) => (
                    <option key={v.venue_id} value={v.venue_id}>
                      {v.name} — {v.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div className="flex flex-col sm:col-span-2">
                <label className="text-sm font-serif text-neutral-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="border rounded-md p-2 text-sm"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col sm:col-span-2">
                <label className="text-sm font-serif text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border rounded-md p-2 text-sm"
                />
              </div>

              {form.image_url && (
                <div className="sm:col-span-2 flex justify-center">
                  <div className="w-40 h-40 rounded-lg border overflow-hidden bg-neutral-100 flex items-center justify-center">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                className="flex-1 bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700 transition"
              >
                {editing ? "Save Changes" : "Add Exhibition"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Search + Grid */}
          <h6 className="text-2xl font-serif font-semibold mb-6 text-neutral-800 text-left">
            All Exhibitions
          </h6>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl">
            <input
              type="text"
              placeholder="Search by name or organizer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={startFilter}
              onChange={(e) => setStartFilter(e.target.value)}
              className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={endFilter}
              onChange={(e) => setEndFilter(e.target.value)}
              className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
            />
            {(search || startFilter || endFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStartFilter("");
                  setEndFilter("");
                }}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
            {filteredExhibitions.map((e) => (
              <div
                key={e.exhibition_id}
                className="border border-neutral-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col"
              >
                <div className="aspect-[1/1] bg-neutral-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  {e.image_url ? (
                    <img
                      src={e.image_url.startsWith("http") ? e.image_url : `${API}${e.image_url}`}
                      alt={e.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>
                <h3 className="font-serif text-lg text-neutral-800 mb-1">{e.title}</h3>
                <p className="text-sm text-neutral-500 mb-2">
                  {e.organizer || "Organizer Unknown"}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {e.start_date?.split("T")[0]} → {e.end_date?.split("T")[0]}
                </p>
                <p className="text-sm text-gray-600 mb-3 truncate">{e.description}</p>
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => handleEdit(e)}
                    className="flex-1 bg-gray-500 text-white rounded-md py-1 hover:bg-gray-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e.exhibition_id)}
                    className="flex-1 bg-rose-500 text-white rounded-md py-1 hover:bg-rose-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ✅ Deleted Exhibitions Page */}
      {showDeleted && (
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-serif mb-4 text-neutral-800">
            Deleted Exhibitions
          </h2>

          {deletedExhibitions.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No deleted exhibitions found.
            </p>
          ) : (
            <table className="min-w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-rose-600 text-white">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Title</th>
                  <th className="p-3 text-left text-sm font-medium">Organizer</th>
                  <th className="p-3 text-left text-sm font-medium">Deleted At</th>
                  <th className="p-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedExhibitions.map((e, i) => (
                  <tr
                    key={e.exhibition_id}
                    className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"
                      }`}
                  >
                    <td className="p-3 text-sm">{e.title}</td>
                    <td className="p-3 text-sm">{e.organizer || "—"}</td>
                    <td className="p-3 text-sm">
                      {e.deleted_at
                        ? new Date(e.deleted_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3 text-sm">
                      <button
                        onClick={() => handleRestore(e.exhibition_id)}
                        className="text-rose-700 hover:text-rose-500 text-sm"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
