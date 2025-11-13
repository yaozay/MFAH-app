import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import cartIcon from "../assets/cart.png";
import { useCart } from "./Cart/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  const baseLink =
    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400";

  const linkStyle = ({ isActive }) =>
    [
      baseLink,
      isActive ? "text-white" : "text-neutral-400 hover:text-white",
    ].join(" ");

  const loginStyle = ({ isActive }) =>
    [
      baseLink,
      isActive
        ? "text-white border border-white/20"
        : "text-white border border-white/20 hover:bg-white/5",
    ].join(" ");

  const NavItems = () => (
    <>
      
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
      <NavLink to="/giftshop" className={linkStyle}>
        Gift Shop
        <ActiveUnderline />
      </NavLink>
      <NavLink to="/exhibitions" className={linkStyle}>
        Exhibitions
        <ActiveUnderline />
      </NavLink>

      {/* Role-based links */}
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
              Profile
              <ActiveUnderline />
            </NavLink>
          )}
        </>
      )}
      {user?.role === "visitor" && (
        <NavLink to="/cart" className="relative group px-2 py-1">
          <img
            src={cartIcon}
            alt="Cart"
            className="w-6 h-6 invert brightness-200"

          />

          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-xs px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </NavLink>

      )}
      {!user ? (
        <NavLink to="/login" className={loginStyle}>
          Login
          <ActiveUnderline />
        </NavLink>
      ) : (
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-white border border-white/20 hover:bg-white/5 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          Logout
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-6 sm:px-8">
          <NavLink
            to="/DashboardVisitor"
            className="text-xl font-semibold tracking-tight text-white hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-md px-2"
          >
            HOUSTON MFA
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            <NavItems />
          </nav>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-neutral-400 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 transition"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-800">
          <nav
            className="mx-auto max-w-7xl px-6 sm:px-8 py-3 flex flex-col gap-2"
            onClick={() => setOpen(false)}
          >
            <NavItems />

            {user?.role === "visitor" && (
              <NavLink to="/cart" className={linkStyle}>

                <ActiveUnderline />
              </NavLink>
            )}
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
      className="pointer-events-none absolute inset-x-4 -bottom-1 h-px scale-x-0 bg-white transition-transform duration-200 [a[aria-current='page']_&]:scale-x-100"
    />
  );
}

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
