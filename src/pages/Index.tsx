import { useState } from "react";
import { Header } from "@/components/Header";
import { FandomSidebar } from "@/components/FandomSidebar";
import { PostCard } from "@/components/PostCard";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import { FeedTabs } from "@/components/FeedTabs";
import { posts } from "@/data/mockData";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <FandomSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main feed */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <FeedTabs />
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        <TrendingSidebar />
      </div>
    </div>
  );
};

export default Index;
