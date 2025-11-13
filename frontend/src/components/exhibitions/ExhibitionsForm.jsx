import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";

export default function ExhibitionsForm() {
  const { user } = useAuth();
  const [exhibitions, setExhibitions] = useState([]);
  const [venues, setVenues] = useState([]);

  const [formData, setFormData] = useState({
    exhibition_id: null,
    title: "",
    start_date: "",
    end_date: "",
    venue_id: "",
    organizer: "",
    description: "",
    image_url: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    loadExhibitions();
    loadVenues();
  }, [showDeleted]);

  async function loadExhibitions() {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const endpoint = showDeleted
        ? `${API}/api/exhibitions/deleted`
        : `${API}/api/exhibitions`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load exhibitions");
      setExhibitions(data);
    } catch (err) {
      setError(err.message);
      setExhibitions([]);
    }
  }

  async function loadVenues() {
    try {
      const res = await fetch(`${API}/api/venues`);
      const data = await res.json();
      setVenues(data);
    } catch {
      setVenues([]);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.start_date) {
      setError("Title and Start Date are required.");
      return;
    }

    const token = localStorage.getItem("token");
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/api/exhibitions/${editingId}`
      : `${API}/api/exhibitions`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save exhibition");

      setSuccess(
        editingId ? "Exhibition updated successfully!" : "Exhibition added!"
      );
      resetForm();
      loadExhibitions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this exhibition?"))
      return;
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/exhibitions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete exhibition");
      setSuccess("Exhibition deleted successfully!");
      loadExhibitions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestore(id) {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/exhibitions/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore exhibition");
      setSuccess("Exhibition restored successfully!");
      loadExhibitions();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(ex) {
    setEditingId(ex.exhibition_id);
    setEditingTitle(ex.title || "");
    setFormData({
      exhibition_id: ex.exhibition_id,
      title: ex.title || "",
      start_date: ex.start_date ? ex.start_date.slice(0, 10) : "",
      end_date: ex.end_date ? ex.end_date.slice(0, 10) : "",
      venue_id: ex.venue_id || "",
      organizer: ex.organizer || "",
      description: ex.description || "",
      image_url: ex.image_url || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setEditingTitle("");
    setFormData({
      exhibition_id: null,
      title: "",
      start_date: "",
      end_date: "",
      venue_id: "",
      organizer: "",
      description: "",
      image_url: "",
    });
  }

  const statusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
          Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="text-red-700 font-medium bg-red-50 px-2 py-0.5 rounded-full text-xs">
          Rejected
        </span>
      );
    }
    return (
      <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full text-xs">
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">
      <h1 className="text-3xl font-serif mb-6 text-neutral-800">
        Manage Exhibitions
      </h1>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md mb-6">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Admin toggle */}
      {user?.role === "admin" && (
        <div className="mb-6">
          <button
            onClick={() => setShowDeleted((prev) => !prev)}
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
          >
            {showDeleted ? "Show Active Exhibitions" : "Show Deleted Exhibitions"}
          </button>
        </div>
      )}

      {/* Form (hidden when viewing deleted) */}
      {!showDeleted && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-10">
          <h2 className="text-xl font-serif text-neutral-800 mb-4">
            {editingId
              ? `Editing Exhibition: ${editingTitle}`
              : "Create New Exhibition"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Venue
              </label>
              <select
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              >
                <option value="">Select Venue</option>
                {venues.map((v) => (
                  <option key={v.venue_id} value={v.venue_id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Organizer
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
              >
                {editingId ? "Save Changes" : "Add Exhibition"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                {editingId ? "Cancel Edit" : "Clear"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-serif text-neutral-800 mb-4">
          {showDeleted
            ? "Deleted Exhibitions"
            : `All Exhibitions (${exhibitions.length})`}
        </h2>

        <table className="min-w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <thead className="bg-rose-600 text-white border-b border-neutral-200">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Title</th>
              <th className="p-3 text-left text-sm font-medium">Dates</th>
              <th className="p-3 text-left text-sm font-medium">Venue</th>
              <th className="p-3 text-left text-sm font-medium">Organizer</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
              <th className="p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {exhibitions.map((ex, i) => (
              <tr
                key={ex.exhibition_id}
                className={`border-b border-neutral-200 ${
                  i % 2 === 0 ? "bg-white" : "bg-neutral-50"
                } hover:bg-neutral-100 transition-colors`}
              >
                <td className="p-3 text-sm">{ex.title}</td>
                <td className="p-3 text-sm">
                  {ex.start_date
                    ? new Date(ex.start_date).toLocaleDateString()
                    : "—"}
                  {" – "}
                  {ex.end_date
                    ? new Date(ex.end_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3 text-sm">{ex.venue_name || "—"}</td>
                <td className="p-3 text-sm">{ex.organizer || "—"}</td>
                <td className="p-3 text-sm">
                  {statusBadge(ex.status || "pending")}
                </td>

                <td className="p-3 flex gap-3 text-sm">
                  {!showDeleted ? (
                    <>
                      <button
                        onClick={() => handleEdit(ex)}
                        className="text-neutral-700 hover:text-black transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ex.exhibition_id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(ex.exhibition_id)}
                      className="text-rose-700 hover:text-rose-500 transition"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {exhibitions.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-neutral-500 p-4">
                  {showDeleted
                    ? "No deleted exhibitions."
                    : "No exhibitions found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
