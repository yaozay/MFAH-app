import { useEffect, useState } from "react";

export default function Artworks() {
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    artist_id: "",
    year_created: "",
    art_type: "",
    acquisition_date: "",
    estimated_price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");

      const [artworksRes, artistsRes] = await Promise.all([
        fetch(`${API}/api/artworks`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/artists`, { headers: { Authorization: `Bearer ${token}` } }),
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      estimated_price: formData.estimated_price !== "" ? Number(formData.estimated_price) : null,
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

      setSuccess(editingId ? "Artwork updated!" : "Artwork added!");
      resetForm();
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.artwork_id);
    setFormData({
      title: a.title || "",
      artist_id: a.artist_id ?? "",
      year_created: a.year_created ?? "",
      art_type: a.art_type ?? "",
      acquisition_date: a.acquisition_date ? a.acquisition_date.slice(0, 10) : "",
      estimated_price: a.estimated_price ?? "",
    });
    setSuccess("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;
    try {
      const res = await fetch(`${API}/api/artworks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete artwork");
      setSuccess("Artwork deleted!");
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      artist_id: "",
      year_created: "",
      art_type: "",
      acquisition_date: "",
      estimated_price: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Artwork Management
          </h1>
          <p className="text-neutral-600 text-lg">
            Manage your museum's artwork collection
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl shadow-md">
            <strong>Success!</strong> {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">
            {editingId ? "Edit Artwork" : "Add New Artwork"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Starry Night"
                value={formData.title}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Artist
              </label>
              <select
                name="artist_id"
                value={formData.artist_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Artist (optional)</option>
                {artists.map((ar) => (
                  <option key={ar.artist_id} value={ar.artist_id}>
                    {ar.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Year Created
                </label>
                <input
                  type="number"
                  name="year_created"
                  placeholder="e.g., 1889"
                  value={formData.year_created}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Art Type
                </label>
                <input
                  type="text"
                  name="art_type"
                  placeholder="e.g., Oil on Canvas"
                  value={formData.art_type}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Estimated Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="estimated_price"
                  placeholder="e.g., 1000000"
                  value={formData.estimated_price}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 btn bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-md"
              >
                {editingId ? "💾 Update Artwork" : "➕ Add Artwork"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Artwork List */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">
            Collection ({artworks.length} artworks)
          </h2>

          <div className="space-y-3">
            {artworks.map((a) => (
              <div
                key={a.artwork_id}
                className="bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">
                      {a.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-neutral-600 mb-2">
                      {a.artist_name && (
                        <span className="px-3 py-1 bg-white rounded-full border border-neutral-300">
                          👤 {a.artist_name}
                        </span>
                      )}
                      {a.year_created && (
                        <span className="px-3 py-1 bg-white rounded-full border border-neutral-300">
                          📅 {a.year_created}
                        </span>
                      )}
                      {a.art_type && (
                        <span className="px-3 py-1 bg-white rounded-full border border-neutral-300">
                          🎨 {a.art_type}
                        </span>
                      )}
                      {a.estimated_price != null && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-300 font-semibold">
                          💰 ${Number(a.estimated_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {a.acquisition_date && (
                      <p className="text-sm text-neutral-500">
                        Acquired: {new Date(a.acquisition_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      onClick={() => handleEdit(a)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.artwork_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium shadow-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {artworks.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                <p className="text-lg">No artworks in the collection yet.</p>
                <p className="text-sm mt-2">Use the form above to add your first artwork.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}