import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { auth, db } from '../config/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Save chats to Firestore
const saveChatsToFirestore = async (userId, chats) => {
  try {
    if (!userId) return;
    for (const chat of chats) {
      // Ensure chat ID is a string for Firestore
      const chatId = String(chat.id);
      const chatRef = doc(db, 'users', userId, 'chats', chatId);
      
      // Convert message timestamps to proper format
      const processedMessages = (chat.messages || []).map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));
      
      await setDoc(chatRef, {
        title: chat.title,
        messages: processedMessages,
        createdAt: chat.createdAt instanceof Date ? chat.createdAt : new Date(chat.createdAt),
        updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt : new Date(chat.updatedAt)
      }, { merge: true });
    }
  } catch (e) {
    console.error("Failed to save chats:", e);
  }
};

// Get initial chat sessions from Firestore (async)
const getStoredChatSessions = async (userId) => {
  try {
    if (!userId) return [];
    const chatsRef = collection(db, 'users', userId, 'chats');
    const snapshot = await getDocs(chatsRef);
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
      messages: (doc.data().messages || []).map(m => ({
        ...m,
        timestamp: m.timestamp?.toDate?.() || new Date(m.timestamp)
      }))
    }));
    return chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (e) {
    console.error("Failed to load chat history:", e);
    return [];
  }
};

export default function ChatPage() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chats from Firestore when user changes
  useEffect(() => {
    const loadChats = async () => {
      if (user?.id) {
        setLoadingChats(true);
        const chats = await getStoredChatSessions(user.id);
        if (chats.length === 0) {
          // Create initial empty chat if none exist
          const newChat = {
            id: Date.now().toString(),
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
          };
          await saveChatsToFirestore(user.id, [newChat]);
          setChatSessions([newChat]);
          setCurrentSessionId(newChat.id);
        } else {
          setChatSessions(chats);
          setCurrentSessionId(chats[0]?.id || null);
        }
        setLoadingChats(false);
      }
    };
    loadChats();
  }, [user?.id]);

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save chats to Firestore whenever they change
  useEffect(() => {
    if (user?.id && chatSessions.length > 0) {
      saveChatsToFirestore(user.id, chatSessions);
    }
  }, [chatSessions, user?.id]);

  // Save current session ID to localStorage (for quick access on page load)
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentChatSessionId', currentSessionId.toString());
    }
  }, [currentSessionId]);

  // Create new chat session
  const createNewChat = () => {
    // Use timestamp-based string ID (same as initial chat creation)
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
    // Close sidebar on mobile when creating new chat
    setSidebarOpen(false);
  };

  // Switch to a chat session
  const switchToChat = (sessionId) => {
    setCurrentSessionId(sessionId);
    setUploadedFiles([]);
    // Close sidebar on mobile when selecting a chat
    setSidebarOpen(false);
  };

  // Delete chat session
  const deleteChat = async (sessionId) => {
    if (chatSessions.length === 1) {
      alert("Cannot delete the last chat session");
      return;
    }
    
    const filtered = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(filtered);
    
    // Delete from Firestore
    if (user?.id) {
      try {
        // Ensure sessionId is a string for Firestore
        const chatId = String(sessionId);
        await deleteDoc(doc(db, 'users', user.id, 'chats', chatId));
      } catch (e) {
        console.error("Failed to delete chat from Firestore:", e);
      }
    }
    
    if (sessionId === currentSessionId) {
      setCurrentSessionId(filtered[0].id);
    }
    
    // Close sidebar on mobile after deleting
    setSidebarOpen(false);
  };

  // Start renaming chat
  const startRename = (sessionId, currentTitle) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  // Save renamed chat
  const saveRename = async (sessionId) => {
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    
    const updatedSessions = chatSessions.map(s => 
      s.id === sessionId 
        ? { ...s, title: editingTitle.trim() }
        : s
    );
    setChatSessions(updatedSessions);
    
    // Update in Firestore
    if (user?.id) {
      try {
        // Ensure sessionId is a string for Firestore
        const chatId = String(sessionId);
        await updateDoc(doc(db, 'users', user.id, 'chats', chatId), {
          title: editingTitle.trim(),
          updatedAt: new Date()
        });
      } catch (e) {
        console.error("Failed to update chat title in Firestore:", e);
      }
    }
    
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
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/upload`, formData, {
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/message`, {
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
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300 relative">
      {/* Loading State */}
      {loadingChats && (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your chats...</p>
          </div>
        </div>
      )}

      {!loadingChats && (
      <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Professional GPT-like Design */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 40 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`${sidebarOpen ? 'fixed left-0 top-0 h-screen z-50 md:relative md:z-auto md:shrink-0' : 'relative shrink-0'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-colors duration-300`}
      >
        {/* Top Section - Logo & Menu */}
        <div className={`shrink-0 p-3 sm:p-4 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {sidebarOpen && (
            <div className="flex-1 flex items-center gap-2 justify-end">
              <img src="/favicon.svg" alt="GreenGPT" className="w-8 h-8 rounded-lg shrink-0" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">GreenGPT</span>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        {sidebarOpen && (
          <div className="px-3 sm:px-4 pb-3">
            <button
              onClick={createNewChat}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
        )}

        {/* Divider */}
        {sidebarOpen && (
          <div className="px-3 sm:px-4">
            <div className="h-px bg-linear-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
          </div>
        )}

        {/* Chat History Section */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 pt-4 pb-3 flex flex-col">
            {/* Section Header */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Chat History</p>
            </div>

            {/* Chat Items */}
            {chatSessions.length > 0 ? (
              <div className="space-y-2 flex-1">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group relative"
                  >
                    {editingSessionId === session.id ? (
                      <div className="flex items-center gap-2 p-2.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveRename(session.id)}
                          onBlur={() => saveRename(session.id)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded border border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRename(session.id)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-emerald-600 dark:text-emerald-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => switchToChat(session.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2.5 relative overflow-hidden ${
                            session.id === currentSessionId
                              ? 'bg-linear-to-r from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-300 dark:border-emerald-800 shadow-sm'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                          }`}
                        >
                          {/* Chat icon */}
                          <svg className={`w-4 h-4 shrink-0 transition-colors ${
                            session.id === currentSessionId
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          }`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2z" />
                          </svg>

                          {/* Title and Message Count */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate transition-colors ${
                              session.id === currentSessionId
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                            }`}>
                              {session.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                              {session.messages.length - 1} messages
                            </p>
                          </div>
                        </button>

                        {/* Action Buttons - Show on hover */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startRename(session.id, session.title);
                            }}
                            className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Rename"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteChat(session.id);
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center">
                  <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-500 dark:text-gray-500">No chats yet</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Quick Links */}
        {sidebarOpen && (
          <div className="shrink-0 mt-auto border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <a
              href="/profile"
              className="w-full px-3 py-3 rounded-lg bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-800/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-800/40 transition-all duration-200 border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700/50 flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 group"
              title="Profile"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 17a6 6 0 0112 0v4H6v-4z" />
              </svg>
              <span className="text-sm font-semibold">Profile</span>
            </a>
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
                <div className="flex gap-0.5 xs:gap-1 flex-wrap justify-end shrink-0 max-w-[40%]">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="bg-[#1f7a63]/10 border border-[#1f7a63]/30 rounded px-1 xs:px-2 sm:px-3 py-0.5 flex items-center gap-0.5 xs:gap-1">
                      <svg className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-[#1f7a63] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[9px] xs:text-[10px] sm:text-xs text-[#1f7a63] font-medium truncate max-w-10 xs:max-w-[60px] sm:max-w-none">{file.name}</span>
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
                <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 bg-linear-to-r from-[#1f7a63] to-[#2dd4a1] rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 xs:w-[18px] xs:h-[18px] sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl xs:text-2xl sm:text-4xl font-bold bg-linear-to-r from-[#1f7a63] to-[#2dd4a1] bg-clip-text text-transparent">
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
                    className="p-1.5 xs:p-2.5 sm:p-4 bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg xs:rounded-xl sm:rounded-2xl hover:border-[#1f7a63] dark:hover:border-[#2dd4a1] hover:shadow-xl transition-all text-left group active:scale-95"
                  >
                    <div className="flex flex-col xs:flex-row items-center xs:items-start gap-1 xs:gap-2 sm:gap-2.5">
                      <div className={`shrink-0 w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-linear-to-br ${prompt.color} rounded-md xs:rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
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
                  <div className={`max-w-[95%] xs:max-w-[90%] sm:max-w-2xl ${message.role === "user" ? "bg-linear-to-r from-[#1f7a63] to-[#2dd4a1] text-white" : message.role === "system" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center w-full" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"} rounded-lg xs:rounded-xl sm:rounded-2xl px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 shadow-md transition-colors duration-300`}>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 mb-0.5 xs:mb-1 sm:mb-2">
                        <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 bg-linear-to-r from-[#1f7a63] to-[#2dd4a1] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-[8px] xs:text-[9px] sm:text-xs font-bold">AI</span>
                        </div>
                        <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 hidden xs:inline">GreenGPT</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-[10px] xs:text-xs sm:text-sm wrap-break-word">{message.content}</p>
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
                  className="flex-1 bg-transparent text-sm xs:text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none max-h-50 overflow-y-auto disabled:opacity-50 py-1 xs:py-1.5 sm:py-1.5 leading-relaxed"
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
      </>
      )}
    </div>
  );
}
