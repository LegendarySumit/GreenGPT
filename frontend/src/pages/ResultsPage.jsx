import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ResultCard from "../components/ResultCard";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, fileName } = location.state || {};

  if (!result) {
    navigate("/analyze");
    return null;
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
          <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
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
