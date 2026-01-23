import { createContext, useContext, useState, useEffect, useRef } from "react";

const AnalysisContext = createContext(null);

// Get initial data synchronously from localStorage
const getStoredAnalysis = () => {
  try {
    const saved = localStorage.getItem('greenGptAnalysis');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("Loaded analysis from localStorage:", parsed.fileName);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load analysis:", e);
  }
  return { result: null, fileName: null };
};

export function AnalysisProvider({ children }) {
  // Use ref to get initial value synchronously 
  const initialData = useRef(getStoredAnalysis()).current;
  const [analysisResult, setAnalysisResult] = useState(initialData.result);
  const [fileName, setFileName] = useState(initialData.fileName);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (analysisResult && fileName) {
      console.log("Saving analysis to localStorage:", fileName);
      localStorage.setItem('greenGptAnalysis', JSON.stringify({
        result: analysisResult,
        fileName: fileName
      }));
    }
  }, [analysisResult, fileName]);

  const saveAnalysis = (result, file) => {
    setAnalysisResult(result);
    setFileName(file);
    localStorage.setItem('greenGptAnalysis', JSON.stringify({
      result: result,
      fileName: file
    }));
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setFileName(null);
    localStorage.removeItem('greenGptAnalysis');
  };

  const hasAnalysis = () => {
    return analysisResult !== null && fileName !== null;
  };

  return (
    <AnalysisContext.Provider value={{ 
      analysisResult, 
      fileName, 
      saveAnalysis, 
      clearAnalysis,
      hasAnalysis
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}
