import { API_URL, fixImageUrl } from "@/lib/config";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FandomSidebar } from "@/components/FandomSidebar";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Heart, Layers, Edit3, X, Camera, Trash2 } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [createdPosts, setCreatedPosts] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "created" | "communities">("posts");
  const [Profileuser, setProfileuser] = useState<any>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [isfollowing, setIsFollowing] = useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState<null | "avatar" | "banner">(null);

  const isOwnProfile = user?._id === Profileuser?._id;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchProfile = async () => {
    const [userRes, postsRes] = await Promise.all([
      fetch(`${API_URL}/api/users/${username}`),
      fetch(`${API_URL}/api/posts`),
    ]);
    const userData = await userRes.json();
    const allPosts = await postsRes.json();
    const finalUser = userData.user || userData;
    setProfileuser(finalUser);
    setCommunities(finalUser.followingCommunities || []);
    setLikedPosts(allPosts.filter((p: any) =>
      p.upvotes?.includes(finalUser._id) || p.downvotes?.includes(finalUser._id)
    ));
    setCreatedPosts(allPosts.filter((p: any) =>
      p.author?._id === finalUser._id || p.author === finalUser._id
    ));
    setFollowersCount(finalUser.followers?.length ?? 0);
    if (user && finalUser.followers) {
      setIsFollowing(
        finalUser.followers.some((id: any) =>
          id?.toString() === user._id || id?._id?.toString() === user._id
        )
      );
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_URL}/api/upload/${user._id}`, { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) { setProfileuser(data); localStorage.setItem("user", JSON.stringify(data)); setLightbox(null); }
    else alert("Upload failed");
  };

  const handleBannerChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "banner");
    const res = await fetch(`${API_URL}/api/upload/${user._id}`, { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) { setProfileuser(data); localStorage.setItem("user", JSON.stringify(data)); setLightbox(null); }
    else alert("Upload failed");
  };
  const handleFollow = async () => {
  if (!user) return navigate("/login");
  try {
    const res = await fetch(`${API_URL}/api/users/${Profileuser._id}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followerId: user._id }),
    });
    const data = await res.json();
    if (res.ok) {
      setIsFollowing(data.followed);
      setFollowersCount(data.followersCount);
    }
  } catch (err) {
    console.error("Follow error:", err);
  }
};
  const handleRemoveImage = async (type: "avatar" | "banner") => {
    const res = await fetch(`${API_URL}/api/upload/remove/${user._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (res.ok) { await fetchProfile(); setLightbox(null); }
    else alert("Failed to remove image");
  };

  if (!Profileuser) return <div className="text-white p-4 min-h-screen bg-background">Loading...</div>;

  const avatarLetter = Profileuser?.username?.[0]?.toUpperCase() || "?";

  const lightboxImage = lightbox === "avatar"
    ? (Profileuser?.profilePicture ? fixImageUrl(Profileuser.profilePicture) : null)
    : (Profileuser?.bannerImage ? fixImageUrl(Profileuser.bannerImage) : null);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxImage ? (
              <img
                src={lightboxImage}
                className={`w-full object-contain rounded-2xl shadow-2xl ${lightbox === "avatar" ? "max-h-[70vh] mx-auto w-auto" : "max-h-[60vh]"
                  }`}
              />
            ) : (
              <div className={`w-full bg-gradient-to-br ${lightbox === "avatar"
                  ? "from-indigo-500 to-blue-500 h-64 w-64 mx-auto rounded-full flex items-center justify-center text-white text-8xl font-bold"
                  : "from-indigo-600 to-blue-100 h-48 rounded-2xl"
                }`}>
                {lightbox === "avatar" && avatarLetter}
              </div>
            )}

            {/* Own profile actions — only visible in lightbox */}
            {isOwnProfile && (
              <div className="flex gap-3 justify-center mt-5">
                <button
                  onClick={() => lightbox === "avatar" ? fileInputRef.current?.click() : bannerInputRef.current?.click()}
                  className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 transition"
                >
                  <Camera className="h-4 w-4" />
                  Change {lightbox === "avatar" ? "Photo" : "Banner"}
                </button>
                {lightboxImage && (
                  <button
                    onClick={() => handleRemoveImage(lightbox === "avatar" ? "avatar" : "banner")}
                    className="flex items-center gap-2 bg-red-500 text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <input type="file" ref={bannerInputRef} onChange={handleBannerChange} className="hidden" accept="image/*" />
        </div>
      )}

      <div className="flex">
        <FandomSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0">

          {/* ── Banner — click to open lightbox ── */}
          <div
            className="relative h-36 sm:h-52 overflow-hidden cursor-pointer group"
            onClick={() => setLightbox("banner")}
          >
            {Profileuser?.bannerImage ? (
              <img src={fixImageUrl(Profileuser.bannerImage)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-blue-100" />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-medium">
              Click to view
            </div>
          </div>

          {/* ── Profile header ── */}
          <div className="px-4 lg:px-8 -mt-14 relative">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-4 mb-5">

                {/* Avatar — click to open lightbox */}
                <div
                  className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group border-4 border-background"
                  onClick={() => setLightbox("avatar")}
                >
                  {Profileuser?.profilePicture ? (
                    <img src={fixImageUrl(Profileuser.profilePicture)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                      {avatarLetter}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                    View
                  </div>
                </div>

                {/* Name + meta */}
                <div className="flex-1 pb-1">
                  <h1 className="text-2xl font-bold leading-tight">{Profileuser?.displayName || Profileuser?.username}</h1>
                  <p className="text-sm text-muted-foreground">@{Profileuser?.username}</p>
                </div>

                {/* Edit button — own profile only */}
                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="mb-1 gap-1.5" onClick={() => navigate(`/profile/${Profileuser?.username}/edit`)}>
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                )}
                {!isOwnProfile && (
                  <Button variant="outline" size="sm" className="mb-1 gap-1.5" onClick={handleFollow}>
                    {isfollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>

              {Profileuser?.bio && (
                <p className="text-sm text-muted-foreground mb-4 max-w-xl">{Profileuser.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
  <UserCheck className="h-4 w-4 text-violet-400" />
  <span className="font-semibold text-foreground">{followersCount}</span>
  <span>Followers</span>
</div>
<div className="flex items-center gap-1.5">
  <Users className="h-4 w-4 text-fuchsia-400" />
  <span className="font-semibold text-foreground">{Profileuser?.following?.length ?? 0}</span>
  <span>Following</span>
</div>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-400" />
                  <span className="font-semibold text-foreground">{likedPosts.length}</span>
                  <span>Reacted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-sky-400" />
                  <span className="font-semibold text-foreground">{createdPosts.length}</span>
                  <span>Posts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-sky-400" />
                  <span className="font-semibold text-foreground">{Profileuser?.followingCommunities?.length ?? 0}</span>
                  <span>Communities</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 border-b border-border">
                {(["posts", "created", "communities"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                        ? "border-violet-500 text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tab === "posts" ? "Reacted" : tab === "created" ? "Posts" : "Communities"}
                  </button>
                ))}
              </div>

              {/* Reacted Posts */}
              {activeTab === "posts" && (
                <div className="space-y-4 pb-10">
                  {likedPosts.length > 0 ? (
                    likedPosts.map((post: any) => {
                      const formattedPost = {
                        ...post,
                        upvotes: post.upvotes || [],
                        downvotes: post.downvotes || [],
                        fandomName: post.community?.name || "Unknown",
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
                      <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold">No reacted posts yet</p>
                      <p className="text-sm">Posts this user reacts to will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Created Posts */}
              {activeTab === "created" && (
                <div className="space-y-4 pb-10">
                  {createdPosts.length > 0 ? (
                    createdPosts.map((post: any) => {
                      const formattedPost = {
                        ...post,
                        upvotes: post.upvotes || [],
                        downvotes: post.downvotes || [],
                        fandomName: post.community?.name || "Unknown",
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
                      <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold">No posts created yet</p>
                      <p className="text-sm">Posts created by this user will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Communities */}
              {activeTab === "communities" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-10">
                  {communities.length > 0 ? (
                    communities.map((c: any) => (
                      <div
                        key={c._id}
                        onClick={() => navigate(`/f/${c._id}`)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                          {c.icon ? (
                            <img src={c.icon} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                              {c.name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">f/{c.slug}</p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {c.membersCount ?? 0} members
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-16 text-muted-foreground">
                      <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold">No communities joined</p>
                      <p className="text-sm">Communities this user follows will appear here.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;