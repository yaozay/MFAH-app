import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Home() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api("/health").then(setHealth).catch(console.error);
  }, []);

  return (
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
          Discover 5,000 years of art at the Houston Museum of Fine Arts.
        </p>

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
      </div>
    </section>
  );
}
