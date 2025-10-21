import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ ADD THIS
import { api } from "../lib/api";

export default function Home() {
  const [health, setHealth] = useState(null);
  
  useEffect(() => {
    api("/health").then(setHealth).catch(console.error);
  }, []);
  
  return (
    <section className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full items-center min-h-[calc(100vh-64px)] px-6 lg:px-16">
        {/* Left side - Image */}
        <div className="flex justify-center lg:justify-start order-2 lg:order-1">
          <div className="w-full max-w-md h-96 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center border border-neutral-300">
            <img
              src="https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=500&h=600&fit=crop"
              alt="Gallery Space"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Right side - Content */}
        <div className="flex flex-col justify-center space-y-8 order-1 lg:order-2">
          <div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light italic tracking-tight text-neutral-900 leading-tight">
              HOUSTON
            </h1>
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-light italic tracking-tight text-neutral-900 leading-tight">
              MFA
            </h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-neutral-600 text-lg max-w-md leading-relaxed font-light">
              Explore world-class contemporary art and discover the creative vision of our diverse community of artists.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-neutral-500">
                Status: <strong className={health?.ok ? "text-green-600" : "text-neutral-600"}>
                  {health?.ok ? "Online" : "Connecting..."}
                </strong>
              </span>
            </div>
          </div>
          
          {/* ✅ UPDATED BUTTONS WITH LINKS */}
          <div className="flex gap-4 pt-4">
            <Link 
              to="/login" 
              className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-3 border border-neutral-300 text-neutral-900 font-medium rounded-lg hover:bg-neutral-50 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}