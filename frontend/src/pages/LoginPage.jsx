import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState({ type: "", message: "" });
  const [resetLoading, setResetLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetStatus({ type: "", message: "" });

    if (!resetEmail) {
      setResetStatus({ type: "error", message: "Please enter your email address." });
      return;
    }

    setResetLoading(true);
    const result = await resetPassword(resetEmail);
    setResetStatus({
      type: result.success ? "success" : "error",
      message: result.message,
    });
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
          alt="Nature background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to bottom right, rgb(0 0 0 / 0.6), rgb(15 23 42 / 0.7), rgb(31 122 99 / 0.4))" }}></div>
      </div>

      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-[#2dd4a1]/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -25, 0],
          y: [0, 15, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-40 h-40 sm:w-80 sm:h-80 bg-[#1f7a63]/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.05, 0.15, 0.05],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[599px] h-72 sm:h-[599px] bg-white/5 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-4 sm:mb-6"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-white">Sign In</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base text-gray-300"
          >
            Sign in to your GreenGPT account
          </motion.p>
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.01, y: -5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] focus:border-transparent focus:bg-white/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] focus:border-transparent focus:bg-white/20 outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#1f7a63] bg-white/20 border-white/30 rounded focus:ring-[#2dd4a1]" />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowReset((prev) => !prev);
                  setResetEmail(email || "");
                  setResetStatus({ type: "", message: "" });
                }}
                className="text-sm text-[#2dd4a1] hover:text-[#1f7a63] font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {showReset && (
              <div className="space-y-3 rounded-lg border border-white/20 bg-white/10 p-3">
                <label className="block text-sm font-semibold text-white">
                  Reset Password Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] focus:border-transparent focus:bg-white/20 outline-none transition-all"
                />
                {resetStatus.message && (
                  <p
                    className={`text-sm ${
                      resetStatus.type === "success" ? "text-emerald-300" : "text-red-200"
                    }`}
                  >
                    {resetStatus.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1f7a63] hover:bg-[#155744] text-white font-bold rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-2xl hover:shadow-[#2dd4a1]/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-8">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-gray-400 text-sm font-medium whitespace-nowrap">or continue with</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>
            </div>

            <GoogleSignInButton />
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#2dd4a1] hover:text-white font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


