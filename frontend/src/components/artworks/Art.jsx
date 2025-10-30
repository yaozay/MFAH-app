import { useEffect, useState } from "react";

export default function Art() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    async function fetchArtworks() {
      try {
        const res = await fetch(`${API}/api/artworks`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load artworks");
        setArtworks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchArtworks();
  }, [API]);

  if (loading)
    return <div className="text-center mt-20 text-neutral-600">Loading artworks...</div>;

  if (error)
    return <div className="text-center mt-20 text-red-500 font-medium">{error}</div>;

  return (
    <section className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent drop-shadow-sm">
            Art Gallery
          </h1>
          <p className="text-neutral-600 text-lg mt-3">
            Discover masterpieces from our museum’s permanent collection
          </p>
        </div>

        {/* Artworks Grid */}
        {artworks.length === 0 ? (
          <p className="text-center text-neutral-500 py-24 text-lg">
            No artworks available at the moment.
          </p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((a) => (
              <div
                key={a.artwork_id}
                className="group relative bg-white rounded-3xl shadow-lg overflow-hidden border border-neutral-200 hover:shadow-2xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative">
                  {a.image_url ? (
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="w-full h-72 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                      <span className="text-6xl text-neutral-300">🎨</span>
                    </div>
                  )}

                  {/* Overlay title on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-500">
                    <h2 className="text-white text-2xl font-semibold tracking-wide drop-shadow-lg">
                      {a.title}
                    </h2>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-1">
                    {a.title}
                  </h3>
                  {a.artist_name && (
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Artist:</span>{" "}
                      {a.artist_name}
                    </p>
                  )}
                  {a.year_created && (
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Year:</span>{" "}
                      {a.year_created}
                    </p>
                  )}
                  {a.art_type && (
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Type:</span> {a.art_type}
                    </p>
                  )}
                  {a.estimated_price && (
                    <p className="text-sm text-emerald-700 font-semibold mt-2">
                      Price: ${Number(a.estimated_price).toLocaleString()}
                    </p>
                  )}
                  {a.acquisition_date && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Acquired on{" "}
                      {new Date(a.acquisition_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}