import { useEffect, useState } from "react";

export default function ExhibitionsScrollView() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    async function fetchExhibitions() {
      try {
        const res = await fetch(`${API}/api/exhibitions/recent`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load exhibitions");
        setExhibitions(data);
      } catch (err) {
        console.error("Error loading exhibitions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExhibitions();
  }, [API]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading exhibitions...
      </div>
    );

  if (exhibitions.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No exhibitions found.
      </div>
    );

  const formatDate = (d) => (d ? d.split("T")[0] : "");

  //  Filter exhibitions based on date range
  const filtered = exhibitions.filter((ex) => {
    const start = new Date(ex.start_date);
    const end = new Date(ex.end_date);

    // Convert user inputs to Date objects if they exist
    const filterStart = startFilter ? new Date(startFilter) : null;
    const filterEnd = endFilter ? new Date(endFilter) : null;

    // If both filters exist, show exhibitions overlapping that range
    if (filterStart && filterEnd) {
      return start <= filterEnd && end >= filterStart;
    }

    // Only start filter → exhibitions starting on/after this date
    if (filterStart && !filterEnd) {
      return end >= filterStart;
    }

    // Only end filter → exhibitions ending on/before this date
    if (!filterStart && filterEnd) {
      return start <= filterEnd;
    }

    // No filters → show all
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-4 md:px-12 flex flex-col items-center">
      <h1 className="text-4xl font-serif mb-6 text-neutral-800 text-center">
        Current & Upcoming Exhibitions
      </h1>

      {/* 🔍 Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full max-w-2xl">
        
        {/* If you need to filter by start ane end date*/}
        {/*
        <div className="flex flex-col">
          <label className="text-sm font-medium text-neutral-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startFilter}
            onChange={(e) => setStartFilter(e.target.value)}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-neutral-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endFilter}
            onChange={(e) => setEndFilter(e.target.value)}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        */}

        {(startFilter || endFilter) && (
          <button
            onClick={() => {
              setStartFilter("");
              setEndFilter("");
            }}
            className="mt-5 sm:mt-6 text-sm text-blue-600 underline hover:text-blue-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Exhibition Cards */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center">
          No exhibitions found for that date range.
        </p>
      ) : (
        <div className="flex flex-col gap-16 w-full max-w-4xl">
          {filtered.map((ex) => (
            <div
              key={ex.exhibition_id}
              className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {ex.image_url ? (
                <img
                  src={
                    ex.image_url.startsWith("http")
                      ? ex.image_url
                      : `${API}${ex.image_url}`
                  }
                  alt={ex.title}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-neutral-200 flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-serif text-neutral-900 mb-2">
                  {ex.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2 italic">
                    Organized by {ex.organizer || "Unknown"} |{" "}
                    {ex.venue_name ? `Venue: ${ex.venue_name}` : "Venue Unknown"}
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  {formatDate(ex.start_date)} → {formatDate(ex.end_date)}
                </p>
                <p className="text-base text-neutral-700 leading-relaxed">
                  {ex.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
