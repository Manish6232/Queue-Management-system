// ─── STEP 5: Replace frontend/src/pages/AdminDashboard.jsx ───
import React, { useState, useEffect } from "react";
import { callNext, getAdminAnalytics } from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../socket/socket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const QUEUE_ID = "hospital1";

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: "white", border: "1px solid var(--border)",
    borderRadius: "16px", padding: "22px 20px",
    boxShadow: "var(--shadow-sm)",
    transition: "box-shadow .2s, transform .2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
        {icon}
      </div>
      <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 9px", borderRadius: "100px", background: bg, color }}>
        LIVE
      </span>
    </div>
    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "5px" }}>{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getAdminAnalytics(QUEUE_ID);
      setAnalytics(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    socket.on("queueUpdated", fetchData);
    socket.on("tokenCalled", fetchData);
    return () => {
      socket.off("queueUpdated", fetchData);
      socket.off("tokenCalled", fetchData);
    };
  }, []);

  const handleNext = async () => {
    setLoading(true);
    try {
      const res = await callNext({ queueId: QUEUE_ID });
      if (res.data.tokenNumber) {
        toast.success(`Token #${res.data.tokenNumber} called!`);
      } else {
        toast("Queue is empty", { icon: "ℹ️" });
      }
      fetchData();
    } catch {
      toast.error("Failed to call next");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-inner-wide animate-slide-up">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="section-label">Admin Panel</span>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
              Queue Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>City Hospital — Real-time queue control</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link to="/admin/checkin" className="btn btn-ghost">
              🔍 Check-In Patient
            </Link>
            <Link to="/admin/departments" className="btn btn-outline">
              🏥 Departments
            </Link>
            <button onClick={handleNext} disabled={loading} className="btn btn-primary btn-lg">
              {loading ? <><span className="spinner" style={{ width: "15px", height: "15px" }} /> Calling...</> : "📢 Call Next Token"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {!analytics && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px" }}>
            <span className="spinner spinner-dark" />
            <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading analytics...</span>
          </div>
        )}

        {analytics && (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }} className="stats-grid stagger">
              <StatCard icon="⏳" label="Currently Waiting" value={analytics.currentWaiting} color="#1a56db" bg="#eef2ff" />
              <StatCard icon="✅" label="Served Today"      value={analytics.servedToday}    color="#16a34a" bg="#f0fdf4" />
              <StatCard icon="🏆" label="Total Served"      value={analytics.totalServed}    color="#d97706" bg="#fffbeb" />
              <StatCard icon="⏱️" label="Avg Wait (min)"    value={analytics.avgWaitTime}    color="#0891b2" bg="#ecfeff" />
            </div>

            {/* Chart + Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }} className="chart-grid">

              {/* Bar chart */}
              <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginBottom: "20px" }}>
                  Tokens Served — Last 7 Days
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.weekData} barSize={28}>
                    <XAxis dataKey="date" stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "13px" }}
                      cursor={{ fill: "rgba(26,86,219,.04)" }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {analytics.weekData.map((_, i) => (
                        <Cell key={i} fill={i === analytics.weekData.length - 1 ? "#1a56db" : "#e2e8f0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Quick links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "700", fontSize: "14px", color: "var(--text-primary)", marginBottom: "14px" }}>
                    Quick Actions
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { to: "/admin/checkin",    icon: "🔍", label: "Patient Check-In",   desc: "Scan MRN or token" },
                      { to: "/admin/departments",icon: "🏥", label: "Manage Departments", desc: "Doctors & departments" },
                      { to: "/queue-display",    icon: "📺", label: "TV Queue Display",   desc: "Open lobby screen" },
                    ].map(({ to, icon, label, desc }) => (
                      <Link key={to} to={to} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px", borderRadius: "10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        textDecoration: "none", transition: "all .15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.background = "#eef2ff"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{label}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Queue status pill */}
                <div style={{ background: analytics.currentWaiting > 0 ? "#f0fdf4" : "var(--bg-elevated)", border: `1px solid ${analytics.currentWaiting > 0 ? "#bbf7d0" : "var(--border)"}`, borderRadius: "16px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "800", fontFamily: "'Syne',sans-serif", color: analytics.currentWaiting > 0 ? "#16a34a" : "var(--text-muted)" }}>
                    {analytics.currentWaiting > 0 ? "🟢 Active" : "⚪ Empty"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Queue Status</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .stats-grid { grid-template-columns: repeat(4,1fr); }
        .chart-grid { grid-template-columns: 2fr 1fr; }
        @media(max-width:860px){
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .chart-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:480px){
          .stats-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;