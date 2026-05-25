import { API_URL } from "@/lib/config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const CATEGORIES = [
  { label: "Movies", emoji: "🎬" },
  { label: "Games", emoji: "🎮" },
  { label: "Anime", emoji: "⛩️" },
  { label: "TV Shows", emoji: "📺" },
  { label: "Comics", emoji: "💥" },
  { label: "Books", emoji: "📚" },
  { label: "Music", emoji: "🎵" },
  { label: "Sports", emoji: "⚽" },
  { label: "Tech", emoji: "💻" },
  { label: "Art", emoji: "🎨" },
];

export default function Categories() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const toggle = (category: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const handleDone = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user._id) { alert("User missing. Please log in again."); return; }

    setSaving(true);
    try {
      // Save all selected categories in parallel
      await Promise.all(
        [...selected].map(category =>
          fetch(`${API_URL}/api/users/update-category`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id, category }),
          })
        )
      );

      // Fetch updated user — handle both {user: ...} and plain object responses
      const res = await fetch(`${API_URL}/api/users/${user.username}`);
      const data = await res.json();
      const updatedUser = data.user || data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-1">Pick your interests</h1>
      <p className="text-muted-foreground text-sm mb-8">Select all that apply — you can change these later</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-2xl mb-10">
        {CATEGORIES.map(({ label, emoji }) => {
          const isSelected = selected.has(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                ${isSelected
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-secondary border-border text-foreground hover:border-primary/50"
                }`}
            >
              <span className="text-xl">{emoji}</span>
              <span>{label}</span>
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 bg-primary rounded-full p-0.5">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleDone}
        disabled={selected.size === 0 || saving}
        className="px-10 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : `Continue with ${selected.size} selected`}
      </button>

      {selected.size === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">Select at least one to continue</p>
      )}
    </div>
  );
}