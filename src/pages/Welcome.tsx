import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, Users, Zap, ChevronRight } from "lucide-react";
import logo from "@/assets/fictionhub-logo.png";

const FEATURES = [
  { icon: BookOpen, label: "Rich Stories", desc: "Post chapters, one-shots, and serials" },
  { icon: Users,    label: "Fandoms",      desc: "Join communities for every fandom" },
  { icon: Zap,      label: "Live Chat",    desc: "Real-time messaging with Socket.IO" },
];

const BUBBLES = [
  { text: "Just posted chapter 12 🔥", delay: "0s",   left: "8%",   top: "20%" },
  { text: "Onepiece lore drop???",      delay: "0.8s", left: "70%",  top: "14%" },
  { text: "New AU just dropped ✍️",    delay: "1.4s", left: "55%",  top: "72%" },
  { text: "Omg that ending 😭",         delay: "0.4s", left: "15%",  top: "68%" },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial gradient blobs */}
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-5%] right-[5%] w-[400px] h-[400px] rounded-full bg-accent/6 blur-3xl" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Floating chat bubbles */}
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card/80 border border-border/60 shadow-lg text-sm text-foreground/80 backdrop-blur-sm animate-fade-up"
          style={{ left: b.left, top: b.top, animationDelay: b.delay, animationFillMode: "both" }}
        >
          <span className="w-2 h-2 rounded-full bg-online animate-pulse shrink-0" />
          {b.text}
        </div>
      ))}

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src={logo} alt="FictionHub" className="h-8 w-8" />
          <span className="font-display text-lg font-bold">
            Fiction<span className="text-primary">Hub</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all hover:glow-primary"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 animate-fade-up">
          <Sparkles className="h-3.5 w-3.5" />
          The home for fiction fans
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          Where every fandom<br />
          <span className="text-primary text-glow">finds its voice</span>
        </h1>

        {/* Sub */}
        <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          Join communities, share stories, upvote theories, and connect with fans worldwide — all in one place.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <button
            onClick={() => navigate("/register")}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all hover:glow-primary"
          >
            Join for free
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-7 py-3.5 rounded-2xl bg-secondary text-foreground font-semibold text-base border border-border hover:border-primary/30 transition-all"
          >
            Sign in
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-col sm:flex-row gap-4 mt-16 animate-fade-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-2 px-5 py-5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/25 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-display font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground text-center">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FictionHub — Made with ❤️ for fans
      </footer>
    </div>
  );
}