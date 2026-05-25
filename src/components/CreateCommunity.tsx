import { API_URL } from "@/lib/config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCommunity() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Community name is required"); return; }
    setError("");
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${API_URL}/api/communities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          creator: user._id,
        }),
      });
      const data = await res.json();
      if (res.ok) navigate(`/f/${data._id}`);
      else setError(data.message || "Error creating community");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-foreground text-center">Create Your Fandom 🔥</h1>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Community Name</label>
          <input
            type="text" placeholder="e.g. JujutsuKaisen" value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            placeholder="What is this fandom about?" value={description}
            onChange={e => setDescription(e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tags <span className="text-muted-foreground font-normal">(comma separated)</span></label>
          <input
            type="text" placeholder="anime, action, fantasy" value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Community 🚀"}
        </button>
      </form>
    </div>
  );
}