import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { db } from '../config/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Split AI message content into main answer + follow-up suggestions
function parseMessageContent(content) {
  // Catch all variations the AI might produce:
  // **Explore more:** / **Explore More:** / **Explore more** / ## Explore more: etc.
  const markerRegex = /\n?\*\*[Ee]xplore\s+[Mm]ore[:*]*\*?\*?:?\s*\n/;
  const match = markerRegex.exec(content);
  if (!match) return { main: content.trim(), suggestions: [] };
  const main = content.slice(0, match.index).trimEnd();
  const block = content.slice(match.index + match[0].length).trim();
  const suggestions = block
    .split('\n')
    .map((l) => l.replace(/^(?:[•*-]|\d+\.)\s*/, '').trim())
    .filter(Boolean);
  return { main, suggestions };
}

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
  const { user, getToken } = useAuth();
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState(""); // full received text from SSE
  const [displayedText, setDisplayedText] = useState(""); // visually rendered (trails behind for smooth effect)
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  // Voice transcript refs — persist across recognition restarts
  const baseTextRef         = useRef(''); // text in box before voice started
  const priorConfirmedRef   = useRef(''); // finals from previous sessions (after each restart)
  const sessionFinalRef     = useRef(''); // finals from the current session
  const isListeningRef      = useRef(false); // sync mirror of isListening — readable inside event handlers
  const streamDoneRef       = useRef(false); // true when SSE has finished
  const pendingCommitRef    = useRef(null);  // assistant message to commit after display catches up

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
  const messages = useMemo(() => currentSession?.messages || [], [currentSession]);

  const scrollToBottom = (force = false) => {
    if (!force && userScrolledUpRef.current) return;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distFromBottom > 80;
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Gradually drain streamingText into displayedText at a comfortable reading pace
  useEffect(() => {
    if (!streamingText) {
      if (displayedText) setDisplayedText("");
      return;
    }
    if (displayedText.length >= streamingText.length) {
      // Display caught up — if stream is done, commit and clear
      if (streamDoneRef.current && pendingCommitRef.current) {
        const commit = pendingCommitRef.current;
        pendingCommitRef.current = null;
        streamDoneRef.current = false;
        setChatSessions(prev => prev.map(s =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, { role: "assistant", content: commit.content, timestamp: commit.timestamp }], updatedAt: new Date() }
            : s
        ));
        setStreamingText("");
        setDisplayedText("");
        setIsLoading(false);
        userScrolledUpRef.current = false;
        scrollToBottom(true);
      }
      return;
    }
    // Advance display by 12 chars every 8ms ≈ 1500 chars/sec
    const timeout = setTimeout(() => {
      setDisplayedText(streamingText.slice(0, displayedText.length + 12));
      scrollToBottom(); // respects userScrolledUpRef — won't fight manual scrolling
    }, 8);
    return () => clearTimeout(timeout);
  }, [streamingText, displayedText, currentSessionId]);

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

  // Web Speech API Setup — created once; handlers read isListeningRef (never stale)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let sessionFinals = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinals += t + ' ';
        } else {
          interim += t;
        }
      }
      sessionFinalRef.current = sessionFinals;
      setInputMessage(baseTextRef.current + priorConfirmedRef.current + sessionFinals + interim);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      // isListeningRef is already false when stop() was user-initiated — skip restart
      if (isListeningRef.current) {
        priorConfirmedRef.current += sessionFinalRef.current;
        sessionFinalRef.current = '';
        try {
          recognitionRef.current.start();
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
        }
      }
    };
  }, []); // run once — no isListening dependency needed

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser. Try Chrome.");
      return;
    }

    if (isListeningRef.current) {
      isListeningRef.current = false; // set BEFORE stop() so onend sees false immediately
      recognitionRef.current.stop();
      setIsListening(false);
      // Drop any trailing interim — keep only confirmed text
      setInputMessage(baseTextRef.current + priorConfirmedRef.current + sessionFinalRef.current);
    } else {
      baseTextRef.current       = inputMessage;
      priorConfirmedRef.current = '';
      sessionFinalRef.current   = '';
      isListeningRef.current    = true; // set BEFORE start()
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
        const token = await getToken();
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
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

  const handleSendMessage = async (override = null) => {
    const msg = override?.message ?? inputMessage;
    if (!msg.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: msg,
      timestamp: new Date()
    };

    const baseMessages = override?.baseMessages ?? messages;
    // Auto-title from first user message
    const isFirstUserMessage = baseMessages.filter(m => m.role === "user").length === 0;
    const newTitle = isFirstUserMessage && currentSession?.title === "New Chat"
      ? msg.slice(0, 35) + (msg.length > 35 ? "..." : "")
      : null;

    setChatSessions(prev => prev.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...baseMessages, userMessage], updatedAt: new Date(), title: newTitle || s.title }
        : s
    ));

    const sentMessage = msg;
    setInputMessage("");
    setIsLoading(true);
    setStreamingText("");

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: sentMessage,
          files: uploadedFiles.map(f => ({ name: f.name, content: f.content })),
          conversationHistory: baseMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // hold incomplete last line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              setStreamingText(fullText);
              scrollToBottom();
            }
          } catch { /* ignore partial JSON */ }
        }
      }

      // Store the completed message — drain effect will commit once display catches up
      pendingCommitRef.current = { content: fullText || "No response.", timestamp: new Date() };
      streamDoneRef.current = true;
    } catch (error) {
      console.error("Stream error:", error);
      const errorMessage = {
        role: "assistant",
        content: "❌ Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setChatSessions(prev => prev.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, errorMessage] }
          : s
      ));
      setStreamingText("");
      setDisplayedText("");
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // Puts the message text back in the input box for the user to edit and re-send
  const handleEditMessage = (content) => {
    setInputMessage(content);
  };

  // Trims the conversation back to before this message, then re-sends it immediately
  const handleRetryMessage = (idx, content) => {
    if (isLoading) return;
    const trimmed = messages.slice(0, idx);
    handleSendMessage({ message: content, baseMessages: trimmed });
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
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2.5 relative overflow-hidden group-hover:pr-16 ${
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
            className="shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">

              {/* Icon */}
              <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-[#1f7a63] to-[#2dd4a1] flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" />
                </svg>
              </div>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  {currentSession?.title || "New Chat"}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] sm:text-xs text-[#1f7a63] dark:text-[#2dd4a1] font-medium">GreenGPT</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                    {messages.length - 1} message{messages.length - 1 !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Uploaded Files Badges */}
              {uploadedFiles.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-end shrink-0 max-w-[40%]">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="bg-[#1f7a63]/10 border border-[#1f7a63]/30 rounded-lg px-2 py-1 flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#1f7a63] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs text-[#1f7a63] font-medium truncate max-w-20 sm:max-w-none">{file.name}</span>
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
          <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 xs:px-8 sm:px-16 lg:px-24 py-2 xs:py-3 sm:py-6 space-y-1.5 xs:space-y-2 sm:space-y-5 scrollbar-hide">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" ? (
                    <div className="w-full py-1 xs:py-1.5 sm:py-2">
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                        <img src="/favicon.svg" alt="GreenGPT" className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 rounded-full shrink-0" />
                        <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-[#1f7a63] dark:text-[#2dd4a1]">GreenGPT</span>
                      </div>
                      {(() => {
                        const { main, suggestions } = parseMessageContent(message.content);
                        return (
                          <>
                            <div className="pl-4 xs:pl-5 sm:pl-7 text-[11px] xs:text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({children}) => <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mt-3 mb-1">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mt-2.5 mb-1">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-2 mb-0.5">{children}</h3>,
                                  p: ({children}) => <p className="leading-relaxed mb-1.5 last:mb-0">{children}</p>,
                                  strong: ({children}) => <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>,
                                  em: ({children}) => <em className="italic">{children}</em>,
                                  ul: ({children}) => <ul className="list-disc pl-4 space-y-0.5 mb-1.5">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal pl-4 space-y-0.5 mb-1.5">{children}</ol>,
                                  li: ({children}) => <li className="leading-relaxed">{children}</li>,
                                  pre: ({children}) => <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 overflow-x-auto my-1.5">{children}</pre>,
                                  code: ({children}) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-[10px]">{children}</code>,
                                  blockquote: ({children}) => <blockquote className="border-l-2 border-[#1f7a63] pl-3 italic text-gray-600 dark:text-gray-400 my-1.5">{children}</blockquote>,
                                  a: ({children, href}) => <a href={href} className="text-[#1f7a63] dark:text-[#2dd4a1] underline hover:opacity-80" target="_blank" rel="noopener noreferrer">{children}</a>,
                                }}
                              >
                                {main}
                              </ReactMarkdown>
                            </div>
                            {suggestions.length > 0 && (
                              <div className="mt-2 xs:mt-2.5 pl-4 xs:pl-5 sm:pl-7 flex flex-wrap gap-1 xs:gap-1.5">
                                {suggestions.map((s, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setInputMessage(s)}
                                    className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full border border-[#1f7a63] dark:border-[#2dd4a1] text-[#1f7a63] dark:text-[#2dd4a1] hover:bg-[#1f7a63]/10 dark:hover:bg-[#2dd4a1]/10 transition-colors cursor-pointer"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                            <span className="text-[8px] xs:text-[9px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 block pl-4 xs:pl-5 sm:pl-7">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  ) : message.role === "user" ? (
                    <div className="group flex flex-col items-end gap-1">
                      <div className="max-w-[95%] xs:max-w-[90%] sm:max-w-2xl bg-linear-to-r from-[#1f7a63] to-[#2dd4a1] text-white rounded-lg xs:rounded-xl sm:rounded-2xl px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 shadow-md">
                        <p className="whitespace-pre-wrap leading-relaxed text-[10px] xs:text-xs sm:text-sm wrap-break-word">{message.content}</p>
                        <span className="text-[8px] xs:text-[9px] sm:text-xs opacity-60 mt-0.5 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {/* Edit / Retry — visible on hover */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => handleEditMessage(message.content)}
                          title="Edit"
                          className="flex items-center gap-1 text-[11px] xs:text-xs text-gray-400 dark:text-gray-500 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1] transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleRetryMessage(idx, message.content)}
                          title="Retry"
                          className="flex items-center gap-1 text-[11px] xs:text-xs text-gray-400 dark:text-gray-500 hover:text-[#1f7a63] dark:hover:text-[#2dd4a1] transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Retry</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[95%] xs:max-w-[90%] sm:max-w-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center w-full rounded-lg xs:rounded-xl sm:rounded-2xl px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 shadow-md transition-colors duration-300">
                      <p className="whitespace-pre-wrap leading-relaxed text-[10px] xs:text-xs sm:text-sm wrap-break-word">{message.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming bubble — live token-by-token rendering */}
            {displayedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="w-full py-1 xs:py-1.5 sm:py-2">
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                    <img src="/favicon.svg" alt="GreenGPT" className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 rounded-full shrink-0" />
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-[#1f7a63] dark:text-[#2dd4a1]">GreenGPT</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-[11px] xs:text-xs sm:text-sm text-gray-800 dark:text-gray-200 wrap-break-word pl-4 xs:pl-5 sm:pl-7">
                    {(() => {
                      const m = /\n?\*\*[Ee]xplore\s+[Mm]ore[:*]*\*?\*?:?\s*\n/.exec(displayedText);
                      return m ? displayedText.slice(0, m.index).trimEnd() : displayedText;
                    })()}
                    <span className="inline-block w-0.5 h-[1em] bg-[#1f7a63] dark:bg-[#2dd4a1] animate-pulse ml-0.5 align-middle" />
                  </p>
                </div>
              </motion.div>
            )}

            {/* Thinking dots — only while waiting for the first token */}
            {isLoading && !streamingText && (
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
        <div className="shrink-0 bg-white dark:bg-gray-900 transition-colors duration-300 pb-2 xs:pb-3 sm:pb-4 pt-1 sm:pt-2">
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
              <div onClick={() => textareaRef.current?.focus()} className="flex items-end gap-1.5 xs:gap-2 sm:gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl xs:rounded-2xl sm:rounded-3xl px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 focus-within:border-[#1f7a63] dark:focus-within:border-[#2dd4a1] focus-within:ring-1 focus-within:ring-[#1f7a63]/20 dark:focus-within:ring-[#2dd4a1]/20 transition-all shadow-sm hover:shadow-md cursor-text">
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
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isListening ? "Listening… tap mic to stop" : "Message GreenGPT..."}
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent text-sm xs:text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none max-h-50 overflow-y-auto disabled:opacity-50 py-1 xs:py-1.5 sm:py-1.5 leading-relaxed"
                  style={{ minHeight: '24px' }}
                />

                {/* Voice Input Button - Always visible */}
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"} disabled:opacity-50`}
                  title={isListening ? "Stop recording" : "Voice input"}
                >
                  <svg className="w-5 h-5 xs:w-5 xs:h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

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

