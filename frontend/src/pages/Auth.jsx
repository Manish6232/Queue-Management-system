import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, signupUser } from "../services/api";
import toast from "react-hot-toast";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3L6 33.7C9.4 39.7 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.2 5.2C40.6 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const Auth = () => {
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px",
    }}>
      {/* Background blobs */}
      <div style={{
        position: "fixed", top: "-120px", left: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-120px", right: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", fontWeight: "800", color: "#fff",
            }}>Q</div>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
              Queue<span style={{ color: "#818cf8" }}>Pro</span>
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(99,102,241,0.08)",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            padding: "6px 6px 0",
            background: "var(--bg-elevated)",
          }}>
            {["login", "signup"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: "10px 10px 0 0",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: tab === t ? "600" : "400",
                transition: "all 0.2s",
                background: tab === t ? "var(--bg-card)" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: tab === t ? "none" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}>
                {t === "login" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
                {t === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div style={{ padding: "28px 28px 24px" }}>
            {tab === "login" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Google */}
                <a href="http://localhost:5001/api/auth/google" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "10px", padding: "11px 16px", borderRadius: "12px",
                  border: "1px solid var(--border)", background: "var(--bg-elevated)",
                  color: "var(--text-primary)", textDecoration: "none",
                  fontSize: "14px", fontWeight: "500", cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <GoogleIcon /> Continue with Google
                </a>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>OR</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    Email address
                  </label>
                  <input type="email" placeholder="Enter your email address"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: "10px",
                      border: "1px solid var(--border)", background: "var(--bg-elevated)",
                      color: "var(--text-primary)", fontSize: "14px",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}>Password</label>
                    <span style={{ fontSize: "12px", color: "#818cf8", cursor: "pointer" }}>Forgot password?</span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      style={{
                        width: "100%", padding: "11px 40px 11px 14px", borderRadius: "10px",
                        border: "1px solid var(--border)", background: "var(--bg-elevated)",
                        color: "var(--text-primary)", fontSize: "14px",
                        outline: "none", boxSizing: "border-box",
                      }}
                    />
                    <button onClick={() => setShowPass(!showPass)} style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-secondary)", display: "flex", alignItems: "center",
                    }}>
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button onClick={handleLogin} disabled={loading} style={{
                  width: "100%", padding: "13px",
                  background: loading ? "var(--bg-elevated)" : "#1a1a2e",
                  color: "#fff", border: "none", borderRadius: "12px",
                  fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s",
                }}>
                  {loading ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Signing in...
                    </>
                  ) : "Log In"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Google */}
                <a href="http://localhost:5001/api/auth/google" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "10px", padding: "11px 16px", borderRadius: "12px",
                  border: "1px solid var(--border)", background: "var(--bg-elevated)",
                  color: "var(--text-primary)", textDecoration: "none",
                  fontSize: "14px", fontWeight: "500", cursor: "pointer",
                }}>
                  <GoogleIcon /> Continue with Google
                </a>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>OR</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>

                {/* Email first for signup */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Email address</label>
                  <input type="email" placeholder="Enter your email address"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: "10px",
                      border: "1px solid var(--border)", background: "var(--bg-elevated)",
                      color: "var(--text-primary)", fontSize: "14px",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirmPass ? "text" : "password"} placeholder="Min 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      style={{
                        width: "100%", padding: "11px 40px 11px 14px", borderRadius: "10px",
                        border: "1px solid var(--border)", background: "var(--bg-elevated)",
                        color: "var(--text-primary)", fontSize: "14px",
                        outline: "none", boxSizing: "border-box",
                      }}
                    />
                    <button onClick={() => setShowConfirmPass(!showConfirmPass)} style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-secondary)", display: "flex", alignItems: "center",
                    }}>
                      <EyeIcon open={showConfirmPass} />
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Full Name</label>
                  <input type="text" placeholder="Your full name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: "10px",
                      border: "1px solid var(--border)", background: "var(--bg-elevated)",
                      color: "var(--text-primary)", fontSize: "14px",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Account type</label>
                  <select value={signupForm.role} onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })} style={{
                    width: "100%", padding: "11px 14px", borderRadius: "10px",
                    border: "1px solid var(--border)", background: "var(--bg-elevated)",
                    color: "var(--text-primary)", fontSize: "14px",
                    outline: "none", boxSizing: "border-box", cursor: "pointer",
                  }}>
                    <option value="user">User — Join queues</option>
                    <option value="admin">Admin — Manage queues</option>
                  </select>
                </div>

                {/* Signup Button */}
                <button onClick={handleSignup} disabled={loading} style={{
                  width: "100%", padding: "13px",
                  background: loading ? "var(--bg-elevated)" : "#1a1a2e",
                  color: "#fff", border: "none", borderRadius: "12px",
                  fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s",
                }}>
                  {loading ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Creating account...
                    </>
                  ) : "Create an account"}
                </button>

                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0", lineHeight: "1.6" }}>
                  <input type="checkbox" style={{ marginRight: "6px", accentColor: "#6366f1" }} />
                  Keep me updated with queue tips, new features and announcements.
                </p>
              </div>
            )}
          </div>

          {/* Card footer */}
          <div style={{
            borderTop: "1px solid var(--border)",
            padding: "16px 28px",
            textAlign: "center",
            background: "var(--bg-elevated)",
          }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {tab === "login" ? "Don't have an account yet? " : "Already have an account? "}
            </span>
            <button onClick={() => setTab(tab === "login" ? "signup" : "login")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "600", color: "#818cf8", textDecoration: "underline",
            }}>
              {tab === "login" ? "Sign up" : "Login"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-secondary); opacity: 0.7; }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
        a:hover { opacity: 0.85; }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};

export default Auth;