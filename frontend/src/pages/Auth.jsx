// ─── STEP 4: Replace frontend/src/pages/Auth.jsx ───
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../services/api";
import toast from "react-hot-toast";

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3L6 33.7C9.4 39.7 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.2 5.2C40.6 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, onKeyDown, rightEl }) => (
  <div>
    <label className="field-label">{label}</label>
    <div style={{ position: "relative" }}>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} onKeyDown={onKeyDown}
        className="field-input"
        style={{ paddingRight: rightEl ? "40px" : "14px" }}
      />
      {rightEl && (
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
          {rightEl}
        </div>
      )}
    </div>
  </div>
);

const Auth = () => {
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [loginForm, setLoginForm]   = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) return toast.error("Fill all fields");
    setLoading(true);
    try {
      const res = await loginUser(loginForm);
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
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!signupForm.name || !signupForm.email || !signupForm.password) return toast.error("All fields required");
    if (signupForm.password.length < 6) return toast.error("Password min 6 characters");
    setLoading(true);
    try {
      const res = await signupUser(signupForm);
      toast.success("OTP sent to your email!");
      navigate(`/verify-otp?userId=${res.data.userId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg,#f8fafc 0%,#eef2ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans',sans-serif", padding: "24px",
    }}>
      {/* Background decoration */}
      <div style={{ position: "fixed", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(26,86,219,.07),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(8,145,178,.07),transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }} className="animate-slide-up">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg,#1a56db,#0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              Queue<span style={{ color: "var(--accent)" }}>Pro</span>
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Hospital Queue Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: "white", border: "1px solid var(--border)",
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,.04), 0 20px 50px rgba(26,86,219,.08)",
        }}>

          {/* Tabs */}
          <div style={{
            display: "flex", background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)", padding: "6px 6px 0",
          }}>
            {["login", "signup"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer",
                borderRadius: "10px 10px 0 0", fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px", fontWeight: tab === t ? 600 : 400,
                background: tab === t ? "white" : "transparent",
                color: tab === t ? "var(--accent)" : "var(--text-secondary)",
                transition: "all .15s",
                borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              }}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ padding: "24px" }}>
            {/* Google OAuth */}
            <a href="http://localhost:5001/api/auth/google" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", padding: "11px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "var(--bg-elevated)",
              color: "var(--text-primary)", textDecoration: "none",
              fontSize: "14px", fontWeight: "500", marginBottom: "18px",
              transition: "all .15s",
            }}>
              <GoogleIcon /> Continue with Google
            </a>

            <div className="divider" style={{ marginBottom: "18px" }}>or with email</div>

            {tab === "login" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <InputField label="Email address" type="email" value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="you@hospital.com"
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <InputField label="Password" type={showPass ? "text" : "password"} value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  rightEl={
                    <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      <EyeIcon open={showPass} />
                    </button>
                  }
                />

                <button onClick={handleLogin} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "13px", borderRadius: "12px", fontSize: "15px", marginTop: "4px" }}>
                  {loading ? <><span className="spinner" style={{ width: "15px", height: "15px" }} /> Signing in...</> : "Sign In →"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <InputField label="Full name" value={signupForm.name}
                  onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                  placeholder="Dr. Manish Singh"
                />
                <InputField label="Email address" type="email" value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="you@hospital.com"
                />
                <InputField label="Password" type={showPass ? "text" : "password"} value={signupForm.password}
                  onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  rightEl={
                    <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      <EyeIcon open={showPass} />
                    </button>
                  }
                />
                <div>
                  <label className="field-label">Account type</label>
                  <select value={signupForm.role} onChange={e => setSignupForm({ ...signupForm, role: e.target.value })} className="field-input" style={{ cursor: "pointer" }}>
                    <option value="user">👤 Patient — Book & track appointments</option>
                    <option value="admin">🧑‍⚕️ Admin — Manage queues & departments</option>
                  </select>
                </div>

                <button onClick={handleSignup} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "13px", borderRadius: "12px", fontSize: "15px", marginTop: "4px" }}>
                  {loading ? <><span className="spinner" style={{ width: "15px", height: "15px" }} /> Creating account...</> : "Create Account →"}
                </button>
              </div>
            )}
          </div>

          {/* Card footer */}
          <div style={{
            borderTop: "1px solid var(--border)", padding: "14px 24px",
            textAlign: "center", background: "var(--bg-elevated)",
            fontSize: "13px", color: "var(--text-secondary)",
          }}>
            {tab === "login" ? "Don't have an account? " : "Already registered? "}
            <button onClick={() => setTab(tab === "login" ? "signup" : "login")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--accent)", fontWeight: "600", fontSize: "13px",
            }}>
              {tab === "login" ? "Sign up free" : "Sign in"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
          By continuing, you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;