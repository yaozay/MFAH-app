import { useEffect, useState } from "react";

export default function Art() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 text-lg">Loading artworks...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold text-xl">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 text-neutral-800">

      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">Art Gallery</h1>
            <p className="text-neutral-600 mt-1">
              {artworks.length} {artworks.length === 1 ? "artwork" : "artworks"} in collection
            </p>
          </div>
          <div className="flex gap-2">
            {["grid", "list"].map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === mode
                  ? "bg-rose-500 text-white shadow-md"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
              >
                {mode === "grid" ? "Grid" : "List"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {artworks.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🎨</div>
            <p className="text-neutral-500 text-xl">
              No artworks available at the moment.
            </p>
          </div>
        ) : view === "grid" ? (
          // --- GRID VIEW ---
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((a) => (
              <div
                key={a.artwork_id}
                className="group bg-white rounded-2xl border border-neutral-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                  {a.image_url ? (
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100">
                      <span className="text-5xl">🎨</span>
                    </div>
                  )}

                  {a.art_type && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {a.art_type}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-neutral-900 mb-1">
                    {a.title}
                  </h3>
                  {a.artist_name && (
                    <p className="text-neutral-600 font-medium mb-3">
                      {a.artist_name}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    {a.year_created && (
                      <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                        {a.year_created}
                      </span>
                    )}
                    {a.estimated_price && (
                      <span className="text-emerald-600 font-bold text-base">
                        ${Number(a.estimated_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {a.acquisition_date && (
                    <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-3">
                      Acquired{" "}
                      {new Date(a.acquisition_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- LIST VIEW ---
          <div className="space-y-4">
            {artworks.map((a) => (
              <div
                key={a.artwork_id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-48 flex-shrink-0 bg-neutral-100 overflow-hidden">
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100">
                        <span className="text-4xl">🎨</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-neutral-900 mb-1">
                          {a.title}
                        </h3>
                        {a.artist_name && (
                          <p className="text-neutral-600 text-sm">
                            {a.artist_name}
                          </p>
                        )}
                      </div>
                      {a.estimated_price && (
                        <p className="text-emerald-600 font-bold text-lg">
                          ${Number(a.estimated_price).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                      {a.year_created && (
                        <span>
                          <span className="font-semibold">Year:</span>{" "}
                          {a.year_created}
                        </span>
                      )}
                      {a.art_type && (
                        <span>
                          <span className="font-semibold">Type:</span>{" "}
                          {a.art_type}
                        </span>
                      )}
                      {a.acquisition_date && (
                        <span>
                          <span className="font-semibold">Acquired:</span>{" "}
                          {new Date(a.acquisition_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}