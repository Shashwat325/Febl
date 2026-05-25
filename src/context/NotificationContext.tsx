import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "@/lib/config";
import { useSocket } from "@/context/SocketContext";

interface Notification {
  _id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  fetchNotifications: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/${user._id}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {}
  }, [user?._id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handleNew = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on("notification:new", handleNew);
    return () => { socket.off("notification:new", handleNew); };
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, read: true } : n)
      );
    } catch {}
  };

  const markAllAsRead = async () => {
    if (!user?._id) return;
    try {
      await fetch(`${API_URL}/api/notifications/${user._id}/read-all`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);