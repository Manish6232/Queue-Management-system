import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.email || !form.password) return toast.error("Fill all fields");
    setLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast.error("Please verify your email first");
        navigate(`/verify-otp?userId=${data.userId}`);
      } else {
        toast.error(data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}>
      {/* Background orbs */}
      <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)", top: "-5rem", left: "-5rem" }} />
      <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", bottom: "-5rem", right: "-5rem" }} />

      <div className="w-full max-w-md p-8 animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-2xl font-bold">Queue<span className="gradient-text">Pro</span></span>
          </div>
          <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h2>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border glow-purple"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>

          {/* Google OAuth */}
          <a href="http://localhost:5001/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all hover:opacity-90 mb-6"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3L6 33.7C9.4 39.7 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.2 5.2C40.6 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input type="email" placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", focusRingColor: "#6366f1" }}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
              <input type="password" placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full mt-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            {loading ? <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span> : "Sign In"}
          </button>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold" style={{ color: "#6366f1" }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;