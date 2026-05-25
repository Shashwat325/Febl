import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_URL, fixImageUrl } from "@/lib/config";
import { ArrowLeft, Send, MoreVertical, Phone, Video } from "lucide-react";
import { useSocket } from "../context/SocketContext";

interface Message {
  _id?: string;
  sender: { _id: string; username: string; profilePicture?: string } | string;
  receiver: string;
  content: string;
  createdAt: string;
  read?: boolean;
  pending?: boolean; // optimistic
}

interface ChatUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000 && now.getDate() === d.getDate()) return "Today";
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

export default function ChatConversation() {
  const { otherId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(
    location.state?.otherUser || null
  );
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { socket, isOnline } = useSocket();
  const online = otherUser ? isOnline(otherUser._id) : false;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/chat/conversation/${user._id}/${otherId}`
      );
      const data = await res.json();
      setMessages(data);
    } catch {}
  }, [user?._id, otherId]);

  const fetchOtherUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${otherId}`);
      const data = await res.json();
      setOtherUser(data.user || data);
    } catch {}
  }, [otherId]);

  // Mark messages as read
  const markRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/chat/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: otherId, receiverId: user._id }),
      });
    } catch {}
  }, [otherId, user?._id]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchMessages();
    if (!otherUser) fetchOtherUser();
    markRead();

    // Focus input on load (desktop)
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [otherId]);

  
  useEffect(() => {
    if (!socket || !user || !otherId) return;

    // Join the conversation room
    socket.emit("chat:join", { userId: user._id, otherId });

    // Listen for incoming messages
    const handleMessage = (msg: Message) => {
      setMessages((prev) => {
        // Replace optimistic message if it matches, else append
        const senderStr =
          typeof msg.sender === "string" ? msg.sender : msg.sender._id;
        if (senderStr === user._id) {
          // Own message confirmed — remove pending dupe if exists
          const idx = prev.findIndex((m) => m.pending && m.content === msg.content);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = msg;
            return next;
          }
        }
        // Avoid duplicate _ids
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Mark read immediately if it's from the other person
      const senderStr = typeof msg.sender === "string" ? msg.sender : msg.sender._id;
      if (senderStr !== user._id) markRead();
    };

    const handleTyping = ({ senderId, isTyping: t }: { senderId: string; isTyping: boolean }) => {
      if (senderId === otherId) setIsTyping(t);
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:typing", handleTyping);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:typing", handleTyping);
    };
  }, [socket, otherId, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");

    // Stop typing indicator
    if (socket) socket.emit("chat:typing", { senderId: user._id, receiverId: otherId, isTyping: false });

    // Optimistic UI
    const optimistic: Message = {
      sender: { _id: user._id, username: user.username, profilePicture: user.profilePicture },
      receiver: otherId!,
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user._id, receiverId: otherId, content }),
      });
      if (res.ok) {
        const saved = await res.json();
        // Emit via socket so other user gets it in real-time
        if (socket) socket.emit("chat:message", saved);
        // Replace optimistic
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.pending && m.content === content);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return prev;
        });
      }
    } catch {
      // Mark failed
      setMessages((prev) =>
        prev.map((m) =>
          m.pending && m.content === content ? { ...m, failed: true, pending: false } : m
        )
      );
    } finally {
      setSending(false);
    }
  }, [input, sending, socket, user, otherId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit("chat:typing", { senderId: user._id, receiverId: otherId, isTyping: true });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        socket.emit("chat:typing", { senderId: user._id, receiverId: otherId, isTyping: false });
      }, 1500)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateKey) {
      last.msgs.push(msg);
    } else {
      grouped.push({ date: dateKey, msgs: [msg] });
    }
  });

  const getSenderId = (msg: Message) =>
    typeof msg.sender === "string" ? msg.sender : msg.sender._id;

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-xl border-b border-border px-3 sm:px-4 py-2.5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate("/chat")}
          className="text-muted-foreground hover:text-foreground transition p-1 -ml-1 rounded-lg"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {otherUser?.profilePicture ? (
              <img
                src={fixImageUrl(otherUser.profilePicture)}
                alt={otherUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              otherUser?.username?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${
              online ? "bg-green-500" : "bg-zinc-500"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {otherUser?.username || "..."}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {isTyping ? (
              <span className="text-primary">typing...</span>
            ) : online ? (
              <span className="text-green-500">Online</span>
            ) : (
              "Offline"
            )}
          </p>
        </div>

        {/* Action buttons — placeholders for future features */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
            <Phone className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {otherUser?.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">{otherUser?.username}</p>
              <p className="text-xs mt-1 opacity-60">No messages yet</p>
              <p className="text-xs opacity-60">Say hi 👋</p>
            </div>
          </div>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium bg-background px-2">
                {formatDateDivider(msgs[0].createdAt)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-1">
              {msgs.map((msg, i) => {
                const isMe = getSenderId(msg) === user._id;
                const prevMsg = msgs[i - 1];
                const nextMsg = msgs[i + 1];
                const sameSenderPrev = prevMsg && getSenderId(prevMsg) === getSenderId(msg);
                const sameSenderNext = nextMsg && getSenderId(nextMsg) === getSenderId(msg);

                // Bubble shape
                const br = isMe
                  ? `rounded-2xl ${sameSenderNext ? "rounded-br-md" : "rounded-br-sm"} ${sameSenderPrev ? "rounded-tr-md" : ""}`
                  : `rounded-2xl ${sameSenderNext ? "rounded-bl-md" : "rounded-bl-sm"} ${sameSenderPrev ? "rounded-tl-md" : ""}`;

                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                      sameSenderPrev ? "mt-0.5" : "mt-2"
                    }`}
                  >
                    <div className="max-w-[78%] sm:max-w-[65%]">
                      <div
                        className={`px-3.5 py-2 text-sm break-words leading-relaxed ${br} ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        } ${(msg as any).pending ? "opacity-60" : ""}`}
                      >
                        {msg.content}
                      </div>
                      {/* Timestamp — only show on last in group */}
                      {!sameSenderNext && (
                        <p className={`text-[10px] text-muted-foreground mt-0.5 ${isMe ? "text-right" : "text-left"} px-1`}>
                          {formatMsgTime(msg.createdAt)}
                          {isMe && (msg as any).pending && " · sending"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mt-2">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 bg-card/90 backdrop-blur-xl border-t border-border px-3 sm:px-4 py-2.5 safe-bottom">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 flex items-center bg-secondary rounded-full px-4 py-2 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
              autoComplete="off"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            aria-label="Send"
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              input.trim()
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}