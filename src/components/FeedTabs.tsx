import { Flame, Clock, Trophy, TrendingUp } from "lucide-react";

type TabId = "hot" | "new" | "top" | "rising";

interface FeedTabsProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "hot",    label: "Hot",    icon: Flame },
  { id: "new",    label: "New",    icon: Clock },
  { id: "top",    label: "Top",    icon: Trophy },
  { id: "rising", label: "Rising", icon: TrendingUp },
];

export function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl bg-secondary/50 border border-border/50 w-fit">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            active === id
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className={`h-3.5 w-3.5 ${active === id ? "text-primary" : ""}`} />
          {label}
        </button>
      ))}
    </div>
  );
}