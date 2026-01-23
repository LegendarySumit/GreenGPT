import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ResultCard from "../components/ResultCard";
import { useAnalysis } from "../context/AnalysisContext";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { analysisResult: result, fileName, clearAnalysis } = useAnalysis();
  const [isReady, setIsReady] = useState(false);

  // Wait a tick to ensure context is fully loaded
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !result) {
      navigate("/analyze");
    }
  }, [result, navigate, isReady]);

  if (!isReady || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1f7a63] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="w-full sm:w-auto">
            <Link to="/dashboard" className="text-[#1f7a63] dark:text-[#2dd4a1] hover:text-[#155744] dark:hover:text-[#1f7a63] font-medium mb-2 inline-block text-sm sm:text-base">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analysis Complete</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 truncate">Document: {fileName}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                clearAnalysis();
                navigate("/analyze");
              }}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Analysis
            </button>
            <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
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
