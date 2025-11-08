import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";

const API = import.meta.env.VITE_API_BASE;

export default function Artists() {
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_year: "",
    death_year: "",
    nationality: "",
    bio: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, [showDeleted]);

  async function fetchArtists() {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const url = showDeleted
        ? `${API}/api/artists/deleted`
        : `${API}/api/artists`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load artists");
      setArtists(data);
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
    const url = editingId
      ? `${API}/api/artists/${editingId}`
      : `${API}/api/artists`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save artist");

      setSuccess(editingId ? "Artist updated successfully!" : "Artist added!");
      resetForm();
      fetchArtists();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(artist) {
    setEditingId(artist.artist_id);
    setEditingName(artist.full_name);
    setFormData({
      full_name: artist.full_name,
      birth_year: artist.birth_year || "",
      death_year: artist.death_year || "",
      nationality: artist.nationality || "",
      bio: artist.bio || "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      const res = await fetch(`${API}/api/artists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete artist");
      setSuccess("Artist deleted successfully!");
      fetchArtists();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestore(id) {
    try {
      const res = await fetch(`${API}/api/artists/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore artist");
      setSuccess("Artist restored successfully!");
      fetchArtists();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setEditingId(null);
    setEditingName("");
    setFormData({
      full_name: "",
      birth_year: "",
      death_year: "",
      nationality: "",
      bio: "",
    });
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">
      <h1 className="text-3xl font-serif mb-6 text-neutral-800">
        Manage Artists
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
            {showDeleted ? "Show Active Artists" : "Show Deleted Artists"}
          </button>
        </div>
      )}

      {/* Form (hidden when viewing deleted) */}
      {!showDeleted && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-10">
          <h2 className="text-xl font-serif text-neutral-800 mb-4">
            {editingId
              ? `Editing Artist: ${editingName}`
              : "Create New Artist"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Birth Year
              </label>
              <input
                type="number"
                name="birth_year"
                value={formData.birth_year}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Death Year
              </label>
              <input
                type="number"
                name="death_year"
                value={formData.death_year}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Biography
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
              >
                {editingId ? "Save Changes" : "Add Artist"}
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
          {showDeleted ? "Deleted Artists" : `All Artists (${artists.length})`}
        </h2>

        <table className="min-w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <thead className="bg-rose-600 text-white border-b border-neutral-200">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Name</th>
              <th className="p-3 text-left text-sm font-medium">Years</th>
              <th className="p-3 text-left text-sm font-medium">Nationality</th>
              {showDeleted && (
                <th className="p-3 text-left text-sm font-medium">Deleted At</th>
              )}
              <th className="p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {artists.map((artist, i) => (
              <tr
                key={artist.artist_id}
                className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"
                  } hover:bg-neutral-100 transition-colors`}
              >
                <td className="p-3 text-sm">{artist.full_name}</td>
                <td className="p-3 text-sm">
                  {artist.birth_year
                    ? `${artist.birth_year}${artist.death_year ? `–${artist.death_year}` : ""
                    }`
                    : "—"}
                </td>
                <td className="p-3 text-sm">{artist.nationality || "—"}</td>
                {showDeleted && (
                  <td className="p-3 text-sm">
                    {artist.deleted_at
                      ? new Date(artist.deleted_at).toLocaleDateString()
                      : "—"}
                  </td>
                )}
                <td className="p-3 flex gap-3 text-sm">
                  {!showDeleted ? (
                    <>
                      <button
                        onClick={() => handleEdit(artist)}
                        className="text-neutral-700 hover:text-black transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(artist.artist_id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(artist.artist_id)}
                      className="text-rose-700 hover:text-rose-500 transition"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {artists.length === 0 && (
              <tr>
                <td
                  colSpan={showDeleted ? 5 : 4}
                  className="text-center text-neutral-500 p-4"
                >
                  {showDeleted ? "No deleted artists." : "No artists found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
