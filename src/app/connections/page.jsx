"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { setConnections, setConnectionLoading, setActiveConnectionId } from "../store/connectionSlice";
import { Users, Send, Sparkles, MessageSquare, Bot, ArrowLeft } from "lucide-react";

export default function ConnectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { connections, loading, activeConnectionId } = useSelector((state) => state.connections);

  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Connections
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchConnections = async () => {
      dispatch(setConnectionLoading(true));
      try {
        const res = await fetch("/api/auth/connection");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.connections) {
            dispatch(setConnections(data.connections));
          }
        }
      } catch (err) {
        console.error("Failed to fetch connections:", err);
      } finally {
        dispatch(setConnectionLoading(false));
      }
    };

    fetchConnections();
  }, [user, dispatch, router]);

  // 2. Setup WebSockets
  useEffect(() => {
    if (!user) return;

    // Connect to the Express server directly
    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      // Join user room
      socket.emit("join", user._id);
    });

    socket.on("newMessage", (message) => {
      // If the incoming message belongs to the active conversation, append it
      if (activeConnectionId && message.conversationId === activeConnectionId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeConnectionId]);

  // 3. Auto-scroll Chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper: Extract Friend Object from Connection
  const getFriend = (conn) => {
    if (!user) return null;
    return conn.fromUserId._id === user._id ? conn.toUserId : conn.fromUserId;
  };

  // 4. Select Friend for Chat
  const handleSelectConnection = async (conn) => {
    const friend = getFriend(conn);
    if (!friend) return;

    setChatLoading(true);
    setActiveFriend(friend);
    setAiSuggestions([]);
    setInputText("");

    try {
      // Get or create conversation
      const convRes = await fetch(`/api/chat/conversation/${friend._id}`, {
        method: "POST",
      });
      if (convRes.ok) {
        const convData = await convRes.json();
        if (convData.success && convData.conversation) {
          const convId = convData.conversation._id;
          dispatch(setActiveConnectionId(convId));

          // Fetch message history
          const msgRes = await fetch(`/api/chat/message/${convId}`);
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            if (msgData.success && msgData.messages) {
              setMessages(msgData.messages);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to initialize chat:", err);
    } finally {
      setChatLoading(false);
    }
  };

  // 5. Send Message
  const handleSendMessage = async (e, textOverride) => {
    if (e) e.preventDefault();
    const text = textOverride || inputText;
    if (!text.trim() || !activeConnectionId) return;

    if (!textOverride) setInputText("");

    try {
      const res = await fetch(`/api/chat/message/${activeConnectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.newMessage) {
          // Append the message we just sent
          setMessages((prev) => [...prev, data.newMessage]);
          setAiSuggestions([]); // Clear suggestions after sending
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // 6. Get AI suggestions using backend Gemini endpoint
  const handleGetAiSuggestions = async () => {
    // Need at least one message received to suggest a reply
    const receivedMessages = messages.filter(
      (m) =>
        (typeof m.senderId === "string" ? m.senderId : m.senderId._id) !== user?._id
    );

    if (receivedMessages.length === 0) {
      alert("No messages received yet. Cannot generate replies!");
      return;
    }

    const lastReceived = receivedMessages[receivedMessages.length - 1];
    setLoadingSuggestions(true);
    setAiSuggestions([]);

    try {
      const res = await fetch("/api/chat/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastReceived.message }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.suggestions) {
          // Parse suggestions (usually returns 3 lines of text)
          const parsed = data.suggestions
            .split(/\n+/)
            .map((line) => line.replace(/^\d+[\.\-\s]+/, "").trim())
            .filter((line) => line.length > 0)
            .slice(0, 3);
          setAiSuggestions(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to get AI suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-grow flex flex-col md:flex-row gap-6 h-[calc(100dvh-140px)] md:h-[calc(100vh-140px)] min-h-[450px]">
      {/* Left Column: Connections List */}
      <div className={`w-full md:w-80 glass-card rounded-2xl p-4 flex flex-col border border-white/10 ${
        activeFriend ? "hidden md:flex" : "flex"
      }`}>
        <div className="mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
            <Users className="w-5 h-5 text-indigo-400" />
            Your Matches
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Click on a developer to start chatting.</p>
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-indigo-500" />
          </div>
        ) : connections.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-3">
            <MessageSquare className="w-8 h-8 text-zinc-600" />
            <p className="text-sm text-zinc-400 leading-relaxed">No matches yet. Keep matching on the feed!</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-2 pr-1">
            {connections.map((conn) => {
              const friend = getFriend(conn);
              if (!friend) return null;
              const isSelected = activeFriend?._id === friend._id;
              return (
                <button
                  key={conn._id}
                  onClick={() => handleSelectConnection(conn)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                      : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={friend.profilePic || "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180"}
                    alt={friend.userName}
                    className="w-10 h-10 rounded-full object-cover border border-white/5 flex-shrink-0"
                    onError={(e) => {
                      e.target.src =
                        "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180";
                    }}
                  />
                  <div className="truncate flex-1">
                    <p className="font-bold text-sm text-white truncate tracking-wide">{friend.userName}</p>
                    {friend.bio && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{friend.bio}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Chat Window */}
      <div className={`flex-1 glass-card rounded-3xl flex flex-col border border-white/5 overflow-hidden relative ${
        !activeFriend ? "hidden md:flex" : "flex"
      }`}>
        {activeFriend ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4.5 border-b border-white/5 bg-zinc-950/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveFriend(null);
                    dispatch(setActiveConnectionId(null));
                  }}
                  className="md:hidden p-1.5 -ml-1 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeFriend.profilePic || "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180"}
                  alt={activeFriend.userName}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/20"
                  onError={(e) => {
                    e.target.src =
                      "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180";
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base leading-none truncate tracking-wide">
                    {activeFriend.userName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 truncate max-w-[100px] sm:max-w-sm">
                    {activeFriend.bio || "No bio"}
                  </p>
                </div>
              </div>

              {/* AI helper button */}
              <button
                onClick={handleGetAiSuggestions}
                disabled={loadingSuggestions || chatLoading}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-xs font-bold text-indigo-400 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Suggestions</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-indigo-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <MessageSquare className="w-8 h-8 text-zinc-700" />
                  <p className="text-sm text-zinc-500">Say hello to {activeFriend.userName}!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const sender = typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;
                  const isOwnMessage = sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-md transition-all ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
                            : "bg-zinc-900/60 border border-white/5 text-zinc-100 rounded-bl-none"
                        }`}
                      >
                        <p className="leading-relaxed break-words">{msg.message}</p>
                        <span className="text-[10px] text-zinc-400/70 block mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Suggestion pills */}
            {aiSuggestions.length > 0 && (
              <div className="px-6 py-3 border-t border-white/5 bg-indigo-500/5 flex flex-col gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  <Bot className="w-3.5 h-3.5" />
                  AI Suggested Replies:
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(undefined, suggestion)}
                      className="px-3 py-1.5 text-xs text-left rounded-xl bg-zinc-950 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 hover:text-white transition-all cursor-pointer font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-zinc-950/20 flex gap-3">
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">Select a Chat</h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              Select one of your matches from the sidebar to view message history and chat in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
