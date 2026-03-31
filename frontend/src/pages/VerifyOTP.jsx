import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ userId });
      toast.success("OTP resent!");
      setResendTimer(60);
    } catch {
      toast.error("Failed to resend");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}>
      <div className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)", top: "10%", left: "10%" }} />

      <div className="w-full max-w-md p-8 text-center animate-slide-up relative z-10">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="text-2xl font-bold">Queue<span className="gradient-text">Pro</span></span>
        </div>

        {/* Email icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <span className="text-4xl">📧</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          We sent a 6-digit OTP to your email. Enter it below.
        </p>

        <div className="p-8 rounded-2xl border glow-purple"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, idx) => (
              <input key={idx} ref={(el) => (inputs.current[idx] = el)}
                type="text" maxLength={1}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all mono"
                style={{
                  background: "var(--bg-elevated)",
                  border: `2px solid ${digit ? "#6366f1" : "var(--border)"}`,
                  color: "var(--text-primary)",
                  boxShadow: digit ? "0 0 0 3px rgba(99,102,241,0.15)" : "none"
                }}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            {loading ? <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span> : "Verify Email ✓"}
          </button>

          <div className="mt-5">
            {resendTimer > 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Resend in <span style={{ color: "#6366f1" }}>{resendTimer}s</span>
              </p>
            ) : (
              <button onClick={handleResend} className="text-sm font-semibold" style={{ color: "#6366f1" }}>
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;