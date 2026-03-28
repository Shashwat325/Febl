import { fandoms, formatMemberCount } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Users, TrendingUp } from "lucide-react";

interface FandomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FandomSidebar({ isOpen, onClose }: FandomSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-card/50 backdrop-blur-xl overflow-y-auto scrollbar-thin transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6">
          {/* My Fandoms */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              My Fandoms
            </h3>
            <div className="space-y-1">
              {fandoms.slice(0, 4).map((fandom) => (
                <Link
                  key={fandom.id}
                  to={`/f/${fandom.slug}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                  onClick={onClose}
                >
                  <span className="text-xl">{fandom.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {fandom.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMemberCount(fandom.memberCount)} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              Trending
            </h3>
            <div className="space-y-1">
              {fandoms.slice(2).map((fandom) => (
                <Link
                  key={fandom.id}
                  to={`/f/${fandom.slug}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                  onClick={onClose}
                >
                  <span className="text-xl">{fandom.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {fandom.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{formatMemberCount(fandom.onlineCount)} online</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
