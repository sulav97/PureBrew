import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserCircle,
  FaChevronDown,
  FaShoppingCart,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../../context/UserContext";

export default function Navbar() {
  const { user, logout, loading } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const userDropdownRef = useRef();
  const authDropdownRef = useRef();
  const navigate = useNavigate();
  const [navbarSearch, setNavbarSearch] = useState("");

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(e.target)
      ) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownClick = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleNavbarSearch = (e) => {
    e.preventDefault();
    if (navbarSearch.trim()) {
      navigate(`/allproducts?search=${encodeURIComponent(navbarSearch.trim())}`);
    } else {
      navigate("/allproducts");
    }
  };

  if (loading) return null;

  return (
    <header className="w-full sticky top-0 z-50 bg-[#3E2C27] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="text-3xl font-extrabold text-[#f4e4d4] tracking-wide hover:opacity-90 transition">
          Pure<span className="text-[#c6a27e]">Brew</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex gap-10 text-[#f4e4d4] font-medium text-base">
          <Link to="/" className="hover:text-[#c6a27e] transition">Home</Link>
          <Link to="/allproducts" className="hover:text-[#c6a27e] transition">Beans</Link>
          <Link to="/about" className="hover:text-[#c6a27e] transition">Our Roast Story</Link>
          <Link to="/contact" className="hover:text-[#c6a27e] transition">Bean in Touch</Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* SEARCH */}
          <form
            onSubmit={handleNavbarSearch}
            className="hidden md:flex items-center px-3 py-1.5 bg-[#f4e4d4] rounded-md shadow-inner"
          >
            <input
              type="text"
              placeholder="Search beans..."
              value={navbarSearch}
              onChange={e => setNavbarSearch(e.target.value)}
              className="bg-transparent focus:outline-none text-sm text-[#3e2c27] w-56 md:w-64 lg:w-72 placeholder:text-sm"
            />
            <button type="submit" className="ml-2 text-[#3e2c27] hover:text-[#8b5e3c] transition">
              <FaSearch />
            </button>
          </form>

          {/* CART */}
          {user && (
            <Link to="/cart" className="text-[#f4e4d4] hover:text-[#c6a27e] transition" title="Cart">
              <FaShoppingCart size={20} />
            </Link>
          )}

          {/* USER LOGGED IN DROPDOWN */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <div
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 cursor-pointer text-[#f4e4d4] text-sm font-medium"
              >
                <FaUserCircle size={20} />
                <span>{user.name}</span>
                <FaChevronDown size={12} />
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white text-[#3e2c27] rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => handleDropdownClick("/my-orders")}
                      className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-100"
                    >
                      Orders <FaClipboardList size={14} />
                    </button>
                    <button
                      onClick={() => handleDropdownClick("/profile")}
                      className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-100"
                    >
                      Profile <FaUserCircle size={14} />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-100"
                    >
                      Logout <FaSignOutAlt size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // AUTH DROPDOWN FOR GUEST USERS
            <div className="relative" ref={authDropdownRef}>
              <div
                onClick={() => setAuthDropdownOpen(prev => !prev)}
                className="cursor-pointer flex items-center gap-2 text-[#f4e4d4] hover:text-[#c6a27e] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5l-4-4-4 4" />
                </svg>
                <span className="text-sm hidden md:inline">Get Started</span>
              </div>

              <AnimatePresence>
                {authDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg text-[#3e2c27] w-44 z-50 overflow-hidden"
                  >
                    <Link
                      to="/login"
                      className="block px-4 py-3 hover:bg-gray-100 text-sm font-medium"
                    >
                      ☕ Brew In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 hover:bg-gray-100 text-sm font-medium"
                    >
                      🍩 Join the Roast
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
