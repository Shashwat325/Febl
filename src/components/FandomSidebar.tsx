import { API_URL } from "@/lib/config";
import { Link } from "react-router-dom";
import { Users, TrendingUp, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

interface FandomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FandomSidebar({ isOpen, onClose }: FandomSidebarProps) {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<any[]>([]);
  const { getCommunityOnline } = useSocket();

  useEffect(() => {
    fetchcommunities();
  }, []);

  const fetchcommunities = async () => {
    const [commRes, postsRes] = await Promise.all([
      fetch(`${API_URL}/api/communities`),
      fetch(`${API_URL}/api/posts`),
    ]);
    const commData = await commRes.json();
    const postsData = await postsRes.json();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Count posts per community from last 7 days
    const postCounts: Record<string, number> = {};
    postsData.forEach((post: any) => {
      if (new Date(post.createdAt) < sevenDaysAgo) return;
      const cid = post.community?._id || post.community;
      if (cid) {
        postCounts[cid] = (postCounts[cid] || 0) + 1;
      }
    });

    // Attach post count to each community
    const withCounts = commData.map((c: any) => ({
      ...c,
      postCount: postCounts[c._id] || 0,
    }));

    setCommunities(withCounts);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-card/50 backdrop-blur-xl overflow-y-auto scrollbar-thin transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 space-y-6">
          {/* My Fandoms */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              My Fandoms
            </h3>
            <div className="space-y-1">
              {communities.slice(0, 5).map((community) => {
                const onlineCount = getCommunityOnline(community._id);
                return (
                  <Link
                    key={community._id}
                    to={`/f/${community._id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                    onClick={onClose}
                  >
                    {community.icon ? (
                      <img src={community.icon} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {community.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary">
                        {community.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {community.membersCount} members
                        {onlineCount > 0 && (
                          <span className="ml-1.5 text-green-500 font-medium">
                            · {onlineCount} online
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Trending */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              Trending
            </h3>
            <div className="space-y-1">
              {[...communities]
                .sort((a, b) => b.postCount - a.postCount)
                .slice(0, 5)
                .map((community) => {
                  const onlineCount = getCommunityOnline(community._id);
                  return (
                    <Link
                      key={community._id}
                      to={`/f/${community._id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                      onClick={onClose}
                    >
                      {community.icon ? (
                        <img src={community.icon} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {community.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary">
                          {community.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{community.membersCount} members</span>
                          {onlineCount > 0 && (
                            <>
                              <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
                              <span className="text-green-500">{onlineCount} online</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
