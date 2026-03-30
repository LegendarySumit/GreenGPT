import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateUserProfile, changeUserPassword } = useAuth();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [editForm, setEditForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [preferences, setPreferences] = useState({ 
    notifications: true, 
    emailUpdates: true,
    darkMode: true,
    language: "en"
  });

  const selectedTierName = user?.plan?.name || 'Free Trial';

  const closeModal = () => {
    setActiveModal(null);
    setStatusMessage({ type: "", message: "" });
  };

  const handleEditProfile = (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", message: "" });

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setStatusMessage({ type: "error", message: "Name and email are required." });
      return;
    }

    setActionLoading(true);
    updateUserProfile({ name: editForm.name, email: editForm.email }).then((result) => {
      setStatusMessage({ type: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setTimeout(() => closeModal(), 900);
      }
    }).finally(() => setActionLoading(false));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", message: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage({ type: "error", message: "Passwords don't match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setStatusMessage({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setActionLoading(true);
    changeUserPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    }).then((result) => {
      setStatusMessage({ type: result.success ? "success" : "error", message: result.message });
      if (result.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => closeModal(), 900);
      }
    }).finally(() => setActionLoading(false));
  };

  const handleSavePreferences = () => {
    setStatusMessage({ type: "success", message: "Preferences saved successfully!" });
    setTimeout(() => closeModal(), 700);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#2dd4a1]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
            y: [0, 25, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-[#1f7a63]/15 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-gray-300/50 dark:border-white/20 rounded-full mb-3"
          >
            <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">My Profile</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </motion.div>

        {/* Horizontal Layout: Profile Info + Stats on Left, Quick Actions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Section: Profile Info + Stats (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-2xl border border-gray-200 dark:border-white/20 p-5 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-gray-200 dark:border-white/10 text-center sm:text-left">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 sm:w-16 sm:h-16 bg-linear-to-br from-[#1f7a63] to-[#2dd4a1] rounded-xl flex items-center justify-center shadow-lg shrink-0"
                >
                  <span className="text-3xl sm:text-2xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-1 bg-[#2dd4a1]/20 text-[#2dd4a1] rounded-full text-xs font-semibold">
                      Active
                    </span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-full text-xs">
                      Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="px-2 py-1 bg-[#1f7a63]/20 text-[#1f7a63] dark:text-[#2dd4a1] rounded-full text-xs font-semibold">
                      {selectedTierName} Plan
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                      Full Name
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                      Email Address
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                      Account ID
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono truncate">{user?.id}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-white/10">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                      Account Status
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#2dd4a1] rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-xl border border-gray-200 dark:border-white/20 p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-[#2dd4a1]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Documents
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-xl border border-gray-200 dark:border-white/20 p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-[#2dd4a1]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Chats
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-xl border border-gray-200 dark:border-white/20 p-4 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-[#2dd4a1]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Hours Saved
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </motion.div>
            </div>
          </div>

          {/* Right Section: Quick Actions (1 column) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-2xl border border-gray-200 dark:border-white/20 p-5 shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                onClick={() => setActiveModal('edit')}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all group w-full"
              >
                <div className="w-10 h-10 bg-[#1f7a63]/20 group-hover:bg-[#1f7a63]/30 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Edit Profile</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Update your information</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setActiveModal('password')}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all group w-full"
              >
                <div className="w-10 h-10 bg-[#1f7a63]/20 group-hover:bg-[#1f7a63]/30 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Change Password</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Update your security</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setActiveModal('preferences')}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all group w-full"
              >
                <div className="w-10 h-10 bg-[#1f7a63]/20 group-hover:bg-[#1f7a63]/30 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Preferences</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Customize your experience</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setActiveModal('activity')}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all group w-full"
              >
                <div className="w-10 h-10 bg-[#1f7a63]/20 group-hover:bg-[#1f7a63]/30 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-sm">View Activity</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Check your history</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all group w-full"
              >
                <div className="w-10 h-10 bg-[#1f7a63]/20 group-hover:bg-[#1f7a63]/30 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Back to Home</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Return to dashboard</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === 'edit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/20 p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
              <form onSubmit={handleEditProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] outline-none"
                  />
                </div>
                {statusMessage.message && (
                  <p className={`text-sm ${statusMessage.type === 'success' ? 'text-emerald-500 dark:text-emerald-300' : 'text-red-500 dark:text-red-300'}`}>
                    {statusMessage.message}
                  </p>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[#1f7a63] hover:bg-[#155744] text-white font-bold rounded-lg transition-colors shadow-lg"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'password' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/20 p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#2dd4a1] outline-none"
                  />
                </div>
                {statusMessage.message && (
                  <p className={`text-sm ${statusMessage.type === 'success' ? 'text-emerald-500 dark:text-emerald-300' : 'text-red-500 dark:text-red-300'}`}>
                    {statusMessage.message}
                  </p>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[#1f7a63] hover:bg-[#155744] text-white font-bold rounded-lg transition-colors shadow-lg"
                  >
                    {actionLoading ? 'Updating...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'preferences' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/20 p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-semibold">Notifications</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Receive app notifications</p>
                  </div>
                  <button
                    onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                    className={`relative w-12 h-6 rounded-full transition-colors ${preferences.notifications ? 'bg-[#2dd4a1]' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${preferences.notifications ? 'transform translate-x-6' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-semibold">Email Updates</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get email notifications</p>
                  </div>
                  <button
                    onClick={() => setPreferences({...preferences, emailUpdates: !preferences.emailUpdates})}
                    className={`relative w-12 h-6 rounded-full transition-colors ${preferences.emailUpdates ? 'bg-[#2dd4a1]' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${preferences.emailUpdates ? 'transform translate-x-6' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-semibold">Dark Mode</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Use dark theme</p>
                  </div>
                  <button
                    onClick={() => setPreferences({...preferences, darkMode: !preferences.darkMode})}
                    className={`relative w-12 h-6 rounded-full transition-colors ${preferences.darkMode ? 'bg-[#2dd4a1]' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${preferences.darkMode ? 'transform translate-x-6' : ''}`} />
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                  <label className="block text-gray-900 dark:text-white font-semibold mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2dd4a1] outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="en" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">English</option>
                    <option value="es" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Español</option>
                    <option value="fr" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Français</option>
                    <option value="de" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Deutsch</option>
                    <option value="hi" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">हिंदी</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {statusMessage.message && (
                  <p className={`text-sm ${statusMessage.type === 'success' ? 'text-emerald-500 dark:text-emerald-300' : 'text-red-500 dark:text-red-300'}`}>
                    {statusMessage.message}
                  </p>
                )}
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 py-3 bg-[#1f7a63] hover:bg-[#155744] text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  Save Preferences
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'activity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/20 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Activity History</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#2dd4a1]/20 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 dark:text-white font-semibold">Logged in</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Just now</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#2dd4a1]/20 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 dark:text-white font-semibold">Account created</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Today</p>
                    </div>
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500 dark:text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No more activity to show</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-full mt-6 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
