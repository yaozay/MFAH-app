import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  const linkStyle = ({ isActive }) =>
    "text-lg font-medium transition " +
    (isActive ? "text-rose-300" : "text-rose-300 hover:text-rose-200");

  const loginStyle = ({ isActive }) =>
    "text-lg font-medium transition " +
    (isActive ? "text-rose-300" : "text-white hover:text-rose-300");

  return (
    <header className="bg-black border-b border-neutral-800">
      <div className="container flex h-20 items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold tracking-tight text-white">
            HTX MFA
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-10">
          {/* Always visible to any logged-in user */}
          <NavLink to="/events" className={linkStyle}>
            EVENTS
          </NavLink>
          <NavLink to="/membership" className={linkStyle}>
            MEMBERSHIP
          </NavLink>
          <NavLink to="/tickets" className={linkStyle}>
            TICKETS
          </NavLink>

          {/* Authenticated routes */}
          {user && (
            <>
              {/* Shared by all roles */}
              <NavLink to="/artists" className={linkStyle}>
                ARTISTS
              </NavLink>
              <NavLink to="/artworks" className={linkStyle}>
                ARTWORKS
              </NavLink>

              {/* Role-specific dashboards */}
              {user.role === "admin" && (
                <NavLink to="/admin" className={linkStyle}>
                  ADMIN
                </NavLink>
              )}
              {user.role === "employee" && (
                <NavLink to="/employee" className={linkStyle}>
                  EMPLOYEE
                </NavLink>
              )}
              {user.role === "visitor" && (
                <NavLink to="/visitor" className={linkStyle}>
                  VISITOR
                </NavLink>
              )}
            </>
          )}

          {/* Login / Logout */}
          {!user ? (
            <NavLink to="/login" className={loginStyle}>
              LOGIN
            </NavLink>
          ) : (
            <button
              onClick={logout}
              className="ml-4 text-lg font-medium text-white hover:text-rose-300 transition"
            >
              LOGOUT
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
