import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Artists from "./components/Artists.jsx";
import Artworks from "./components/Artworks.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Navbar />
      <main className="container mt-8 space-y-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artworks" element={<Artworks />} />
          {/* Fallback to Home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="container mt-16 mb-8 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} MFAH Student Project
      </footer>
    </div>
  );
}
