import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import UploadBox from "../components/UploadBox";
import { useAnalysis } from "../context/AnalysisContext";

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { saveAnalysis } = useAnalysis();

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Save to context and navigate to results page
      saveAnalysis(res.data.analysis, file.name);
      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
      console.error("Analysis error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 lg:py-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1f7a63]/10 dark:bg-[#2dd4a1]/20 rounded-full mb-4 sm:mb-6">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#1f7a63] dark:text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-[#1f7a63] dark:text-[#2dd4a1]">Document Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            Analyze Environmental Report
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
            Upload your PDF document for instant AI-powered insights
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-l-4 border-red-500 rounded-lg px-6 py-4 flex items-start gap-3 mb-6"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 lg:p-16 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-gray-200 dark:border-gray-700 border-t-[#1f7a63] dark:border-t-[#2dd4a1] rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Analyzing Document</h3>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">Our AI is processing your environmental report...</p>
            <div className="mt-6 sm:mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 inline-block">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4 text-[#1f7a63] dark:text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>This usually takes 10-30 seconds</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UploadBox
              file={file}
              setFile={setFile}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
