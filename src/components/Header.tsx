import { Search, Bell, MessageCircle, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/fictionhub-logo.png";
import { useState } from "react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="FictionHub" className="h-8 w-8" />
          <span className="font-display text-lg font-bold text-primary hidden sm:block text-glow">
            FictionHub
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className={`relative transition-all ${searchFocused ? "glow-primary rounded-lg" : ""}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fandoms, posts, users..."
              className="pl-9 bg-secondary border-border focus:border-primary"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hidden sm:flex">
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hidden sm:flex">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
          </Button>
          <Button variant="default" size="sm" className="ml-2 font-semibold hidden sm:flex">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}
