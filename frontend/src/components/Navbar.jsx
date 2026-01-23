import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 transition-colors duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 sm:pr-4 lg:pr-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#1f7a63] to-[#155744] rounded-lg flex items-center justify-center shadow-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <span className="text-lg sm:text-xl font-bold tracking-wide text-gray-900 dark:text-white">GreenGPT</span>
          </Link>

          {/* Navigation Links - Center - Desktop Only */}
          <div className="hidden lg:flex items-center justify-center gap-3 xl:gap-6 flex-1 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className={`px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors ${
              location.pathname === "/" 
                ? "text-[#1f7a63] dark:text-[#2dd4a1]" 
                : "text-gray-700 dark:text-gray-300 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1]"
            }`}>
              HOME
            </Link>
            <Link to="/dashboard" className={`px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors ${
              location.pathname === "/dashboard" 
                ? "text-[#1f7a63] dark:text-[#2dd4a1]" 
                : "text-gray-700 dark:text-gray-300 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1]"
            }`}>
              DASHBOARD
            </Link>
            {isAuthenticated() ? (
              <Link to="/analyze" className={`px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors flex items-center gap-2 ${
                location.pathname === "/analyze" 
                  ? "text-[#1f7a63] dark:text-[#2dd4a1]" 
                  : "text-gray-700 dark:text-gray-300 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1]"
              }`}>
                ANALYZE
              </Link>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-not-allowed relative group"
              >
                <svg className="w-3 h-3 xl:w-4 xl:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                ANALYZE
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                  Login to access
                </div>
              </button>
            )}
            {isAuthenticated() ? (
              <Link to="/chat" className={`px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors flex items-center gap-2 ${
                location.pathname === "/chat" 
                  ? "text-[#1f7a63] dark:text-[#2dd4a1]" 
                  : "text-gray-700 dark:text-gray-300 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1]"
              }`}>
                AI CHAT
              </Link>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors flex items-center gap-2 text-gray-400 dark:text-gray-500 cursor-not-allowed relative group"
              >
                <svg className="w-3 h-3 xl:w-4 xl:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                AI CHAT
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                  Login to access
                </div>
              </button>
            )}
            <Link to="/about" className={`px-2 xl:px-3 py-2 font-bold uppercase text-xs xl:text-sm tracking-wider transition-colors ${
              location.pathname === "/about" 
                ? "text-[#1f7a63] dark:text-[#2dd4a1]" 
                : "text-gray-700 dark:text-gray-300 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1]"
            }`}>
              ABOUT
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto sm:pl-4 lg:pl-8">
            {/* Theme Toggle */}
            <div className="scale-90 sm:scale-100">
              <ThemeToggle />
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated() ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 lg:py-2 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-bold uppercase text-[10px] lg:text-xs tracking-wider transition-colors shadow-lg shadow-[#1f7a63]/20"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="hidden lg:inline">PROFILE</span>
                    </button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={handleLogout}
                      className="px-2.5 lg:px-3 py-1.5 lg:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold uppercase text-[10px] lg:text-xs tracking-wider transition-colors shadow-lg"
                    >
                      LOGOUT
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="px-2.5 lg:px-3 py-1.5 lg:py-2 text-[#1f7a63] dark:text-[#2dd4a1] hover:bg-[#e6f4ef] dark:hover:bg-gray-700 rounded-lg font-bold uppercase text-[10px] lg:text-xs tracking-wider transition-colors"
                    >
                      LOGIN
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/signup"
                      className="px-2.5 lg:px-3 py-1.5 lg:py-2 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-bold uppercase text-[10px] lg:text-xs tracking-wider transition-colors shadow-lg shadow-[#1f7a63]/20"
                    >
                      SIGN UP
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors ${
                  location.pathname === "/"
                    ? "bg-[#1f7a63] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors ${
                  location.pathname === "/dashboard"
                    ? "bg-[#1f7a63] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Dashboard
              </Link>
              {isAuthenticated() ? (
                <>
                  <Link
                    to="/analyze"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors ${
                      location.pathname === "/analyze"
                        ? "bg-[#1f7a63] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Analyze
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors ${
                      location.pathname === "/chat"
                        ? "bg-[#1f7a63] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    AI Chat
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Analyze (Login Required)
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    AI Chat (Login Required)
                  </button>
                </>
              )}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors ${
                  location.pathname === "/about"
                    ? "bg-[#1f7a63] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                About
              </Link>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {isAuthenticated() ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-3 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-bold uppercase text-sm tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-[#1f7a63] dark:text-[#2dd4a1] hover:bg-[#e6f4ef] dark:hover:bg-gray-700 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-bold uppercase text-sm tracking-wider transition-colors text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
