// ─── STEP 8a: Replace frontend/src/pages/VerifyOTP.jsx ───
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { verifyOTP, resendOTP } from "../services/api";
import toast from "react-hot-toast";
 
const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const userId = params.get("userId");
 
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);
 
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);
 
  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };
 
  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };
 
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter complete 6-digit OTP");
    setLoading(true);
    try {
      const res = await verifyOTP({ userId, otp: code });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Email verified! Welcome 🎉");
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };
 
  const handleResend = async () => {
    try {
      await resendOTP({ userId });
      toast.success("OTP resent!");
      setResendTimer(60);
    } catch { toast.error("Failed to resend"); }
  };
 
  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg,#f8fafc 0%,#eef2ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans',sans-serif", padding: "24px",
    }}>
      <div style={{ position: "fixed", top: "-80px", left: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle,rgba(26,86,219,.07),transparent 70%)", pointerEvents: "none" }} />
 
      <div style={{ width: "100%", maxWidth: "400px" }} className="animate-slide-up">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#1a56db,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
              Queue<span style={{ color: "var(--accent)" }}>Pro</span>
            </span>
          </Link>
        </div>
 
        {/* Card */}
        <div style={{
          background: "white", border: "1px solid var(--border)",
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "var(--shadow-md)", padding: "32px",
          textAlign: "center",
        }}>
          {/* Email icon */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "var(--accent-light)", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 20px", fontSize: "1.8rem",
          }}>
            📧
          </div>
 
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "800", fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "8px" }}>
            Check your email
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "28px", lineHeight: "1.6" }}>
            We sent a 6-digit verification code to your email. Enter it below to continue.
          </p>
 
          {/* OTP boxes */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputs.current[idx] = el}
                type="text" maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                style={{
                  width: "46px", height: "54px",
                  textAlign: "center", fontSize: "1.4rem", fontWeight: "700",
                  fontFamily: "'JetBrains Mono',monospace",
                  borderRadius: "12px", border: `2px solid ${digit ? "var(--accent)" : "var(--border)"}`,
                  background: digit ? "#eef2ff" : "var(--bg-elevated)",
                  color: "var(--text-primary)", outline: "none",
                  transition: "all .15s",
                  boxShadow: digit ? "0 0 0 3px rgba(26,86,219,.1)" : "none",
                }}
              />
            ))}
          </div>
 
          {/* Verify button */}
          <button onClick={handleVerify} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "13px", borderRadius: "12px", fontSize: "15px" }}>
            {loading ? <><span className="spinner" style={{ width: "15px", height: "15px" }} /> Verifying...</> : "Verify Email ✓"}
          </button>
 
          {/* Resend */}
          <div style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-secondary)" }}>
            {resendTimer > 0 ? (
              <>Resend code in <span style={{ color: "var(--accent)", fontWeight: "600" }}>{resendTimer}s</span></>
            ) : (
              <>Didn't receive it?{" "}
                <button onClick={handleResend} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: "600", fontSize: "13px" }}>
                  Resend OTP
                </button>
              </>
            )}
          </div>
        </div>
 
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: "500", textDecoration: "none" }}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};
 
export default VerifyOTP;