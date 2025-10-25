import { useEffect, useState } from "react";

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
      const res = await fetch("/api/artists", {
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
    const url = editingId ? `/api/artists/${editingId}` : "/api/artists";

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
      const res = await fetch(`/api/artists/${id}`, {
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
    <div className="min-h-screen bg-black text-white px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-center text-rose-300">
          Artist Data Entry
        </h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        {success && <p className="text-green-400 text-center mb-2">{success}</p>}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 bg-zinc-800 rounded-xl p-5"
        >
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="birth_year"
              placeholder="Birth Year"
              value={formData.birth_year}
              onChange={handleChange}
              className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            <input
              type="number"
              name="death_year"
              placeholder="Death Year"
              value={formData.death_year}
              onChange={handleChange}
              className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

          </div>
          <input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <textarea
            name="bio"
            placeholder="Biography"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md transition"
            >
              {editingId ? "Update Artist" : "Add Artist"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-zinc-600 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <hr className="my-6 border-zinc-700" />

        <h3 className="text-xl font-semibold mb-3 text-rose-300">
          Existing Artists
        </h3>

        <ul className="flex flex-col gap-3">
          {artists.map((artist) => (
            <li
              key={artist.artist_id}
              className="bg-zinc-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-lg">{artist.full_name}</p>
                <p className="text-sm text-zinc-400">
                  {artist.birth_year || "?"}–{artist.death_year || "?"} •{" "}
                  {artist.nationality || "Unknown"}
                </p>
                {artist.bio && (
                  <p className="text-sm text-zinc-300 mt-1">{artist.bio}</p>
                )}
              </div>

              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleEdit(artist)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(artist.artist_id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
