import { API_URL } from "@/lib/config";
import { useSocket } from "@/context/SocketContext";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FandomSidebar } from "@/components/FandomSidebar";
import { PostCard } from "@/components/PostCard";
import { FeedTabs } from "@/components/FeedTabs";
import { Button } from "@/components/ui/button";
import { Users, Globe } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const FandomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ ALL hooks declared first — nothing before these
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"hot" | "new" | "top" | "rising">("hot");
  const [error, setError] = useState<string>("");
  const { getCommunityOnline, refreshCommunities } = useSocket();

  // ✅ useMemo here — before any early return
  const sortedPosts = useMemo(() => {
    const now = Date.now();
    return [...posts].sort((a, b) => {
      const aUps = a.upvotes?.length ?? 0;
      const aDowns = a.downvotes?.length ?? 0;
      const bUps = b.upvotes?.length ?? 0;
      const bDowns = b.downvotes?.length ?? 0;
      const aScore = aUps - aDowns;
      const bScore = bUps - bDowns;
      const aAge = (now - new Date(a.createdAt).getTime()) / 3600000;
      const bAge = (now - new Date(b.createdAt).getTime()) / 3600000;

      if (activeTab === "new") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (activeTab === "top") return bScore - aScore;
      if (activeTab === "hot") {
        return (bScore / Math.pow(bAge + 2, 1.5)) - (aScore / Math.pow(aAge + 2, 1.5));
      }
      if (activeTab === "rising") {
        const aRecent = aAge < 24 ? aScore / Math.max(aAge, 0.5) : -Infinity;
        const bRecent = bAge < 24 ? bScore / Math.max(bAge, 0.5) : -Infinity;
        return bRecent - aRecent;
      }
      return 0;
    });
  }, [posts, activeTab]);

  const userdata = localStorage.getItem("user");
  const userId = userdata ? JSON.parse(userdata)._id : null;

  useEffect(() => {
    fetchCommunity();
  }, [id]);

  const fetchCommunity = async () => {
    const res = await fetch(`${API_URL}/api/communities/${id}`);
    const communitydata = await res.json();
    setCommunity(communitydata);

    const postRes = await fetch(`${API_URL}/api/posts`);
    const postData = await postRes.json();
    const filtered = postData.filter(
      (p: any) => p.community?._id === communitydata._id
    );
    setPosts(filtered);

    if (userId && communitydata.followers) {
      const isfollowing = communitydata.followers?.some(
        (followerid: any) => followerid?.toString() === userId?.toString()
      );
      setJoined(isfollowing);
    }
  };

  const handleJoin = async () => {
    if (!userId) {
      setError("Please login first");
      return;
    }

    setJoinLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/communities/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to join community");
      }

      const data = await res.json();

      if (data.joined === undefined || data.membersCount === undefined) {
        throw new Error("Invalid response format");
      }

      setJoined(data.joined);
      setCommunity((prev: any) => ({
        ...prev,
        membersCount: data.membersCount,
        followers: data.joined
          ? [...(prev.followers || []), userId]
          : (prev.followers || []).filter(
              (fid: any) => fid?.toString() !== userId?.toString()
            ),
      }));

      // Sync localStorage so socket knows updated community list
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        const current: string[] = (storedUser.followingCommunities || []).map(
          (c: any) => (typeof c === "string" ? c : c?.toString())
        );
        storedUser.followingCommunities = data.joined
          ? [...new Set([...current, id as string])]
          : current.filter((cid) => cid !== id);
        localStorage.setItem("user", JSON.stringify(storedUser));
        refreshCommunities();
      }

      setError("");
    } catch (err: any) {
      console.error("Join error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  // ✅ Early return AFTER all hooks
  if (!community) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <FandomSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0">
          {/* Banner */}
          <div className="relative h-32 sm:h-48">
            {community.banner ? (
              <img src={community.banner} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          {/* Fandom info */}
          <div className="px-4 lg:px-6 -mt-8 relative">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-4 mb-4">
                <div className="text-5xl bg-card border-4 border-background rounded-2xl p-3">
                  {community.icon ? (
                    <img src={community.icon} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {community.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-display font-bold">{community.name}</h1>
                  <p className="text-sm text-muted-foreground">f/{community.slug}</p>
                </div>
                <Button
                  onClick={handleJoin}
                  variant={joined ? "secondary" : "default"}
                  className="font-semibold"
                  disabled={joinLoading}
                >
                  {joinLoading ? "Loading..." : joined ? "Joined" : "Join"}
                </Button>
                <Button
                  variant="outline"
                  className="font-semibold"
                  onClick={() => navigate("/create", { state: { CommunityName: community.name, CommunityId: community._id } })}
                >
                  Create Post
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{community.description}</p>

              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold text-foreground">{community.membersCount}</span>
                  <span>Members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-online" />
                  <span className="font-semibold text-foreground">{getCommunityOnline(community._id)}</span>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="px-4 lg:px-6 pb-8">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* <FeedTabs active={activeTab} onChange={setActiveTab} /> */}
              {sortedPosts.length > 0 ? (
                sortedPosts.map((post: any) => {
                  const formattedPost = {
                    ...post,
                    upvotes: post.upvotes || [],
                    downvotes: post.downvotes || [],
                    fandomName: community.name,
                    fandomIcon: "🔥",
                    author: post.author?.username || "unknown",
                    createdAt: new Date(post.createdAt).toLocaleString(),
                    commentCount: post.comments?.length || 0,
                    tags: post.tags || [],
                    media: post.media || [],
                  };
                  return <PostCard key={post._id} post={formattedPost} />;
                })
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg font-display">No posts yet</p>
                  <p className="text-sm">Be the first to post in this fandom!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FandomPage;