import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ResultCard from "../components/ResultCard";
import { useAnalysis } from "../context/AnalysisContext";
import { useAuth } from "../context/AuthContext";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { analysisResult: result, fileName, fileSizeBytes, clearAnalysis } = useAnalysis();
  const { getToken } = useAuth();

  const [isReady, setIsReady]     = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  // Wait a tick to ensure context is fully loaded from localStorage
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !result) navigate("/analyze");
  }, [result, navigate, isReady]);

  if (!isReady || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1f7a63] rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSave = async () => {
    if (saveState === "saved" || saveState === "saving") return;
    setSaveState("saving");
    try {
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analyze/save`,
        { fileName, fileSizeBytes, analysis: result },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveState("saved");
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const SaveButton = () => {
    if (saveState === "saved") {
      return (
        <button
          disabled
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base cursor-default"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Saved to History
        </button>
      );
    }
    if (saveState === "error") {
      return (
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Save Failed — Retry
        </button>
      );
    }
    return (
      <button
        onClick={handleSave}
        disabled={saveState === "saving"}
        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-[#1f7a63] hover:bg-[#155744] disabled:opacity-70 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        {saveState === "saving" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h8a2 2 0 012 2v2H5V5zM3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            Save to History
          </>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="w-full sm:w-auto">
            <Link
              to="/dashboard"
              onClick={clearAnalysis}
              className="text-[#1f7a63] dark:text-[#2dd4a1] hover:text-[#155744] dark:hover:text-[#1f7a63] font-medium mb-2 inline-block text-sm sm:text-base"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analysis Complete</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 truncate">Document: {fileName}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Save to History */}
            <SaveButton />

            {/* New Analysis */}
            <button
              onClick={() => { clearAnalysis(); navigate("/analyze"); }}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Analysis
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ResultCard data={result} />
        </motion.div>
      </div>
    </div>
  );
}
