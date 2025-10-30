import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const baseLink =
    "relative px-2 py-1 text-base font-medium transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60";

  const linkStyle = ({ isActive }) =>
    [
      baseLink,
      isActive
        ? "text-rose-200"
        : "text-rose-300 hover:text-rose-200",
      "hover:bg-white/5",
    ].join(" ");

  const loginStyle = ({ isActive }) =>
    [
      baseLink,
      isActive ? "text-rose-200" : "text-white hover:text-rose-300",
      "hover:bg-white/5",
    ].join(" ");

  const NavItems = () => (
    <>
      {/* Public */}

      {(!user || user.role === "visitor") && (
        <NavLink to="/art" className={linkStyle}>
          Art
          <ActiveUnderline />
        </NavLink>
      )}
      <NavLink to="/membership" className={linkStyle}>
        Membership
        <ActiveUnderline />
      </NavLink>
      <NavLink to="/tickets" className={linkStyle}>
        Tickets
        <ActiveUnderline />
      </NavLink>
      <NavLink to="/events" className={linkStyle}>
        Events
        <ActiveUnderline />
      </NavLink>

      {/* Authenticated */}
      {user && (
        <>
          {(user.role === "admin" || user.role === "employee") && (
            <>
              <NavLink to="/artists" className={linkStyle}>
                Artists
                <ActiveUnderline />
              </NavLink>
              <NavLink to="/artworks" className={linkStyle}>
                Artworks
                <ActiveUnderline />
              </NavLink>
              <NavLink to="/reports" className={linkStyle}>
                Reports
                <ActiveUnderline />
              </NavLink>
            </>
          )}

          {user.role === "admin" && (
            <NavLink to="/admin" className={linkStyle}>
              Admin
              <ActiveUnderline />
            </NavLink>
          )}
          {user.role === "employee" && (
            <NavLink to="/employee" className={linkStyle}>
              Employee
              <ActiveUnderline />
            </NavLink>
          )}
          {user.role === "visitor" && (
            <NavLink to="/visitor" className={linkStyle}>
              Visitor
              <ActiveUnderline />
            </NavLink>
          )}
          { }
        </>
      )}

      {/* Login / Logout */}
      {!user ? (
        <NavLink to="/login" className={loginStyle}>
          Login
          <ActiveUnderline />
        </NavLink>
      ) : (
        <button
          onClick={logout}
          className="px-2 py-1 text-base font-medium text-white hover:text-rose-300 hover:bg-white/5 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
        >
          Logout
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/85 shadow-sm">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink
            to="/DashboardVisitor"
            className="text-xl sm:text-2xl font-semibold tracking-tight text-white transition-colors hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 rounded-md"
          >
            HOUSTON MFA
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavItems />
          </nav>

          {/* Mobile toggle */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-rose-200 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 transition"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-neutral-800">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2"
            onClick={() => setOpen(false)}
          >
            <NavItems />
          </nav>
        </div>
      )}
    </header>
  );
}

function ActiveUnderline() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 -bottom-1 h-0.5 scale-x-0 bg-rose-300/70 transition-transform duration-200 [a[aria-current='page']_&]:scale-x-100"
    />
  );
}

/* Icons */
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}
