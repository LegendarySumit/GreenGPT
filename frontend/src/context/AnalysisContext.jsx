import { createContext, useContext, useState } from "react";

const AnalysisContext = createContext(null);

const getStoredAnalysis = () => {
  try {
    const saved = localStorage.getItem("greenGptAnalysis");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load analysis:", e);
  }
  return { result: null, fileName: null, fileSizeBytes: 0 };
};

export function AnalysisProvider({ children }) {
  const initialData = getStoredAnalysis();
  const [analysisResult, setAnalysisResult] = useState(initialData.result);
  const [fileName, setFileName] = useState(initialData.fileName);
  const [fileSizeBytes, setFileSizeBytes] = useState(initialData.fileSizeBytes || 0);

  const saveAnalysis = (result, file, sizeBytes = 0) => {
    setAnalysisResult(result);
    setFileName(file);
    setFileSizeBytes(sizeBytes);
    localStorage.setItem(
      "greenGptAnalysis",
      JSON.stringify({ result, fileName: file, fileSizeBytes: sizeBytes })
    );
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setFileName(null);
    setFileSizeBytes(0);
    localStorage.removeItem("greenGptAnalysis");
  };

  const hasAnalysis = () => analysisResult !== null && fileName !== null;

  return (
    <AnalysisContext.Provider
      value={{ analysisResult, fileName, fileSizeBytes, saveAnalysis, clearAnalysis, hasAnalysis }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error("useAnalysis must be used within AnalysisProvider");
  return context;
}
