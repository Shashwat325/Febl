import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ImagePlus, X, Film } from "lucide-react";

export default function CreatePost() {
  const location = useLocation();
  const preselectedCommunityname = location.state?.CommunityName || "";
  const preselectedCommunityid = location.state?.CommunityId || "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [community, setCommunity] = useState(preselectedCommunityid);
  const [communities, setCommunities] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/communities`)
      .then(res => res.json())
      .then(data => setCommunities(data))
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isVideo = (file: File) => file.type.startsWith("video/");

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Please add a title"); return; }
    if (!community) { setError("Please select a community"); return; }

    setError("");
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) { setError("You must be logged in to post"); setLoading(false); return; }

      let media: string[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append("media", file));

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Upload failed");
        }
        const uploadData = await uploadRes.json();
        media = uploadData;
      }

      const postRes = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          community,
          media,
          author: user._id,
        }),
      });

      if (!postRes.ok) throw new Error("Post failed");

      if (preselectedCommunityid) navigate(`/f/${preselectedCommunityid}`);
      else navigate("/home");

    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Create Post</h2>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Community */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Community</label>
          <select
            value={community}
            onChange={e => setCommunity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:border-primary text-sm"
          >
            <option value="">Select a community</option>
            {preselectedCommunityid && (
              <option key={preselectedCommunityid} value={preselectedCommunityid}>
                {preselectedCommunityname}
              </option>
            )}
            {communities
              .filter(c => c._id !== preselectedCommunityid)
              .map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your post a title"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tags <span className="text-muted-foreground font-normal">(optional, comma separated)</span>
          </label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="anime, marvel, theory"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Media <span className="text-muted-foreground font-normal">(optional — images or videos)</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary border border-dashed border-border text-muted-foreground text-sm cursor-pointer hover:border-primary transition">
            <ImagePlus className="h-4 w-4" />
            Add images or videos
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {files.map((file, i) => (
                <div key={i} className="relative group">
                  {isVideo(file) ? (
                    <div className="w-20 h-20 rounded-lg border border-border bg-secondary overflow-hidden relative">
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Film className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-20 h-20 object-cover rounded-lg border border-border"
                    />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Post 🚀"}
        </button>
      </div>
    </div>
  );
}