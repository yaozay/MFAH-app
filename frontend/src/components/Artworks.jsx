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

    // normalize payload (empty strings -> null for optional fields)
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
    <div className="min-h-screen bg-black text-white px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-zinc-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-center text-rose-300">
          Artwork Data Entry
        </h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        {success && <p className="text-green-400 text-center mb-2">{success}</p>}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-zinc-800 rounded-xl p-5">
          <input
            type="text"
            name="title"
            placeholder="Title (required)"
            value={formData.title}
            onChange={handleChange}
            required
            className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          {/* Artist selector */}
          <select
            name="artist_id"
            value={formData.artist_id}
            onChange={handleChange}
            className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="">Select Artist (optional)</option>
            {artists.map((ar) => (
              <option key={ar.artist_id} value={ar.artist_id}>
                {ar.full_name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="year_created"
              placeholder="Year Created"
              value={formData.year_created}
              onChange={handleChange}
              className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <input
              type="text"
              name="art_type"
              placeholder="Art Type (e.g., Oil on Canvas)"
              value={formData.art_type}
              onChange={handleChange}
              className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="acquisition_date"
              placeholder="Acquisition Date"
              value={formData.acquisition_date}
              onChange={handleChange}
              className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <input
              type="number"
              step="0.01"
              name="estimated_price"
              placeholder="Estimated Price (USD)"
              value={formData.estimated_price}
              onChange={handleChange}
              className="bg-zinc-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md transition"
            >
              {editingId ? "Update Artwork" : "Add Artwork"}
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

        {/* LIST */}
        <h3 className="text-xl font-semibold mb-3 text-rose-300">Existing Artworks</h3>

        <ul className="flex flex-col gap-3">
          {artworks.map((a) => (
            <li
              key={a.artwork_id}
              className="bg-zinc-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-lg">{a.title}</p>
                <p className="text-sm text-zinc-400">
                  {a.year_created ?? "-"} • {a.artist_name ?? "Unknown"}
                </p>
                <p className="text-sm text-zinc-400">
                  {a.art_type ?? "-"} {a.acquisition_date ? `• Acq: ${a.acquisition_date.slice(0,10)}` : ""}{" "}
                  {a.estimated_price != null ? `• $${Number(a.estimated_price).toLocaleString()}` : ""}
                </p>
              </div>

              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleEdit(a)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.artwork_id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}

          {artworks.length === 0 && (
            <li className="bg-zinc-800 p-6 rounded-lg text-center text-neutral-400">
              No artworks yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
