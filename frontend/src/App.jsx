import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Events from "./components/Events.jsx";
import Membership from "./components/Membership.jsx";
import Tickets from "./components/Tickets.jsx";
import Artists from "./components/Artists.jsx";
import Artworks from "./components/Artworks.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artworks" element={<Artworks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="container mt-16 mb-8 text-center text-xs text-neutral-400 bg-white">
        © {new Date().getFullYear()} MFAH Student Project
      </footer>
    </div>
  );
}