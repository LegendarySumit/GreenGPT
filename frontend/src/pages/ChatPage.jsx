import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Get initial chat sessions from localStorage synchronously
const getStoredChatSessions = () => {
  try {
    const saved = localStorage.getItem('chatSessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
    }
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }
  return [{
    id: 1,
    title: "New Chat",
    messages: [
      {
        role: "assistant",
        content: "👋 Hi! I'm GreenGPT, your AI environmental assistant. I can help you analyze documents, answer questions about pollution data, and provide environmental insights. Try asking me something!",
        timestamp: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }];
};

// Get initial session ID
const getStoredSessionId = () => {
  try {
    const saved = localStorage.getItem('currentChatSessionId');
    if (saved) {
      return parseInt(saved, 10);
    }
  } catch (e) {}
  return 1;
};

export default function ChatPage() {
  const storedSessions = getStoredChatSessions();
  const storedSessionId = getStoredSessionId();
  
  const [chatSessions, setChatSessions] = useState(storedSessions);
  const [currentSessionId, setCurrentSessionId] = useState(
    storedSessions.find(s => s.id === storedSessionId) ? storedSessionId : storedSessions[0]?.id || 1
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Save current session ID to localStorage
  useEffect(() => {
    localStorage.setItem('currentChatSessionId', currentSessionId.toString());
  }, [currentSessionId]);

  // Create new chat session
  const createNewChat = () => {
    const newId = Math.max(...chatSessions.map(s => s.id), 0) + 1;
    const newSession = {
      id: newId,
      title: "New Chat",
      messages: [
        {
          role: "assistant",
          content: "👋 Hi! I'm GreenGPT, your AI environmental assistant. How can I help you today?",
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentSessionId(newId);
    setUploadedFiles([]);
  };

  // Switch to a chat session
  const switchToChat = (sessionId) => {
    setCurrentSessionId(sessionId);
    setUploadedFiles([]);
  };

  // Delete chat session
  const deleteChat = (sessionId) => {
    if (chatSessions.length === 1) {
      alert("Cannot delete the last chat session");
      return;
    }
    
    const filtered = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(filtered);
    
    if (sessionId === currentSessionId) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  // Start renaming chat
  const startRename = (sessionId, currentTitle) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  // Save renamed chat
  const saveRename = (sessionId) => {
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    
    setChatSessions(chatSessions.map(s => 
      s.id === sessionId 
        ? { ...s, title: editingTitle.trim() }
        : s
    ));
    setEditingSessionId(null);
    setEditingTitle("");
  };

  // Cancel rename
  const cancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  // Web Speech API Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInputMessage(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still listening (for continuous mode)
          try {
            recognitionRef.current.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
    }
  }, [isListening]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsLoading(true);
        const response = await axios.post("http://localhost:5001/api/chat/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        setUploadedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          id: response.data.fileId,
          content: response.data.content
        }]);

        // Add system message to current session
        setChatSessions(prevSessions => prevSessions.map(s => 
          s.id === currentSessionId 
            ? { 
                ...s, 
                messages: [...s.messages, {
                  role: "system",
                  content: `📎 Uploaded: ${file.name}`,
                  timestamp: new Date()
                }],
                updatedAt: new Date()
              }
            : s
        ));
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload file: " + (error.response?.data?.error || error.message));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    // Check if this is the first user message (only assistant greeting exists)
    const isFirstUserMessage = currentSession?.messages?.filter(m => m.role === "user").length === 0;
    const newTitle = isFirstUserMessage && currentSession?.title === "New Chat"
      ? inputMessage.slice(0, 35) + (inputMessage.length > 35 ? "..." : "")
      : null;

    // Add message to current session
    setChatSessions(prevSessions => prevSessions.map(s => 
      s.id === currentSessionId 
        ? { 
            ...s, 
            messages: [...s.messages, userMessage],
            updatedAt: new Date(),
            // Auto-title from first user message
            title: newTitle || s.title
          }
        : s
    ));

    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/chat/message", {
        message: inputMessage,
        files: uploadedFiles.map(f => ({ name: f.name, content: f.content })),
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.reply,
        timestamp: new Date()
      };

      // Add assistant response to current session
      setChatSessions(prevSessions => prevSessions.map(s => 
        s.id === currentSessionId 
          ? { 
              ...s, 
              messages: [...s.messages, assistantMessage],
              updatedAt: new Date()
            }
          : s
      ));
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "❌ Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setChatSessions(prevSessions => prevSessions.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, errorMessage] }
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    { 
      iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      title: "Document Analysis",
      description: "Analyze environmental reports and compliance documents",
      color: "from-blue-500 to-blue-600"
    },
    { 
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      title: "Data Comparison",
      description: "Compare pollution levels across multiple sources",
      color: "from-purple-500 to-purple-600"
    },
    { 
      iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      title: "Violation Detection",
      description: "Identify regulatory violations and compliance issues",
      color: "from-red-500 to-red-600"
    },
    { 
      iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      title: "Sustainability Insights",
      description: "Get actionable environmental recommendations",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Sidebar - Clean Gemini style */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 44 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-colors duration-300"
      >
        {/* Single row with Hamburger and New Chat */}
        <div className={`shrink-0 p-1.5 xs:p-2 sm:p-3 flex items-center gap-1 xs:gap-1.5 sm:gap-2 ${!sidebarOpen ? 'justify-center' : ''}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg className="w-4 h-4 xs:w-[18px] xs:h-[18px] sm:w-5 sm:h-5 text-gray-700 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {sidebarOpen && (
            <button
              onClick={createNewChat}
              className="flex-1 px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm"
            >
              <svg className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline">New</span>
            </button>
          )}
        </div>

        {/* Chat History */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-2 xs:px-2.5 sm:px-3 space-y-0.5 xs:space-y-1 sm:space-y-1 pb-2 xs:pb-2.5 sm:pb-3">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-lg transition-all ${
                  session.id === currentSessionId
                    ? 'bg-gray-100 dark:bg-gray-800 border border-[#1f7a63] dark:border-[#2dd4a1]'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1 p-1.5 xs:p-1.5 sm:p-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveRename(session.id)}
                      onBlur={() => saveRename(session.id)}
                      className="flex-1 px-1.5 xs:px-2 sm:px-2 py-0.5 xs:py-1 sm:py-1 text-xs xs:text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-[#1f7a63] dark:border-[#2dd4a1] focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveRename(session.id)}
                      className="p-0.5 xs:p-0.5 sm:p-1 hover:bg-gray-700 rounded text-[#2dd4a1]"
                    >
                      <svg className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelRename}
                      className="p-0.5 xs:p-0.5 sm:p-1 hover:bg-gray-700 rounded text-gray-400"
                    >
                      <svg className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 p-2 xs:p-2.5 sm:p-3">
                    <button
                      onClick={() => switchToChat(session.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-start gap-1 xs:gap-1.5 sm:gap-2">
                        <svg className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs xs:text-xs sm:text-sm text-gray-900 dark:text-white truncate font-medium">{session.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 hidden xs:block">{session.messages.length - 1} messages</p>
                        </div>
                      </div>
                    </button>
                    
                    {/* Action Buttons - Show on hover */}
                    <div className="flex-shrink-0 flex items-center gap-0.5 xs:gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startRename(session.id, session.title)}
                        className="p-0.5 xs:p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1]"
                        title="Rename"
                      >
                        <svg className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteChat(session.id)}
                        className="p-0.5 xs:p-0.5 sm:p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header - Only show when there are messages */}
        {messages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 p-1.5 xs:p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xs xs:text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">{currentSession?.title || "New Chat"}</h1>
                <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 hidden xs:block">AI Environmental Assistant</p>
              </div>

              {/* Uploaded Files Badges */}
              {uploadedFiles.length > 0 && (
                <div className="flex gap-0.5 xs:gap-1 flex-wrap justify-end flex-shrink-0 max-w-[40%]">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="bg-[#1f7a63]/10 border border-[#1f7a63]/30 rounded px-1 xs:px-2 sm:px-3 py-0.5 flex items-center gap-0.5 xs:gap-1">
                      <svg className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-[#1f7a63] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs text-[#1f7a63] font-medium truncate max-w-[40px] xs:max-w-[60px] sm:max-w-none">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Welcome State - Perfectly centered, no scroll */}
        {messages.length === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center px-2 xs:px-3 sm:px-6 -mt-4 xs:-mt-6 sm:-mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-2 xs:mb-3 sm:mb-4"
            >
              <div className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 mb-1 xs:mb-1.5">
                <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 xs:w-[18px] xs:h-[18px] sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl xs:text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] bg-clip-text text-transparent">
                  GreenGPT
                </h1>
              </div>
              <p className="text-[10px] xs:text-sm sm:text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 px-1">
                How can I help you today?
              </p>
            </motion.div>

            {/* Prompt Suggestions - 2x2 Grid */}
            <div className="w-full max-w-3xl px-1 xs:px-2">
              <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
                {suggestedPrompts.map((prompt, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setInputMessage(prompt.title)}
                    className="p-1.5 xs:p-2.5 sm:p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg xs:rounded-xl sm:rounded-2xl hover:border-[#1f7a63] dark:hover:border-[#2dd4a1] hover:shadow-xl transition-all text-left group active:scale-95"
                  >
                    <div className="flex flex-col xs:flex-row items-center xs:items-start gap-1 xs:gap-2 sm:gap-2.5">
                      <div className={`shrink-0 w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-gradient-to-br ${prompt.color} rounded-md xs:rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={prompt.iconPath} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0 text-center xs:text-left">
                        <h3 className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-0 xs:mb-0.5 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors leading-tight line-clamp-2">
                          {prompt.title}
                        </h3>
                        <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight hidden xs:block line-clamp-2">
                          {prompt.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Area - Only show when messages exist */}
        {messages.length > 1 && (
          <div className="flex-1 overflow-y-auto px-1.5 xs:px-2 sm:px-6 py-2 xs:py-3 sm:py-6 space-y-1.5 xs:space-y-2 sm:space-y-4 scrollbar-hide">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[95%] xs:max-w-[90%] sm:max-w-2xl ${message.role === "user" ? "bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] text-white" : message.role === "system" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center w-full" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"} rounded-lg xs:rounded-xl sm:rounded-2xl px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 shadow-md transition-colors duration-300`}>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 mb-0.5 xs:mb-1 sm:mb-2">
                        <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[8px] xs:text-[9px] sm:text-xs font-bold">AI</span>
                        </div>
                        <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 hidden xs:inline">GreenGPT</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-[10px] xs:text-xs sm:text-sm break-words">{message.content}</p>
                    <span className="text-[8px] xs:text-[9px] sm:text-xs opacity-60 mt-0.5 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg xs:rounded-xl sm:rounded-2xl px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 shadow-md transition-colors duration-300">
                  <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                    <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-[#1f7a63] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-[#1f7a63] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-[#1f7a63] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area - ChatGPT style */}
        <div className="shrink-0 bg-white dark:bg-gray-900 transition-colors duration-300 -mt-10 xs:-mt-14 sm:-mt-20 mb-2 xs:mb-3 sm:mb-4">
          <div className="max-w-3xl mx-auto px-2 xs:px-3 sm:px-4">
            <div className="relative">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
                multiple
                className="hidden"
              />

              {/* Main input container - ChatGPT style */}
              <div className="flex items-end gap-1.5 xs:gap-2 sm:gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl xs:rounded-2xl sm:rounded-3xl px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 focus-within:border-[#1f7a63] dark:focus-within:border-[#2dd4a1] focus-within:ring-1 focus-within:ring-[#1f7a63]/20 dark:focus-within:ring-[#2dd4a1]/20 transition-all shadow-sm hover:shadow-md">
                {/* File Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50 group"
                  title="Upload PDF or Image"
                >
                  <svg className="w-5 h-5 xs:w-5 xs:h-5 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Auto-growing Text Input */}
                <textarea
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Message GreenGPT..."}
                  disabled={isLoading || isListening}
                  rows={1}
                  className="flex-1 bg-transparent text-sm xs:text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none max-h-[200px] overflow-y-auto disabled:opacity-50 py-1 xs:py-1.5 sm:py-1.5 leading-relaxed"
                  style={{ minHeight: '24px' }}
                />

                {/* Voice Input Button - Only show when no text */}
                {!inputMessage.trim() && (
                  <button
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    className={`shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"} disabled:opacity-50`}
                    title="Voice input"
                  >
                    <svg className="w-5 h-5 xs:w-5 xs:h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                )}

                {/* Send Button - ChatGPT style arrow */}
                {inputMessage.trim() && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-[#1f7a63] hover:bg-[#155744] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Footer - Environmental context */}
            <div className="text-center mt-2 xs:mt-3 sm:mt-4 space-y-1 xs:space-y-1.5 sm:space-y-2">
              <p className="text-[10px] xs:text-xs sm:text-xs text-gray-400 dark:text-gray-500">
                GreenGPT can make mistakes. Consider checking important information.
              </p>
              <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 text-[9px] xs:text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Analyze PDFs</span>
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Upload Images</span>
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  <span>Eco Insights</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
