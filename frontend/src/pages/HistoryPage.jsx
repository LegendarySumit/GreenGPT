import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useAnalysis } from "../context/AnalysisContext";

const RISK_CONFIG = {
  High: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-700",
    bar: "bg-red-500",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  Medium: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700",
    bar: "bg-amber-500",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  Low: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700",
    bar: "bg-emerald-500",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
};

function formatDate(dateVal) {
  if (!dateVal) return "";
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateVal) {
  if (!dateVal) return "";
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HistoryPage() {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter]         = useState("All");

  const navigate           = useNavigate();
  const { getToken, user } = useAuth();
  const { saveAnalysis }   = useAnalysis();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analyze/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleOpen = (item) => {
    saveAnalysis(item.analysis, item.fileName, item.fileSizeBytes);
    navigate("/results");
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const token = await getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/analyze/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // keep item if delete fails
    }
    setDeletingId(null);
  };

  const counts   = history.reduce((acc, h) => {
    const normalized = (h.riskLevel || "Low").charAt(0).toUpperCase() + (h.riskLevel || "Low").slice(1).toLowerCase();
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});
  const filtered = filter === "All" ? history : history.filter((h) => {
    const normalized = (h.riskLevel || "Low").charAt(0).toUpperCase() + (h.riskLevel || "Low").slice(1).toLowerCase();
    return normalized === filter;
  });
  const FILTERS  = ["All", "High", "Medium", "Low"];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-1.5 text-sm text-[#1f7a63] dark:text-[#2dd4a1] hover:opacity-80 transition-opacity mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Analyse
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Analysis History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              All your saved PDF analyses in one place
            </p>
          </div>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-medium transition-colors text-sm shrink-0 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </Link>
        </div>

        {/* ── Stats ── */}
        {!loading && history.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "Total",       value: history.length,     color: "text-gray-900 dark:text-white",               bar: "bg-gray-400" },
              { label: "High Risk",   value: counts.High   || 0, color: "text-red-600 dark:text-red-400",              bar: "bg-red-500"  },
              { label: "Medium Risk", value: counts.Medium || 0, color: "text-amber-600 dark:text-amber-400",          bar: "bg-amber-500" },
              { label: "Low Risk",    value: counts.Low    || 0, color: "text-emerald-600 dark:text-emerald-400",      bar: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{s.label}</div>
                <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-1 rounded-full ${s.bar}`}
                    style={{ width: history.length ? `${(s.value / history.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && history.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {FILTERS.map((f) => {
              const cfg    = RISK_CONFIG[f];
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? f === "All"
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                        : `${cfg.bg} ${cfg.text} ${cfg.border}`
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  {cfg && cfg.icon}
                  {f}
                  <span className="bg-white/30 dark:bg-black/20 px-1.5 rounded-full">
                    {f === "All" ? history.length : (counts[f] || 0)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Scrollable cards box — fixed at ~3 cards height ── */}
        <div
          className="overflow-y-auto rounded-xl"
          style={{ height: "clamp(280px, 50vh, 440px)" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-[#1f7a63] dark:border-t-[#2dd4a1] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved analyses yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm text-sm">
                Analyse a PDF and click <span className="font-semibold text-gray-700 dark:text-gray-300">"Save to History"</span> on the results page.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-medium transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Analyse a Document
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">No <span className="font-semibold">{filter} Risk</span> analyses saved.</p>
              <button onClick={() => setFilter("All")} className="mt-3 text-sm text-[#1f7a63] dark:text-[#2dd4a1] hover:underline">
                Show all
              </button>
            </div>
          ) : (
            <div className="space-y-3 pr-1">
              <AnimatePresence initial={false}>
                {filtered.map((item, i) => {
                  const riskRaw    = item.riskLevel || "Low";
                  const risk       = riskRaw.charAt(0).toUpperCase() + riskRaw.slice(1).toLowerCase();
                  const cfg        = RISK_CONFIG[risk] || RISK_CONFIG.Low;
                  const isDeleting = deletingId === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => handleOpen(item)}
                        disabled={isDeleting}
                        className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 sm:px-5 sm:py-4 hover:border-[#1f7a63] dark:hover:border-[#2dd4a1] hover:shadow-md transition-all duration-200 disabled:opacity-50"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="hidden xs:flex shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-[#1f7a63]/10 dark:bg-[#2dd4a1]/10 rounded-xl items-center justify-center mt-0.5">
                            <svg className="w-5 h-5 text-[#1f7a63] dark:text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1 pr-6 sm:pr-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {item.fileName}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {cfg.icon}
                                {risk} Risk
                              </span>
                            </div>
                            {item.summary && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                                {item.summary}
                              </p>
                            )}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(item.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(item.createdAt)}
                              </span>
                              {item.fileSizeBytes > 0 && <span>{formatFileSize(item.fileSizeBytes)}</span>}
                            </div>
                          </div>

                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors shrink-0 mt-1 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      {/* Delete — always visible on mobile, hover-only on sm+ */}
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={isDeleting}
                        title="Delete"
                        className="absolute top-3 right-3 sm:right-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-500 dark:text-red-400 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
