import { useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { FandomSidebar } from "@/components/FandomSidebar";
import { PostCard } from "@/components/PostCard";
import { FeedTabs } from "@/components/FeedTabs";
import { Button } from "@/components/ui/button";
import { Users, Globe } from "lucide-react";
import { fandoms, posts, formatMemberCount } from "@/data/mockData";
import heroBanner from "@/assets/hero-banner.jpg";

const FandomPage = () => {
  const { slug } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joined, setJoined] = useState(false);

  const fandom = fandoms.find((f) => f.slug === slug) || fandoms[0];
  const fandomPosts = posts.filter((p) => p.fandomId === fandom.id);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <FandomSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0">
          {/* Banner */}
          <div className="relative h-32 sm:h-48">
            <img src={heroBanner} alt={fandom.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          {/* Fandom info */}
          <div className="px-4 lg:px-6 -mt-8 relative">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-4 mb-4">
                <div className="text-5xl bg-card border-4 border-background rounded-2xl p-3">
                  {fandom.icon}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-display font-bold">{fandom.name}</h1>
                  <p className="text-sm text-muted-foreground">f/{fandom.slug}</p>
                </div>
                <Button
                  onClick={() => setJoined(!joined)}
                  variant={joined ? "secondary" : "default"}
                  className="font-semibold"
                >
                  {joined ? "Joined" : "Join"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{fandom.description}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold text-foreground">{formatMemberCount(fandom.memberCount)}</span>
                  <span>Members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-online" />
                  <span className="font-semibold text-foreground">{formatMemberCount(fandom.onlineCount)}</span>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="px-4 lg:px-6 pb-8">
            <div className="max-w-3xl mx-auto space-y-4">
              <FeedTabs />
              {fandomPosts.length > 0 ? (
                fandomPosts.map((post) => <PostCard key={post.id} post={post} />)
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
