// ─── STEP 6a: Replace frontend/src/pages/UserDashboard.jsx ───
import React, { useEffect, useState } from "react";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";

const UserDashboard = () => {
  const [tokenData, setTokenData] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tokenData"));
    if (!saved) return navigate("/");
    setTokenData(saved);

    socket.emit("joinQueueRoom", saved.queueId);
    socket.on("queueUpdated", (data) => {
      if (data.queueId === saved.queueId) {
        setTokenData(prev => prev ? { ...prev, position: data.position ?? prev.position } : prev);
      }
    });
    socket.on("tokenCalled", (data) => {
      setCurrentToken(data.tokenNumber);
      setTokenData(prev => prev ? { ...prev, position: Math.max(1, prev.position - 1), eta: Math.max(0, prev.eta - 5) } : prev);
    });
    return () => { socket.off("queueUpdated"); socket.off("tokenCalled"); };
  }, []);

  if (!tokenData) return null;

  const progress = Math.min(100, Math.max(0, 100 - ((tokenData.position - 1) / 10) * 100));
  const isNext = currentToken && tokenData.tokenNumber === (currentToken + 1);

  return (
    <div className="page">
      <Navbar />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "36px 20px" }} className="animate-slide-up">

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "500" }}>Home</Link>
          <span>›</span>
          <span>Queue Status</span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "800", fontSize: "1.6rem", color: "var(--text-primary)", marginBottom: "24px" }}>
          Your Queue Status
        </h1>

        {/* Token card */}
        <div style={{
          background: "white", border: "2px solid #c7d2fe",
          borderRadius: "20px", padding: "32px 28px", marginBottom: "16px",
          boxShadow: "0 0 0 4px rgba(26,86,219,.06), var(--shadow-md)",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          {/* Top accent bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg,#1a56db,#0891b2)" }} />

          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
            Your Token
          </p>
          <div style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: "5rem", fontWeight: "700",
            color: "var(--accent)", lineHeight: 1,
            animation: "token-flash 3s ease-in-out infinite",
          }}>
            {String(tokenData.tokenNumber).padStart(3, "0")}
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
            {[
              { label: "Position in queue", value: tokenData.position, color: "#1a56db", bg: "#eef2ff" },
              { label: "Estimated wait",     value: `${tokenData.eta}m`, color: "#0891b2", bg: "#ecfeff" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ padding: "14px 16px", borderRadius: "12px", background: bg }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: "800", color }}>{value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "3px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span>Queue progress</span>
              <span style={{ fontWeight: "600", color: "var(--accent)" }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "100px",
                background: "linear-gradient(90deg,#1a56db,#0891b2)",
                width: `${progress}%`, transition: "width .5s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Now serving alert */}
        {currentToken && (
          <div style={{
            background: isNext ? "#f0fdf4" : "#f8fafc",
            border: `1px solid ${isNext ? "#86efac" : "var(--border)"}`,
            borderRadius: "14px", padding: "16px 20px",
            display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px",
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: isNext ? "#dcfce7" : "#eef2ff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
              }}>
                🔔
              </div>
              <span style={{
                position: "absolute", top: "-3px", right: "-3px", width: "10px", height: "10px",
                borderRadius: "50%", background: "#16a34a", border: "2px solid white",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", letterSpacing: ".06em", textTransform: "uppercase" }}>Now Serving</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.6rem", fontWeight: "700", color: "var(--text-primary)" }}>
                {String(currentToken).padStart(3, "0")}
              </div>
            </div>
            {isNext && (
              <div style={{ padding: "6px 12px", borderRadius: "8px", background: "#16a34a", color: "white", fontSize: "12px", fontWeight: "700" }}>
                You're next!
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/my-appointments" className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}>
            📋 My Appointments
          </Link>
          <button onClick={() => { localStorage.removeItem("tokenData"); navigate("/"); }}
            className="btn btn-ghost" style={{ flex: 1 }}>
            Leave Queue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes token-flash { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
      `}</style>
    </div>
  );
};

export default UserDashboard;