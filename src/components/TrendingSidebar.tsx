import { trendingFandoms, formatMemberCount } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export function TrendingSidebar() {
  return (
    <aside className="hidden xl:block w-80 shrink-0 space-y-4">
      {/* Hero card */}
      <div className="rounded-xl overflow-hidden border border-border">
        <div className="relative h-24">
          <img src={heroBanner} alt="FictionHub" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
        <div className="p-4 bg-card -mt-4 relative">
          <h3 className="font-display font-bold text-lg mb-1">Welcome to FictionHub</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Your home for anime, movies & fictional universe communities.
          </p>
          <Button className="w-full font-semibold" size="sm">
            Create a Fandom
          </Button>
        </div>
      </div>

      {/* Trending fandoms */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-accent" />
          Trending Fandoms
        </h3>
        <div className="space-y-3">
          {trendingFandoms.map((fandom, i) => (
            <div key={fandom.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
              <span className="text-lg">{fandom.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fandom.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMemberCount(fandom.memberCount)} members
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-online">
                <TrendingUp className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer links */}
      <div className="text-xs text-muted-foreground px-2 space-y-1">
        <p>© 2026 FictionHub. Built for fiction lovers.</p>
      </div>
    </aside>
  );
}
