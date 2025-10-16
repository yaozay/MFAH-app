import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-black border-b border-neutral-800">
      <div className="container flex h-20 items-center justify-between px-6 lg:px-12">
        
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold tracking-tight text-white">HOUSTON MFA</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-12">
          <NavLink 
            to="/events" 
            className={({ isActive }) =>
              "text-lg font-medium transition " +
              (isActive
                ? "text-rose-300"
                : "text-rose-300 hover:text-rose-200")
            }
          >
            EVENTS
          </NavLink>
          <NavLink 
            to="/membership" 
            className={({ isActive }) =>
              "text-lg font-medium transition " +
              (isActive
                ? "text-rose-300"
                : "text-rose-300 hover:text-rose-200")
            }
          >
            MEMBERSHIP
          </NavLink>
          <NavLink 
            to="/tickets" 
            className={({ isActive }) =>
              "text-lg font-medium transition " +
              (isActive
                ? "text-rose-300"
                : "text-rose-300 hover:text-rose-200")
            }
          >
            TICKETS
          </NavLink>
          <button className="text-lg font-medium text-white hover:text-rose-300 transition">
            LOGIN
          </button>
        </nav>
      </div>
    </header>
  );
}