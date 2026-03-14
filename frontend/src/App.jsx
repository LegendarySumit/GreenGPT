import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/chat';
  const isFixedLayout = location.pathname === '/history';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className={`flex-grow flex flex-col min-h-0${isFixedLayout ? ' overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analyze" element={
            <ProtectedRoute>
              <AnalyzePage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalysisProvider>
          <Router>
            <AppContent />
          </Router>
        </AnalysisProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

