import { NavLink } from "react-router-dom";

const link = ({ isActive }) =>
  "rounded-xl px-3 py-2 text-sm font-medium transition " +
  (isActive
    ? "bg-neutral-800 text-white"
    : "text-neutral-300 hover:text-white hover:bg-neutral-800/70");

export default function Navbar() {
  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-violet-600" />
          <span className="font-semibold tracking-tight">MFAH</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={link} end>
            Home
          </NavLink>
          <NavLink to="/artists" className={link}>
            Artists
          </NavLink>
          <NavLink to="/artworks" className={link}>
            Artworks
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
