import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";

export default function ArtworksForm() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    artist_id: "",
    year_created: "",
    art_type: "",
    acquisition_date: "",
    estimated_price: "",
    image_url: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    fetchAll();
  }, [showDeleted]);

  async function fetchAll() {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const url = showDeleted
        ? `${API}/api/artworks/deleted`
        : `${API}/api/artworks`;

      const [artworksRes, artistsRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/artists`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const artworksData = await artworksRes.json();
      const artistsData = await artistsRes.json();

      if (!artworksRes.ok) throw new Error(artworksData.error || "Failed to load artworks");
      if (!artistsRes.ok) throw new Error(artistsData.error || "Failed to load artists");

      setArtworks(artworksData);
      setArtists(artistsData);
    } catch (err) {
      setError(err.message);
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

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/api/artworks/${editingId}` : `${API}/api/artworks`;

    const payload = {
      title: formData.title,
      artist_id: formData.artist_id ? Number(formData.artist_id) : null,
      year_created: formData.year_created ? Number(formData.year_created) : null,
      art_type: formData.art_type || null,
      acquisition_date: formData.acquisition_date || null,
      estimated_price:
        formData.estimated_price !== "" ? Number(formData.estimated_price) : null,
      image_url: formData.image_url || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save artwork");

      setSuccess(editingId ? "Artwork updated successfully!" : "Artwork added!");
      resetForm();
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(a) {
    setEditingId(a.artwork_id);
    setEditingTitle(a.title);
    setFormData({
      title: a.title || "",
      artist_id: a.artist_id ?? "",
      year_created: a.year_created ?? "",
      art_type: a.art_type ?? "",
      acquisition_date: a.acquisition_date
        ? a.acquisition_date.slice(0, 10)
        : "",
      estimated_price: a.estimated_price ?? "",
      image_url: a.image_url || "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;
    try {
      const res = await fetch(`${API}/api/artworks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete artwork");
      setSuccess("Artwork deleted successfully!");
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestore(id) {
    try {
      const res = await fetch(`${API}/api/artworks/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore artwork");
      setSuccess("Artwork restored successfully!");
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setEditingId(null);
    setEditingTitle("");
    setFormData({
      title: "",
      artist_id: "",
      year_created: "",
      art_type: "",
      acquisition_date: "",
      estimated_price: "",
      image_url: "",
    });
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">
      <h1 className="text-3xl font-serif mb-6 text-neutral-800">
        Manage Artworks
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
            {showDeleted ? "Show Active Artworks" : "Show Deleted Artworks"}
          </button>
        </div>
      )}

      {/* Form (hidden when viewing deleted) */}
      {!showDeleted && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-10">
          <h2 className="text-xl font-serif text-neutral-800 mb-4">
            {editingId
              ? `Editing Artwork: ${editingTitle}`
              : "Create New Artwork"}
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
                Artist
              </label>
              <select
                name="artist_id"
                value={formData.artist_id}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              >
                <option value="">Select Artist</option>
                {artists.map((ar) => (
                  <option key={ar.artist_id} value={ar.artist_id}>
                    {ar.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Year Created
              </label>
              <input
                type="number"
                name="year_created"
                value={formData.year_created}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Art Type
              </label>
              <input
                type="text"
                name="art_type"
                value={formData.art_type}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Acquisition Date
              </label>
              <input
                type="date"
                name="acquisition_date"
                value={formData.acquisition_date}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Estimated Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                name="estimated_price"
                value={formData.estimated_price}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Artwork Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
              >
                {editingId ? "Save Changes" : "Add Artwork"}
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
          {showDeleted ? "Deleted Artworks" : `All Artworks (${artworks.length})`}
        </h2>

        <table className="min-w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <thead className="bg-rose-600 text-white border-b border-neutral-200">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Image</th>
              <th className="p-3 text-left text-sm font-medium">Title</th>
              <th className="p-3 text-left text-sm font-medium">Artist</th>
              <th className="p-3 text-left text-sm font-medium">Year</th>
              <th className="p-3 text-left text-sm font-medium">Type</th>
              <th className="p-3 text-left text-sm font-medium">Price</th>
              <th className="p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {artworks.map((a, i) => (
              <tr
                key={a.artwork_id}
                className={`border-b border-neutral-200 ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"
                  } hover:bg-neutral-100 transition-colors`}
              >
                <td className="p-3 text-sm">
                  {a.image_url ? (
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="w-[100px] h-[100px] object-cover rounded-md border border-neutral-200"
                    />
                  ) : null}
                </td>
                <td className="p-3 text-sm">{a.title || "—"}</td>
                <td className="p-3 text-sm">{a.artist_name || "—"}</td>
                <td className="p-3 text-sm">{a.year_created || "—"}</td>
                <td className="p-3 text-sm">{a.art_type || "—"}</td>
                <td className="p-3 text-sm">
                  {a.estimated_price
                    ? `$${Number(a.estimated_price).toLocaleString()}`
                    : "—"}
                </td>
                <td className="p-3 flex gap-3 text-sm">
                  {!showDeleted ? (
                    <>
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-neutral-700 hover:text-black transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.artwork_id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(a.artwork_id)}
                      className="text-rose-700 hover:text-rose-500 transition"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {artworks.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-neutral-500 p-4">
                  {showDeleted
                    ? "No deleted artworks."
                    : "No artworks found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
