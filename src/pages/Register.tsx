import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { Eye, EyeOff, UserPlus, BookOpen, Feather } from "lucide-react";
import logo from "@/assets/fictionhub-logo.png";

const ROLES = [
  { value: "Fan",     icon: BookOpen, label: "Fan",     desc: "I'm here to read and explore" },
  { value: "Creator", icon: Feather,  label: "Creator", desc: "I write stories and create content" },
];

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "", nationality: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.role) e.role = "Please select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);
        navigate("/categories");
      } else {
        setMsg(data.message || "Registration failed");
      }
    } catch {
      setMsg("Network error — try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type = "text",
    placeholder = "",
    optional = false
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1.5" htmlFor={id}>
        {label}
        {optional && <span className="text-xs text-muted-foreground font-normal">(optional)</span>}
      </label>
      <div className="relative">
        <input
          id={id} type={type === "password" && id === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder || label} value={form[id]}
          onChange={e => { setForm({ ...form, [id]: e.target.value }); setErrors({ ...errors, [id]: "" }); }}
          className="w-full px-4 py-2.5 pr-10 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 text-sm transition-all"
        />
        {id === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {errors[id] && <p className="text-xs text-red-400">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-7 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="FictionHub" className="h-8 w-8" />
          <span className="font-display font-bold">Fiction<span className="text-primary">Hub</span></span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm">Join the community in seconds</p>
        </div>

        {msg && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("username", "Username", "text", "Choose a username")}
          {field("email", "Email", "email", "you@example.com")}
          {field("password", "Password", "password", "Min. 6 characters")}

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setForm({ ...form, role: value }); setErrors({ ...errors, role: "" }); }}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left ${
                    form.role === value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-secondary hover:border-primary/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.role === value ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${form.role === value ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-400">{errors.role}</p>}
          </div>

          {field("nationality", "Nationality", "text", "Your country", true)}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 hover:glow-primary"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />Creating account…</>
            ) : (
              <><UserPlus className="h-4 w-4" />Create Account</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}