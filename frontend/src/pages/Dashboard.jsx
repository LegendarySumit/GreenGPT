import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Dashboard() {
  const [email, setEmail] = useState("");

  const recentAnalyses = [
    { 
      id: 1, 
      name: "Mumbai Air Quality Assessment 2026", 
      filename: "Mumbai_Air_Report.pdf",
      date: "Jan 18, 2026", 
      risk: "High",
      category: "Air Quality",
      size: "2.4 MB",
      insights: 12
    },
    { 
      id: 2, 
      name: "Delhi Water Quality Analysis", 
      filename: "Delhi_Water_Quality.pdf",
      date: "Jan 17, 2026", 
      risk: "Medium",
      category: "Water Management",
      size: "1.8 MB",
      insights: 8
    },
    { 
      id: 3, 
      name: "Bangalore Waste Management Report", 
      filename: "Bangalore_Waste_Management.pdf",
      date: "Jan 16, 2026", 
      risk: "Low",
      category: "Waste Management",
      size: "3.1 MB",
      insights: 15
    },
  ];

  const stats = [
    { 
      label: "Total Documents", 
      value: "24", 
      change: "+12%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: "AI Insights Generated", 
      value: "847", 
      change: "+28%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    { 
      label: "Critical Issues Flagged", 
      value: "5", 
      change: "-18%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    { 
      label: "Environmental Impact Score", 
      value: "87%", 
      change: "+5%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const quickActions = [
    {
      title: "Analyze New Document",
      description: "Upload environmental reports for instant AI-powered insights",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: "/analyze",
      gradient: "from-[#1f7a63] to-[#155744]"
    },
    {
      title: "AI Chat Assistant",
      description: "Ask questions about documents, get instant environmental insights",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      link: "/chat",
      gradient: "from-[#2dd4a1] to-[#1f7a63]"
    },
  ];

  const recentActivity = [
    { action: "Document analyzed", document: "Climate Impact Report", time: "2 hours ago", status: "completed" },
    { action: "AI insights generated", document: "Water Quality Assessment", time: "5 hours ago", status: "completed" },
    { action: "Report shared", document: "Air Pollution Study", time: "1 day ago", status: "shared" },
    { action: "Document uploaded", document: "Waste Management Plan", time: "2 days ago", status: "uploaded" },
    { action: "Analysis completed", document: "Soil Quality Report", time: "3 days ago", status: "completed" },
    { action: "Insights exported", document: "Carbon Footprint Analysis", time: "4 days ago", status: "completed" },
  ];

  const documentCategories = [
    { name: "Air Quality", count: 8, color: "from-blue-500 to-cyan-500", percentage: 33 },
    { name: "Water Management", count: 7, color: "from-teal-500 to-emerald-500", percentage: 29 },
    { name: "Waste Management", count: 5, color: "from-green-500 to-lime-500", percentage: 21 },
    { name: "Climate Action", count: 4, color: "from-amber-500 to-orange-500", percentage: 17 },
  ];

  const quickInsights = [
    { 
      title: "Trending Topic", 
      text: "Air Quality reports increased by 45% this month",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-blue-600"
    },
    { 
      title: "AI Recommendation", 
      text: "Review high-risk documents for immediate action",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "text-amber-600"
    },
    { 
      title: "Success Metric", 
      text: "Your analyses helped reduce emissions by 12%",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-green-600"
    },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1f7a63] to-[#155744] dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-7 md:py-10 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#2dd4a1] rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">Welcome Back!</h1>
                <p className="text-[#2dd4a1] text-xs sm:text-sm md:text-base lg:text-lg mt-0.5 sm:mt-1 leading-tight">Your Environmental Intelligence Hub</p>
              </div>
            </div>
            <p className="text-white/90 text-sm sm:text-base md:text-base lg:text-lg max-w-2xl leading-relaxed">
              Monitor your environmental analyses, track impact metrics, and discover actionable insights powered by AI.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 min-h-[130px] sm:min-h-[145px] md:min-h-[155px] lg:min-h-[160px] flex flex-col hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-[#1f7a63] to-[#2dd4a1] rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6">
                    {stat.icon}
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-[#2dd4a1] bg-[#2dd4a1]/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 line-clamp-2">{stat.label}</h3>
              <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-auto">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.link}>
              <motion.div
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`bg-gradient-to-br ${action.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-5 lg:p-6 text-white shadow-xl border border-white/10 group min-h-[110px] sm:min-h-[120px] md:h-28 lg:h-32`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-white/20 backdrop-blur-lg p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:bg-white/30 transition-all duration-300 shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8">
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-1.5 md:mb-2 group-hover:translate-x-1 transition-transform duration-300 line-clamp-1">
                      {action.title}
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm md:text-sm lg:text-base line-clamp-2">{action.description}</p>
                  </div>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Left Column - Recent Analyses + widgets */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden max-h-[500px] sm:h-[600px] flex flex-col"
            >
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Recent Analyses</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-1">Your latest environmental assessments</p>
                  </div>
                  <Link to="/analyze" className="text-[#1f7a63] dark:text-[#2dd4a1] font-semibold hover:underline text-xs sm:text-sm whitespace-nowrap shrink-0">
                    View All →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 flex-1 overflow-y-auto">
                {recentAnalyses.map((analysis, idx) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                      {/* Icon */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#1f7a63]/10 to-[#2dd4a1]/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#1f7a63] dark:text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1 sm:mb-2">
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors line-clamp-2">
                              {analysis.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{analysis.filename}</p>
                          </div>
                          <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${
                            analysis.risk === "High"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : analysis.risk === "Medium"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 sm:mr-1.5 ${
                              analysis.risk === "High"
                                ? "bg-red-500"
                                : analysis.risk === "Medium"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}></span>
                            {analysis.risk} Risk
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="truncate">{analysis.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{analysis.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">{analysis.insights} insights</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] group-hover:translate-x-1 transition-all duration-300 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200/50 dark:border-gray-700/50">
                <Link to="/analyze" className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-300">
                  Analyze New Document
                </Link>
              </div>
            </motion.div>

            {/* Document Categories - In Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden max-h-[300px] sm:h-[350px] flex flex-col"
            >
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Document Categories</h3>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
                {documentCategories.map((category, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    className="space-y-1.5 sm:space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-gray-900 dark:text-white truncate pr-2">{category.name}</span>
                      <span className="text-gray-600 dark:text-gray-400 shrink-0">{category.count} docs</span>
                    </div>
                    <div className="relative h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: 1 + idx * 0.1, duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${category.color} rounded-full`}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Impact Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-br from-[#2dd4a1] to-[#1f7a63] rounded-xl sm:rounded-2xl shadow-xl text-white pt-2"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl flex items-center justify-center mx-3 sm:mx-6 mt-3 sm:mt-6 mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="px-3 sm:px-6">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Your Impact</h3>
                <div className="mb-3 sm:mb-4">
                  <div className="text-3xl sm:text-4xl font-bold mb-1">87%</div>
                  <p className="text-white/90 text-xs sm:text-sm">Environmental Improvement Score</p>
                </div>
              </div>
              <div className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="bg-white/20 backdrop-blur-lg rounded-full h-2 sm:h-3 overflow-hidden mb-3 sm:mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "87%" }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="h-full bg-white rounded-full"
                  ></motion.div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-xs text-white/80">
                    Your analyses have contributed to improved environmental decision-making
                  </p>
                  <p className="text-xs text-white/70">
                    Track your positive impact on sustainability initiatives
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Grid of widgets */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Recent Activity - Spans full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="col-span-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden max-h-[500px] sm:h-[600px] flex flex-col"
            >
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 flex-1 overflow-y-auto">
                {recentActivity.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                      activity.status === "completed" ? "bg-[#2dd4a1]" :
                      activity.status === "shared" ? "bg-blue-500" :
                      "bg-gray-400"
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{activity.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{activity.document}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden max-h-[300px] sm:h-[350px] flex flex-col"
            >
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2dd4a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Quick Insights</h3>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 flex-1 overflow-y-auto">
                {quickInsights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + idx * 0.1 }}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center ${insight.color}`}>
                        {insight.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 line-clamp-1">{insight.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{insight.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-[#1f7a63] to-[#155744] rounded-xl sm:rounded-2xl shadow-xl text-white pt-2"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl flex items-center justify-center mx-3 sm:mx-6 mt-3 sm:mt-6 mb-2 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="px-3 sm:px-6">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Stay Updated</h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4">
                  Get weekly insights on environmental trends and GreenGPT updates.
                </p>
              </div>
              <div className="px-3 sm:px-6 pb-3 sm:pb-6">
                <form onSubmit={handleNewsletterSubmit} className="space-y-2 sm:space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base bg-white/20 backdrop-blur-lg border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-[#1f7a63] rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all duration-300"
                  >
                    Subscribe Now
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
