import { Flame, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "new", label: "New", icon: Clock },
  { id: "top", label: "Top", icon: TrendingUp },
  { id: "rising", label: "Rising", icon: Sparkles },
] as const;

export function FeedTabs() {
  const [active, setActive] = useState("hot");

  return (
    <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActive(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-primary text-primary-foreground glow-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <tab.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
