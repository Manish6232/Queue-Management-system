import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/api";
import toast from "react-hot-toast";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) return toast.error("All fields required");
    if (form.password.length < 6) return toast.error("Password min 6 characters");
    setLoading(true);
    try {
      const res = await signupUser(form);
      toast.success("OTP sent to your email!");
      navigate(`/verify-otp?userId=${res.data.userId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}>
      <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", top: "-5rem", right: "-5rem" }} />

      <div className="w-full max-w-md p-8 animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-2xl font-bold">Queue<span className="gradient-text">Pro</span></span>
          </div>
          <h2 className="text-3xl font-bold">Create account</h2>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Start managing queues smarter</p>
        </div>

        <div className="p-8 rounded-2xl border glow-purple"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>

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
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div className="space-y-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Manish Singh" },
              { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
              { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
                <input type={type} placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Account Type</label>
              <select className="w-full px-4 py-3 rounded-xl outline-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">👤 User</option>
                <option value="admin">🧑‍💼 Admin</option>
              </select>
            </div>
          </div>

          <button onClick={handleSignup} disabled={loading}
            className="w-full mt-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            {loading ? <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </span> : "Create Account →"}
          </button>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#6366f1" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;