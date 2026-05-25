import { API_URL, fixImageUrl } from "@/lib/config";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Search, Users, FileText, Hash } from "lucide-react";

type Post = {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; username: string };
  media?: string[];
  community?: { _id: string; name: string };
  upvotes: string[];
  downvotes: string[];
  commentCount: number;
};

type Community = {
  _id: string;
  name: string;
  description: string;
  membersCount?: number;
  icon?: string;
};

type User = {
  _id: string;
  username: string;
  bio: string;
  profilePicture?: string;
};

type SearchResult = {
  posts?: Post[];
  communities?: Community[];
  users?: User[];
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "communities" | "users">("all");
  useEffect(() => {
    if (!query) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/search?q=${query}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);
  console.log("Search results:", results.posts?.map((post) => post.community?.name));
  const totalResults =
    (results.posts?.length ?? 0) +
    (results.communities?.length ?? 0) +
    (results.users?.length ?? 0);

  const showPosts = activeTab === "all" || activeTab === "posts";
  const showCommunities = activeTab === "all" || activeTab === "communities";
  const showUsers = activeTab === "all" || activeTab === "users";

  return (
    <div className="min-h-screen bg-background">
      

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search results</span>
          </div>
          <h1 className="text-2xl font-bold">"{query}"</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalResults} result{totalResults !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-6">
          {([
            { id: "all", label: "All" },
            { id: "posts", label: "Posts", count: results.posts?.length },
            { id: "communities", label: "Communities", count: results.communities?.length },
            { id: "users", label: "Users", count: results.users?.length },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
              {"count" in tab && tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20" : "bg-secondary"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-3 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && totalResults === 0 && query && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-semibold">No results found</p>
            <p className="text-sm">Try searching with different keywords</p>
          </div>
        )}

        <div className="space-y-6">

          {/* Posts */}
          {showPosts && results.posts && results.posts.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <FileText className="h-4 w-4" />
                Posts
              </h2>
              <div className="space-y-3">
                {results.posts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                  >
                    {post.community && (
                      <span className="text-xs text-primary font-medium mb-1 block hover:underline" onClick={(e)=>{e.stopPropagation();navigate(`/f/${post.community._id}`)}}>
                        f/{post.community.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
                    {post.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                    )}
                    {/* Images */}
                    {post.media && post.media.length > 0 && (
                      <div className={`grid gap-2 mb-2 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {post.media.slice(0, 4).map((url, i) => (
                          <div key={i} className="relative">
                            <img
                              src={fixImageUrl(url)}
                              alt={post.title}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            {/* Show count overlay if more than 4 images */}
                            {i === 3 && post.media!.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                +{post.media!.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground hover:underline" onClick={(e)=>{e.stopPropagation(); navigate(`/profile/${post.author?._id}`)}}>
                      by {post.author?.username}
                    </span>
                    <div className="flex row gap-4">
                    <div className="flex items-center gap-2 margin-right-4 mt-2">
                     
                      <span className="text-sm text-muted-foreground margin-right: 1rem;">
                        {post.upvotes?.length - post.downvotes?.length || 0} {post.upvotes?.length - post.downvotes?.length === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground" >{post.commentCount||0} {post.commentCount === 1 ? "comment" : "comments"}</span>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities */}
          {showCommunities && results.communities && results.communities.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <Hash className="h-4 w-4" />
                Communities
              </h2>
              <div className="space-y-3">
                {results.communities.map((comm) => (
                  <div
                    key={comm._id}
                    onClick={() => navigate(`/f/${comm._id}`)}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      {comm.icon ? (
                        <img src={fixImageUrl(comm.icon)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl">
                          {comm.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{comm.name}</h3>
                      {comm.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{comm.description}</p>
                      )}
                      {comm.membersCount !== undefined && (
                        <p className="text-xs text-muted-foreground mt-0.5">{comm.membersCount} members</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {showUsers && results.users && results.users.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <Users className="h-4 w-4" />
                Users
              </h2>
              <div className="space-y-3">
                {results.users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/profile/${user.username}`)}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      {user.profilePicture ? (
                        <img src={fixImageUrl(user.profilePicture)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">@{user.username}</h3>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchPage;