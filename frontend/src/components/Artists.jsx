import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE;

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_year: "",
    death_year: "",
    nationality: "",
    bio: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/api/artists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load artists");
      setArtists(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/api/artists/${editingId}` : `${API}/api/artists`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save artist");
      setSuccess(editingId ? "Artist updated!" : "Artist added!");
      setFormData({
        full_name: "",
        birth_year: "",
        death_year: "",
        nationality: "",
        bio: ""
      });
      setEditingId(null);
      fetchArtists();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (artist) => {
    setEditingId(artist.artist_id);
    setFormData({
      full_name: artist.full_name,
      birth_year: artist.birth_year || "",
      death_year: artist.death_year || "",
      nationality: artist.nationality || "",
      bio: artist.bio || ""
    });
    setSuccess("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      const res = await fetch(`${API}/api/artists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete artist");
      setSuccess("Artist deleted!");
      fetchArtists();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      full_name: "",
      birth_year: "",
      death_year: "",
      nationality: "",
      bio: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Artist Management
          </h1>
          <p className="text-neutral-600 text-lg">
            Add, edit, and manage artist information
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
            {editingId ? "Edit Artist" : "Add New Artist"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="e.g., Vincent van Gogh"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Birth Year
                </label>
                <input
                  type="number"
                  name="birth_year"
                  placeholder="e.g., 1853"
                  value={formData.birth_year}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Death Year
                </label>
                <input
                  type="number"
                  name="death_year"
                  placeholder="e.g., 1890"
                  value={formData.death_year}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                placeholder="e.g., Dutch"
                value={formData.nationality}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Biography
              </label>
              <textarea
                name="bio"
                placeholder="Brief biography or description..."
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 btn bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-md"
              >
                {editingId ? "Update Artist" : "➕ Add Artist"}
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

        {/* Artist List */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">
            Existing Artists ({artists.length})
          </h2>

          <div className="space-y-3">
            {artists.map((artist) => (
              <div
                key={artist.artist_id}
                className="bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">
                      {artist.full_name}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-neutral-600 mb-2">
                      <span className="px-3 py-1 bg-white rounded-full border border-neutral-300">
                        {artist.birth_year || "?"} – {artist.death_year || "?"}
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full border border-neutral-300">
                        {artist.nationality || "Unknown"}
                      </span>
                    </div>
                    {artist.bio && (
                      <p className="text-neutral-700 leading-relaxed">
                        {artist.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      onClick={() => handleEdit(artist)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(artist.artist_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {artists.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                <p className="text-lg">No artists added yet.</p>
                <p className="text-sm mt-2">Use the form above to add your first artist.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}