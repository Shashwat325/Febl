import { API_URL, fixImageUrl } from "@/lib/config";
import { useEffect, useRef, useState } from "react";
import { X, Minus, Send } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface MiniChatProps {
  otherUser: { _id: string; username: string; profilePicture?: string };
  onClose: () => void;
}

export function MiniChat({ otherUser, onClose }: MiniChatProps) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { socket, isOnline } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch existing conversation
  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/chat/conversation/${user._id}/${otherUser._id}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [otherUser._id]);

  // Join socket room and listen for messages
  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("chat:join", { userId: user._id, otherId: otherUser._id });

    const handleMessage = (msg: any) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const receiverId = msg.receiver;
      const isThisConvo =
        (senderId === user._id && receiverId === otherUser._id) ||
        (senderId === otherUser._id && receiverId === user._id);
      if (!isThisConvo) return;
      setMessages((prev) => {
        // avoid duplicates
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (minimized && senderId !== user._id) {
        setUnread((u) => u + 1);
      }
    };

    socket.on("chat:message", handleMessage);
    return () => { socket.off("chat:message", handleMessage); };
  }, [socket, otherUser._id, minimized]);

  // Scroll to bottom
  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, minimized]);

  // Clear unread when opened
  useEffect(() => {
    if (!minimized) setUnread(0);
  }, [minimized]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput("");

    try {
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user._id, receiverId: otherUser._id, content }),
      });
      const msg = await res.json();
      // Emit via socket for real-time
      socket?.emit("chat:message", { ...msg, receiver: otherUser._id });
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    } catch {}
  };

  const avatarLetter = otherUser.username[0].toUpperCase();
  const online = isOnline(otherUser._id);

  return (
    <div className="flex flex-col w-72 rounded-t-xl overflow-hidden shadow-2xl border border-border bg-card">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 bg-card border-b border-border cursor-pointer select-none"
        onClick={() => setMinimized((m) => !m)}
      >
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {otherUser.profilePicture
              ? <img src={fixImageUrl(otherUser.profilePicture)} className="w-full h-full object-cover" />
              : avatarLetter}
          </div>
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${online ? "bg-green-500" : "bg-zinc-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{otherUser.username}</p>
          <p className="text-xs text-muted-foreground">{online ? "Active now" : "Offline"}</p>
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && minimized && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized((m) => !m); }}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-muted-foreground hover:text-red-400 p-1 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!minimized && (
        <>
          <div className="flex-1 h-72 overflow-y-auto p-3 space-y-2 bg-background">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Say hi to {otherUser.username}!
              </p>
            )}
            {messages.map((msg, i) => {
              const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
              const isMe = senderId === user._id;
              return (
                <div key={msg._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-2 border-t border-border bg-card">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Aa"
              className="flex-1 bg-secondary rounded-full px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="text-primary hover:text-primary/80 disabled:opacity-40 transition p-1"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}