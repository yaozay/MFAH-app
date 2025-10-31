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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900">Art Gallery</h1>
              <p className="text-neutral-600 mt-1">
                {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'} in collection
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("grid")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "grid"
                  ? "bg-rose-400 text-white"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "list"
                  ? "bg-rose-400 text-white"
                  : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {artworks.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🎨</div>
            <p className="text-neutral-500 text-xl">
              No artworks available at the moment.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {artworks.map((a, index) => (
              <div
                key={a.artwork_id}
                className="break-inside-avoid mb-6 group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-neutral-200 hover:scale-[1.02]">
                  <div className="relative overflow-hidden bg-neutral-100">
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt={a.title}
                        className="w-full object-cover group-hover:brightness-95 transition-all duration-500"
                        style={{ height: 'auto' }}
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-violet-100">
                        <span className="text-6xl">🎨</span>
                      </div>
                    )}
                    {a.art_type && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        {a.art_type}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-neutral-900 mb-2 leading-tight">
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
                        <span className="text-emerald-600 font-bold text-lg">
                          ${Number(a.estimated_price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {a.acquisition_date && (
                      <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-3">
                        Acquired {new Date(a.acquisition_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {artworks.map((a) => (
              <div
                key={a.artwork_id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-neutral-200"
              >
                <div className="flex flex-col sm:flex-row">

                  <div className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden bg-neutral-100">
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt={a.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100">
                        <span className="text-5xl">🎨</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-2xl text-neutral-900 mb-1">
                          {a.title}
                        </h3>
                        {a.artist_name && (
                          <p className="text-neutral-600 text-lg">
                            {a.artist_name}
                          </p>
                        )}
                      </div>
                      {a.estimated_price && (
                        <div className="text-right">
                          <p className="text-emerald-600 font-bold text-2xl">
                            ${Number(a.estimated_price).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      {a.year_created && (
                        <div>
                          <span className="font-semibold">Year:</span>{" "}
                          {a.year_created}
                        </div>
                      )}
                      {a.art_type && (
                        <div>
                          <span className="font-semibold">Type:</span>{" "}
                          {a.art_type}
                        </div>
                      )}
                      {a.acquisition_date && (
                        <div>
                          <span className="font-semibold">Acquired:</span>{" "}
                          {new Date(a.acquisition_date).toLocaleDateString()}
                        </div>
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