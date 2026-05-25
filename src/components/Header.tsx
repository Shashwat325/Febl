import {
  Search, MessageCircle, Plus, Menu, LogOut,
  User, FileText, Users, Sun, Moon, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import logo from "@/assets/fictionhub-logo.png";
import { useState, useRef, useEffect } from "react";
import { API_URL, fixImageUrl } from "@/lib/config";
import { NotificationBell } from "@/components/NotificationBell";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [plusDropdownOpen, setPlusDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const firstletter = user?.username?.charAt(0)?.toUpperCase();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const plusDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (plusDropdownRef.current && !plusDropdownRef.current.contains(e.target as Node)) {
        setPlusDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(`${API_URL}/api/search?q=${query}`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${query}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="flex h-14 items-center gap-2 sm:gap-3 px-3 sm:px-5">

        {/* Mobile menu */}
        {onToggleSidebar && (
          <Button
            variant="ghost" size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground shrink-0"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <div
          className="flex items-center gap-2 shrink-0 cursor-pointer group"
          onClick={() => navigate("/home")}
        >
          <div className="relative">
            <img src={logo} alt="FictionHub" className="h-8 w-8 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
          </div>
          <span className="font-display text-lg font-bold text-foreground hidden sm:block tracking-tight">
            Febl
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto relative" ref={searchRef}>
          <div className={`relative transition-all duration-200 ${searchFocused ? "glow-primary rounded-xl" : ""}`}>
            {searchLoading
              ? <div className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            }
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { handleSearch(e); setSearchResults(null); }
                if (e.key === "Escape") { setSearchResults(null); setQuery(""); }
              }}
              placeholder="Search fandoms, posts, users…"
              className="pl-9 pr-3 h-9 bg-secondary/60 border-border/60 focus:border-primary/50 text-sm rounded-xl placeholder:text-muted-foreground/70 transition-colors"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Live results dropdown */}
          {searchResults && query.trim() && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto animate-scale-in"
              onMouseDown={(e) => e.preventDefault()}
            >
              {searchResults.posts?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-4 py-2.5 border-b border-border bg-muted/30">Posts</p>
                  {searchResults.posts.slice(0, 3).map((post: any) => (
                    <div
                      key={post._id}
                      onClick={() => { navigate(`/post/${post._id}`); setSearchResults(null); setQuery(""); }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/60 cursor-pointer transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        {post.community?.name && (
                          <p className="text-xs text-muted-foreground">f/{post.community.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.communities?.length > 0 && (
                <div className="border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-4 py-2.5 border-b border-border bg-muted/30">Communities</p>
                  {searchResults.communities.slice(0, 3).map((comm: any) => (
                    <div
                      key={comm._id}
                      onClick={() => { navigate(`/f/${comm._id}`); setSearchResults(null); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
                        {comm.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{comm.name}</p>
                        <p className="text-xs text-muted-foreground">{comm.membersCount ?? 0} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.users?.length > 0 && (
                <div className="border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-4 py-2.5 border-b border-border bg-muted/30">Users</p>
                  {searchResults.users.slice(0, 3).map((u: any) => (
                    <div
                      key={u._id}
                      onClick={() => { navigate(`/profile/${u.username}`); setSearchResults(null); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">@{u.username}</p>
                        {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.posts?.length === 0 &&
                searchResults.communities?.length === 0 &&
                searchResults.users?.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                )}

              {(searchResults.posts?.length > 0 || searchResults.communities?.length > 0 || searchResults.users?.length > 0) && (
                <div className="border-t border-border">
                  <button
                    onClick={() => { navigate(`/search?q=${query}`); setSearchResults(null); }}
                    className="w-full px-4 py-3 text-sm text-primary font-semibold hover:bg-secondary/60 transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    View all results for &ldquo;{query}&rdquo;
                    <span className="opacity-60">→</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

          {/* + Dropdown */}
          <div className="relative hidden sm:block" ref={plusDropdownRef}>
            <Button
              variant="ghost" size="icon"
              className={`h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${plusDropdownOpen ? "text-primary bg-primary/10" : ""}`}
              onClick={() => setPlusDropdownOpen(prev => !prev)}
              title="Create"
            >
              <Plus className="h-4.5 w-4.5" />
            </Button>

            {plusDropdownOpen && (
              <div className="absolute right-0 top-11 w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                <div className="p-1">
                  <button
                    onClick={() => { navigate("/create"); setPlusDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Create Post</p>
                      <p className="text-xs text-muted-foreground">Share with your fandom</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { navigate("/createcommunity"); setPlusDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">Create Community</p>
                      <p className="text-xs text-muted-foreground">Start a new fandom</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => navigate("/chat")}
            title="Messages"
          >
            <MessageCircle className="h-4.5 w-4.5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors relative"
          >
            <NotificationBell />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </Button>

          {/* Avatar / Sign In */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold cursor-pointer text-xs overflow-hidden select-none ring-2 ring-transparent hover:ring-primary/50 transition-all"
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                {user.profilePicture
                  ? <img src={fixImageUrl(user.profilePicture)} alt="" className="w-full h-full object-cover rounded-full" />
                  : firstletter}
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 top-11 w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { navigate(`/profile/${user.username}`); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-xl transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { navigate("/create"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-xl transition-colors sm:hidden"
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      Create Post
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="ml-1 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all hover:glow-primary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}