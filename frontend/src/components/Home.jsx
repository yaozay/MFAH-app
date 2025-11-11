import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Home() {
  const [health, setHealth] = useState(null);
  const [exhibitions, setExhibitions] = useState([]);
  const { user } = useAuth();

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    api("/health").then(setHealth).catch(console.error);
    
    // Fetch exhibitions
    async function fetchExhibitions() {
      try {
        const res = await fetch(`${API}/api/exhibitions`);
        const data = await res.json();
        if (res.ok) {
          // Get the last 3 exhibitions
          setExhibitions(data.slice(-3).reverse());
        }
      } catch (err) {
        console.error("Error loading exhibitions:", err);
      }
    }
    fetchExhibitions();
  }, [API]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/art.png"
          alt="Museum Interior"
          className="absolute inset-0 w-full h-full object-cover object-center animate-fadePan"
        />

        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
            Welcome
          </h1>
          <p className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto mb-8">
            Discover amazing Fine Arts at the Houston Museum of Fine Arts.
          </p>

          {!user && (
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 bg-white text-neutral-900 font-medium rounded-lg hover:bg-neutral-200 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-6">
                A Gateway to World-Class Art
              </h2>
              <p className="text-lg text-neutral-600 mb-4 leading-relaxed">
                The Houston Museum of Fine Arts is one of the largest museums in the United States,
                offering an impressive collection spanning 6,000 years of human creativity.
              </p>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                We believe art is a tool for education, cultural exchange, and personal enrichment—
                a space where diverse voices and perspectives come together.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition shadow-lg hover:shadow-xl"
              >
                Learn More About Us
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-neutral-900 mb-2">70K+</div>
                <div className="text-neutral-600">Artworks</div>
              </div>
              <div className="bg-neutral-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-neutral-900 mb-2">300K+</div>
                <div className="text-neutral-600">Annual Visitors</div>
              </div>
              <div className="bg-neutral-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-neutral-900 mb-2">6000</div>
                <div className="text-neutral-600">Years of Art</div>
              </div>
              <div className="bg-neutral-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-neutral-900 mb-2">300</div>
                <div className="text-neutral-600">Acres</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibitions Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Current Exhibitions</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Immerse yourself in our carefully curated exhibitions featuring masterpieces from around the globe
            </p>
          </div>
          
          {exhibitions.length === 0 ? (
            <div className="text-center text-neutral-500 mb-10">
              Loading exhibitions...
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {exhibitions.map((ex, index) => {
                const gradients = [
                  "from-amber-400 to-orange-600",
                  "from-blue-400 to-indigo-600",
                  "from-emerald-400 to-teal-600"
                ];
                const formatDate = (d) => (d ? d.split("T")[0] : "");
                
                return (
                  <div key={ex.exhibition_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
                    {ex.image_url ? (
                      <img
                        src={ex.image_url.startsWith("http") ? ex.image_url : `${API}${ex.image_url}`}
                        alt={ex.title}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className={`h-48 bg-gradient-to-br ${gradients[index % 3]}`}></div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-neutral-700 transition">
                        {ex.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 line-clamp-2">
                        {ex.description || "Explore this amazing exhibition"}
                      </p>
                      <span className="text-sm text-neutral-500">
                        {formatDate(ex.start_date)} - {formatDate(ex.end_date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/exhibitions"
              className="inline-flex items-center px-8 py-4 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition shadow-lg hover:shadow-xl"
            >
              View All Exhibitions
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="py-20 px-6 bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Become a Member</h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Join our community and enjoy exclusive access to the world of art
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 hover:border-neutral-500 transition">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-neutral-700 rounded-full mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Admission</h3>
                <p className="text-neutral-400">
                  Unlimited visits to all permanent collections and most special exhibitions
                </p>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 hover:border-neutral-500 transition">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-neutral-700 rounded-full mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Exclusive Events</h3>
                <p className="text-neutral-400">
                  Members-only previews, lectures, and curator-led tours
                </p>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 hover:border-neutral-500 transition">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-neutral-700 rounded-full mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Shop Discounts</h3>
                <p className="text-neutral-400">
                  10% off at the museum store and café for all your visits
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/membership"
              className="inline-flex items-center px-8 py-4 bg-white text-neutral-900 font-semibold rounded-lg hover:bg-neutral-100 transition shadow-lg hover:shadow-xl"
            >
              Join Today
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}