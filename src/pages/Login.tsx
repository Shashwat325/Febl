import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { Eye, EyeOff, LogIn } from "lucide-react";
import logo from "@/assets/fictionhub-logo.png";

export default function Login() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;
    if (!form.email.trim()) { newErrors.email = "Email is required"; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { newErrors.email = "Enter a valid email address"; valid = false; }
    if (!form.password.trim()) { newErrors.password = "Password is required"; valid = false; }
    else if (form.password.length < 6) { newErrors.password = "Password must be at least 6 characters"; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        setMsg(data.message || "Login failed. Please try again.");
      }
    } catch {
      setMsg("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 relative overflow-hidden border-r border-border">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[5%] left-[-5%] w-56 h-56 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="FictionHub" className="h-9 w-9" />
          <span className="font-display text-xl font-bold">Fiction<span className="text-primary">Hub</span></span>
        </div>

        {/* Quote */}
        <div className="space-y-4">
          <blockquote className="font-display text-3xl font-bold leading-snug text-foreground">
            "Every great story<br />
            starts with a<br />
            <span className="text-primary text-glow">passionate fan."</span>
          </blockquote>
          <p className="text-sm text-muted-foreground">Join thousands of writers and readers sharing what they love.</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 text-sm">
          {[["10K+", "Stories"], ["500+", "Fandoms"], ["50K+", "Members"]].map(([num, label]) => (
            <div key={label}>
              <p className="font-display text-xl font-bold text-primary">{num}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-7 animate-fade-up">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 lg:hidden">
            <img src={logo} alt="FictionHub" className="h-8 w-8" />
            <span className="font-display font-bold">Fiction<span className="text-primary">Hub</span></span>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue to your account</p>
          </div>

          {msg && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-400/20 flex items-center justify-center text-xs">!</span>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <input
                id="email" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 text-sm transition-all"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:glow-primary"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />Signing in…</>
              ) : (
                <><LogIn className="h-4 w-4" />Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}