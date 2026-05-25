import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/config";

interface SocketContextValue {
  socket: Socket | null;
  onlineUsers: string[];
  isOnline: (userId: string) => boolean;
  communityOnline: Record<string, number>;
  getCommunityOnline: (communityId: string) => number;
  refreshCommunities: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  onlineUsers: [],
  isOnline: () => false,
  communityOnline: {},
  getCommunityOnline: () => 0,
  refreshCommunities: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [communityOnline, setCommunityOnline] = useState<Record<string, number>>({});
  const socketRef = useRef<Socket | null>(null);

  const emitPresence = (s: Socket) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    s.emit("user:online", user._id);

    // followingCommunities can be ObjectId objects — convert all to plain strings
    const raw: any[] = user.followingCommunities || [];
    const communityIds: string[] = raw.map((c: any) =>
      typeof c === "string" ? c : c?._id?.toString() ?? c?.toString()
    ).filter(Boolean);

    if (communityIds.length > 0) {
      s.emit("user:communities", { userId: user._id, communityIds });
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    const s = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      timeout: 5000,
    });

    socketRef.current = s;

    s.on("connect", () => {
      // Re-emit on every connect and reconnect
      emitPresence(s);
    });

    s.on("online:update", (users: string[]) => {
      setOnlineUsers(users);
    });

    s.on("community:online", ({ communityId, onlineMembers }: { communityId: string; onlineMembers: number }) => {
      setCommunityOnline((prev) => ({ ...prev, [communityId]: onlineMembers }));
    });

    // Fetch initial online list immediately via REST as fast fallback
    fetch(`${API_URL}/api/chat/online-users`)
      .then((r) => r.json())
      .then((users) => setOnlineUsers(users))
      .catch(() => {});

    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, []);

  // Call this after joining/leaving a community so server re-counts immediately
  const refreshCommunities = useCallback(() => {
    const s = socketRef.current;
    if (!s?.connected) return;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;
    const raw: any[] = user.followingCommunities || [];
    const communityIds: string[] = raw.map((c: any) =>
      typeof c === "string" ? c : c?._id?.toString() ?? c?.toString()
    ).filter(Boolean);
    s.emit("user:communities", { userId: user._id, communityIds });
  }, []);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.includes(userId),
    [onlineUsers]
  );

  const getCommunityOnline = useCallback(
    (communityId: string) => communityOnline[communityId] ?? 0,
    [communityOnline]
  );

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline, communityOnline, getCommunityOnline, refreshCommunities }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);