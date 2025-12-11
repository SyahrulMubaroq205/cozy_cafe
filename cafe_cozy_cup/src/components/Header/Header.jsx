import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const linkClass = (path) =>
    location.pathname === path
      ? "text-white font-bold border-b-2 border-white pb-1"
      : "text-white/70 hover:text-white transition";

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl 
      flex items-center justify-between rounded-2xl px-6 py-3
      bg-purple-600/30 backdrop-blur-md shadow-lg border border-white/30 z-50"
    >
      {/* Logo */}
      <div className="text-2xl font-bold text-white drop-shadow-md">
        Cozy Cafe
      </div>

      {/* Greeting (only when logged in) */}
      {user && (
        <span className="hidden md:block text-white font-semibold drop-shadow-sm">
          Hi, {user.name}
        </span>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        {!user && (
          <>
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>

            <Link to="/menu" className={linkClass("/menu")}>
              Menu
            </Link>
          </>
        )}

        {user && user.role === "customer" && (
          <>
            <Link to="/menu" className={linkClass("/menu")}>
              Menu
            </Link>

            <Link to="/checkout" className={linkClass("/checkout")}>
              Checkout
            </Link>

            <Link
              to="/payment-history"
              className={linkClass("/payment-history")}
            >
              Payment History
            </Link>
          </>
        )}
      </div>

      {/* Desktop Auth */}
      <div className="hidden md:flex items-center gap-4">
        {!user && (
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-white/20 text-white 
            hover:bg-white/30 backdrop-blur-sm transition font-semibold"
          >
            Login
          </Link>
        )}

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition font-semibold"
          >
            <FiLogOut /> Logout
          </button>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden text-white text-3xl"
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 w-[90%] 
          bg-purple-900/90 backdrop-blur-lg shadow-lg border border-white/10 
          rounded-xl flex flex-col items-center py-6 gap-4 md:hidden transition-all duration-300"
        >
          {/* Links */}
          {!user && (
            <>
              <Link to="/" className={linkClass("/")} onClick={() => setOpen(false)}>
                Home
              </Link>

              <Link to="/menu" className={linkClass("/menu")} onClick={() => setOpen(false)}>
                Menu
              </Link>
            </>
          )}

          {user && user.role === "customer" && (
            <>
              <Link to="/menu" className={linkClass("/menu")} onClick={() => setOpen(false)}>
                Menu
              </Link>

              <Link to="/checkout" className={linkClass("/checkout")} onClick={() => setOpen(false)}>
                Checkout
              </Link>

              <Link
                to="/payment-history"
                className={linkClass("/payment-history")}
                onClick={() => setOpen(false)}
              >
                Payment History
              </Link>
            </>
          )}

          {/* Mobile Auth Buttons */}
          {!user && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-white/20 text-white 
              hover:bg-white/30 backdrop-blur-sm transition font-semibold"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition font-semibold"
            >
              <FiLogOut /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
