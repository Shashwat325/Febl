import { API_URL } from "@/lib/config";
import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FandomSidebar } from "@/components/FandomSidebar";
import { PostCard } from "@/components/PostCard";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import CreatePost from "@/components/CreatePost";
import { FeedTabs } from "@/components/FeedTabs";

type TabId = "hot" | "new" | "top" | "rising";

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setposts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("hot");

  const fetchposts = async () => {
    const res = await fetch(`${API_URL}/api/posts`);
    const data = await res.json();
    setposts(data);
  };

  useEffect(() => {
    fetchposts();
  }, []);

  const sortedPosts = useMemo(() => {
    const now = Date.now();

    return [...posts].sort((a, b) => {
      const aUps = a.upvotes?.length ?? 0;
      const aDowns = a.downvotes?.length ?? 0;
      const bUps = b.upvotes?.length ?? 0;
      const bDowns = b.downvotes?.length ?? 0;
      const aScore = aUps - aDowns;
      const bScore = bUps - bDowns;
      const aAge = (now - new Date(a.createdAt).getTime()) / 3600000; // hours old
      const bAge = (now - new Date(b.createdAt).getTime()) / 3600000;

      if (activeTab === "new") {
        // Newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (activeTab === "top") {
        // Highest net score first
        return bScore - aScore;
      }

      if (activeTab === "hot") {
        // Reddit-style hot: score divided by age — recent posts with votes rank high
        const aHot = aScore / Math.pow(aAge + 2, 1.5);
        const bHot = bScore / Math.pow(bAge + 2, 1.5);
        return bHot - aHot;
      }

      if (activeTab === "rising") {
        // Posts less than 24 hours old sorted by score velocity
        const aRecent = aAge < 24 ? aScore / Math.max(aAge, 0.5) : -Infinity;
        const bRecent = bAge < 24 ? bScore / Math.max(bAge, 0.5) : -Infinity;
        return bRecent - aRecent;
      }

      return 0;
    });
  }, [posts, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      {/*<Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />*/}

      <div className="flex">
        <FandomSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <FeedTabs active={activeTab} onChange={setActiveTab} />

            {sortedPosts.length > 0 ? (
              sortedPosts.map((post: any) => {
                const formattedPost = {
                  ...post,
                  upvotes: post.upvotes || [],
                  downvotes: post.downvotes || [],
                  fandomName: post.community?.name,
                  fandomIcon: "🔥",
                  author: post.author?.username || "unknown",
                  createdAt: new Date(post.createdAt).toLocaleString(),
                  commentCount: post.commentCount || 0,
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
        </main>

        <TrendingSidebar/>
      </div>
    </div>
  );
};

export default Home;