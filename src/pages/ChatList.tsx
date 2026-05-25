import { fixImageUrl, API_URL } from "@/lib/config";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Search, MessageCircle, Users, Circle } from "lucide-react";
import { useSocket } from "../context/SocketContext";

interface ChatUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface RecentConv {
  user: ChatUser;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

function Avatar({
  user,
  size = "md",
  showOnline = false,
  online = false,
}: {
  user: ChatUser;
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
  online?: boolean;
}) {
  const dim =
    size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-11 h-11 text-sm";

  return (
    <div className="relative shrink-0">
      <div
        className={`${dim} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden`}
      >
        {user.profilePicture ? (
          <img
            src={fixImageUrl(user.profilePicture)}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          user.username.charAt(0).toUpperCase()
        )}
      </div>
      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${online ? "bg-green-500" : "bg-zinc-500"
            }`}
        />
      )}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604_800_000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatList() {
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [followers, setFollowers] = useState<ChatUser[]>([]);
  const [following, setFollowing] = useState<ChatUser[]>([]);
  const [recent, setRecent] = useState<RecentConv[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"recent" | "all" | "followers" | "following">("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { onlineUsers, isOnline } = useSocket();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      // Filter out current user
      const others = Array.isArray(data)
        ? data.filter((u: ChatUser) => u._id !== user?._id)
        : [];
      setAllUsers(others);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError("Could not load members.");
    }
  }, [user?._id]);
  const fetchFollowData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}`);
      const data = await res.json();
      const finalUser = data.user || data;

      // Fetch full user objects for followers
      const followerIds: string[] = (finalUser.followers || []).map((f: any) =>
        typeof f === "string" ? f : f?._id?.toString() ?? f?.toString()
      );
      const followingIds: string[] = (finalUser.following || []).map((f: any) =>
        typeof f === "string" ? f : f?._id?.toString() ?? f?.toString()
      );

      // Get all users and filter
      const allRes = await fetch(`${API_URL}/api/chat/users`);
      const allData = await allRes.json();

      setFollowers(allData.filter((u: ChatUser) => followerIds.includes(u._id)));
      setFollowing(allData.filter((u: ChatUser) => followingIds.includes(u._id)));
    } catch (err) {
      console.error("fetchFollowData error:", err);
    }
  }, [user?._id]);
  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/recent/${user._id}`);
      if (!res.ok) throw new Error("Failed to fetch recent");
      const data = await res.json();
      setRecent(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchRecent error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    Promise.all([fetchUsers(), fetchRecent(), fetchFollowData()]);
  }, []);

  const onlineCount = onlineUsers.filter((id) => id !== user?._id).length;

  const filteredAll = allUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFollowers = followers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFollowing = following.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRecent = recent.filter((r) =>
    r.user.username.toLowerCase().includes(search.toLowerCase())
  );

  const goToChat = (userId: string, chatUser: ChatUser) => {
    navigate(`/chat/${userId}`, { state: { otherUser: chatUser } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-56px)]">
        {/* Page header */}
        <div className="px-4 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-semibold">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {onlineCount} online
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary border border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm transition"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-secondary/70 rounded-xl p-1 flex-wrap">
            {(["recent", "all", "followers", "following"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs rounded-lg font-medium transition-all capitalize ${tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t === "recent" && "Recent"}
                {t === "all" && (
                  <span className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    All
                    {allUsers.length > 0 && (
                      <span className="bg-primary/20 text-primary text-xs px-1 rounded-full">
                        {allUsers.length}
                      </span>
                    )}
                  </span>
                )}
                {t === "followers" && (
                  <span className="flex items-center justify-center gap-1">
                    Followers
                    {followers.length > 0 && (
                      <span className="bg-primary/20 text-primary text-xs px-1 rounded-full">
                        {followers.length}
                      </span>
                    )}
                  </span>
                )}
                {t === "following" && (
                  <span className="flex items-center justify-center gap-1">
                    Following
                    {following.length > 0 && (
                      <span className="bg-primary/20 text-primary text-xs px-1 rounded-full">
                        {following.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {error && (
            <p className="text-center text-xs text-destructive py-4">{error}</p>
          )}

          {tab === "recent" ? (
            loading ? (
              <div className="space-y-1 px-2 pt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                    <div className="w-11 h-11 rounded-full bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-secondary rounded animate-pulse w-1/3" />
                      <div className="h-3 bg-secondary rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRecent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium mb-1">No conversations yet</p>
                <p className="text-xs opacity-60 mb-4">Start chatting with someone</p>
                <button
                  onClick={() => setTab("all")}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Browse members →
                </button>
              </div>
            ) : (
              <div className="space-y-0.5 pt-1">
                {filteredRecent.map((r) => (
                  <button
                    key={r.user._id}
                    onClick={() => goToChat(r.user._id, r.user)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/80 active:bg-secondary transition text-left group"
                  >
                    <Avatar user={r.user} showOnline online={isOnline(r.user._id)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${r.unreadCount > 0 ? "text-foreground" : "text-foreground/80"}`}>
                          {r.user.username}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(r.lastTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-xs truncate ${r.unreadCount > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                          {r.lastMessage}
                        </p>
                        {r.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                            {r.unreadCount > 99 ? "99+" : r.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            /* All Members tab */
            <div className="pt-2">
              {/* Loading state for all members */}
              {loading && allUsers.length === 0 ? (
                <div className="space-y-1 px-2 pt-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                      <div className="w-11 h-11 rounded-full bg-secondary animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-secondary rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-secondary rounded animate-pulse w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Online members section */}
                  {filteredAll.filter((u) => isOnline(u._id)).length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                        Online now
                      </p>
                      <div className="flex gap-3 px-3 overflow-x-auto pb-2 scrollbar-hide">
                        {filteredAll
                          .filter((u) => isOnline(u._id))
                          .map((u) => (
                            <button
                              key={u._id}
                              onClick={() => goToChat(u._id, u)}
                              className="flex flex-col items-center gap-1.5 shrink-0"
                            >
                              <Avatar user={u} size="lg" showOnline online />
                              <span className="text-xs text-foreground/70 max-w-[56px] truncate">
                                {u.username}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Followers tab */}
                  {tab === "followers" && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                        Followers ({filteredFollowers.length})
                      </p>
                      {filteredFollowers.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">No followers yet</p>
                      ) : (
                        <div className="space-y-0.5">
                          {filteredFollowers.map((u) => (
                            <button
                              key={u._id}
                              onClick={() => goToChat(u._id, u)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/80 transition text-left group"
                            >
                              <Avatar user={u} showOnline online={isOnline(u._id)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{u.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  {isOnline(u._id)
                                    ? <span className="text-green-500">● Active now</span>
                                    : "Tap to message"}
                                </p>
                              </div>
                              <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Following tab */}
                  {tab === "following" && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                        Following ({filteredFollowing.length})
                      </p>
                      {filteredFollowing.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">Not following anyone yet</p>
                      ) : (
                        <div className="space-y-0.5">
                          {filteredFollowing.map((u) => (
                            <button
                              key={u._id}
                              onClick={() => goToChat(u._id, u)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/80 transition text-left group"
                            >
                              <Avatar user={u} showOnline online={isOnline(u._id)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{u.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  {isOnline(u._id)
                                    ? <span className="text-green-500">● Active now</span>
                                    : "Tap to message"}
                                </p>
                              </div>
                              <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* All members list */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    All members ({allUsers.length})
                  </p>
                  {filteredAll.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">No members found</p>
                  ) : (
                    <div className="space-y-0.5">
                      {filteredAll.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => goToChat(u._id, u)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/80 active:bg-secondary transition text-left group"
                        >
                          <Avatar user={u} showOnline online={isOnline(u._id)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{u.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {isOnline(u._id) ? (
                                <span className="text-green-500">● Active now</span>
                              ) : (
                                "Tap to message"
                              )}
                            </p>
                          </div>
                          <MessageCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
