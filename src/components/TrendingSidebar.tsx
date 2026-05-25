import { API_URL, fixImageUrl } from "@/lib/config";
import { Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { MiniChat } from "@/components/MiniChat";

interface ChatUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

export function TrendingSidebar() {
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [openChats, setOpenChats] = useState<ChatUser[]>([]);
  const { onlineUsers } = useSocket();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetch(`${API_URL}/api/chat/users`)
      .then((r) => r.json())
      .then((data) => setAllUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const onlineUsersList = allUsers.filter(
    (u) => onlineUsers.includes(u._id) && u._id !== currentUser?._id
  );

  const openChat = (user: ChatUser) => {
    if (openChats.find((c) => c._id === user._id)) return;
    setOpenChats((prev) => [...prev.slice(-2), user]);
  };

  const closeChat = (userId: string) => {
    setOpenChats((prev) => prev.filter((c) => c._id !== userId));
  };

  return (
    <>
      {/* Right sidebar — online users */}
      <aside className="hidden xl:block w-56 shrink-0 ">
        <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            Online Now
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {onlineUsersList.length}
            </span>
          </h3>

          {onlineUsersList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No one else is online
            </p>
          ) : (
            <div className="space-y-1">
              {onlineUsersList.map((u) => (
                <button
                  key={u._id}
                  onClick={() => openChat(u)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary transition text-left group"
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                      {u.profilePicture
                        ? <img src={fixImageUrl(u.profilePicture)} className="w-full h-full object-cover" />
                        : u.username[0].toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                  </div>
                  <span className="text-sm font-medium truncate group-hover:text-primary flex-1">
                    {u.username}
                  </span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100 shrink-0">
                    Chat
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Mini chat popups — fixed bottom right */}
      {openChats.length > 0 && (
        <div className="fixed bottom-0 right-4 flex items-end gap-3 z-50">
          {openChats.map((chatUser) => (
            <MiniChat
              key={chatUser._id}
              otherUser={chatUser}
              onClose={() => closeChat(chatUser._id)}
            />
          ))}
        </div>
      )}
    </>
  );
}