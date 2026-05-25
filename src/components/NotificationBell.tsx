import { useNotifications } from "@/context/NotificationContext";
import { Bell, Check, Heart, MessageSquare, UserPlus, ArrowBigUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fixImageUrl } from "@/lib/config";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "post_upvote") return <ArrowBigUp className="h-3.5 w-3.5 text-orange-400" />;
  if (type === "post_comment") return <MessageSquare className="h-3.5 w-3.5 text-blue-400" />;
  if (type === "follow") return <UserPlus className="h-3.5 w-3.5 text-violet-400" />;
  if (type === "comment_reply") return <MessageSquare className="h-3.5 w-3.5 text-green-400" />;
  return <Bell className="h-3.5 w-3.5 text-muted-foreground" />;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (notif: any) => {
    await markAsRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-secondary transition border-b border-border/50 ${!notif.read ? "bg-primary/5" : ""}`}
                >
                  {/* Sender avatar */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-indigo-500 overflow-hidden flex items-center justify-center text-white text-sm font-bold">
                      {notif.sender?.profilePicture ? (
                        <img src={fixImageUrl(notif.sender.profilePicture)} className="w-full h-full object-cover" />
                      ) : (
                        notif.sender?.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                      <NotifIcon type={notif.type} />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{notif.sender?.username}</span>
                      {" "}{notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}