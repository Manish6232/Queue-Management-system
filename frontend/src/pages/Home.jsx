// ─── STEP 3: Replace frontend/src/pages/Home.jsx ───
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getStatus } from "../services/api";
import socket from "../socket/socket";

const features = [
  { icon: "🎟️", title: "Real-Time Tokens", desc: "Get an instant token and track your position live — no refreshing needed.", color: "#eef2ff" },
  { icon: "🏥", title: "Book Appointments", desc: "Select your department, doctor, date and time slot in under 2 minutes.", color: "#ecfeff" },
  { icon: "📺", title: "TV Queue Display", desc: "Large-screen lobby display shows the current token and next-in-line.", color: "#f0fdf4" },
  { icon: "📊", title: "Admin Analytics", desc: "Live stats: waiting count, served today, average wait time and weekly chart.", color: "#fffbeb" },
  { icon: "🔒", title: "Secure Auth", desc: "Email OTP verification and Google OAuth — safe, fast, no passwords remembered.", color: "#fdf4ff" },
  { icon: "⚡", title: "Live via WebSocket", desc: "Queue updates pushed instantly to every screen without polling.", color: "#fff7ed" },
];

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "white", border: "1px solid var(--border)",
    borderRadius: "16px", padding: "24px 20px", textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  }}>
    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>{label}</div>
  </div>
);

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [counts, setCounts] = useState({ hospital1: 0, bank1: 0, govt1: 0 });

  const fetchCounts = async () => {
    try {
      const ids = ["hospital1", "bank1", "govt1"];
      const results = await Promise.all(ids.map(id => getStatus(id)));
      setCounts({
        hospital1: results[0].data.totalPeopleInQueue,
        bank1: results[1].data.totalPeopleInQueue,
        govt1: results[2].data.totalPeopleInQueue,
      });
    } catch {}
  };

  useEffect(() => {
    fetchCounts();
    socket.on("queueUpdated", fetchCounts);
    socket.on("tokenCalled", fetchCounts);
    return () => {
      socket.off("queueUpdated", fetchCounts);
      socket.off("tokenCalled", fetchCounts);
    };
  }, []);

  const totalWaiting = counts.hospital1 + counts.bank1 + counts.govt1;

  return (
    <div className="page">
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "64px 20px 56px",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: "48px", alignItems: "center" }}
          className="hero-grid">

          <div className="animate-slide-up">
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "5px 14px", borderRadius: "100px",
              background: "white", border: "1px solid #c7d2fe",
              fontSize: "12px", fontWeight: "600", color: "var(--accent)",
              marginBottom: "20px",
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              Smart Hospital Queue Management
            </div>

            <h1 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: "800",
              fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.15,
              color: "var(--text-primary)", marginBottom: "18px",
            }}>
              Welcome back,{" "}
              <span style={{ color: "var(--accent)" }}>
                {user.name?.split(" ")[0] || "there"}
              </span>{" "}👋
            </h1>

            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "480px", lineHeight: "1.75" }}>
              Streamline patient queues, book appointments, and track your position in real time — all in one place.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/book" className="btn btn-primary btn-lg">
                📅 Book Appointment
              </Link>
              <Link to="/my-appointments" className="btn btn-outline btn-lg">
                My Appointments
              </Link>
            </div>

            {/* Live count pill */}
            <div style={{
              marginTop: "28px", display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "8px 16px", borderRadius: "100px",
              background: "white", border: "1px solid var(--border)",
              fontSize: "13px", color: "var(--text-secondary)",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#16a34a", display: "inline-block",
                boxShadow: "0 0 0 3px rgba(22,163,74,.2)",
                animation: "pulse-slow 2s ease-in-out infinite",
              }} />
              <strong style={{ color: "var(--text-primary)" }}>{totalWaiting}</strong> patients currently waiting across all queues
            </div>
          </div>

          {/* Live queue card */}
          <div style={{
            background: "white", border: "1px solid var(--border)",
            borderRadius: "20px", boxShadow: "var(--shadow-md)",
            padding: "0", overflow: "hidden", minWidth: "260px",
          }} className="hide-on-mobile animate-slide-up" styles={{ animationDelay: ".1s" }}>
            <div style={{
              background: "linear-gradient(135deg,#1a56db,#0891b2)",
              padding: "16px 20px", color: "white",
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", opacity: .85 }}>Live Queue Status</div>
              <div style={{ fontSize: "11px", opacity: .65, marginTop: "2px" }}>Real-time updates</div>
            </div>
            <div style={{ padding: "16px" }}>
              {[
                { id: "hospital1", label: "City Hospital", icon: "🏥", color: "#1a56db" },
                { id: "bank1",     label: "State Bank",   icon: "🏦", color: "#16a34a" },
                { id: "govt1",     label: "Govt Office",  icon: "🏛️", color: "#d97706" },
              ].map(q => (
                <div key={q.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", marginBottom: "8px",
                  background: "var(--bg-elevated)", borderRadius: "10px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{q.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>{q.label}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: "700", fontSize: "16px", color: q.color }}>
                      {String(counts[q.id]).padStart(2, "0")}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>waiting</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "32px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px" }}
          className="stats-grid stagger">
          <StatCard icon="🏥" label="Active Queues"     value="3"  color="var(--accent)" />
          <StatCard icon="⏱️" label="Avg Wait Today"    value="12m" color="#0891b2" />
          <StatCard icon="✅" label="Served Today"      value="84" color="#16a34a" />
          <StatCard icon="⭐" label="Satisfaction Rate" value="98%" color="#d97706" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "64px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="section-label">Features</span>
            <h2 className="section-title" style={{ marginBottom: "12px" }}>Everything you need, nothing you don't</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
              Built specifically for hospitals and clinics to reduce lobby chaos and improve patient experience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }} className="features-grid stagger">
            {features.map(({ icon, title, desc, color }) => (
              <div key={title} className="card card-hover animate-slide-up" style={{ padding: "24px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: color, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.2rem", marginBottom: "16px",
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.65" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACTIONS ── */}
      <section style={{ background: "linear-gradient(135deg,#1a56db,#0891b2)", padding: "56px 20px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "800", fontSize: "1.8rem", color: "white", marginBottom: "12px" }}>
            Ready to skip the waiting room?
          </h2>
          <p style={{ color: "rgba(255,255,255,.8)", marginBottom: "28px", fontSize: "1rem" }}>
            Book your appointment now and receive real-time token updates on your device.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/book" style={{
              padding: "13px 28px", borderRadius: "12px", background: "white",
              color: "var(--accent)", fontWeight: "700", fontSize: "15px",
              textDecoration: "none", transition: "all .2s",
            }}>
              📅 Book Appointment →
            </Link>
            <Link to="/my-appointments" style={{
              padding: "13px 28px", borderRadius: "12px",
              background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.4)",
              color: "white", fontWeight: "600", fontSize: "15px",
              textDecoration: "none", transition: "all .2s",
            }}>
              View My Appointments
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero-grid { grid-template-columns: 1fr auto; }
        .hide-on-mobile {}
        .stats-grid  { grid-template-columns: repeat(4,1fr); }
        .features-grid { grid-template-columns: repeat(3,1fr); }
        @media(max-width:860px){
          .hero-grid { grid-template-columns: 1fr; }
          .hide-on-mobile { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .features-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media(max-width:540px){
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
        }
        @keyframes pulse-slow {
          0%,100%{ opacity:1; box-shadow:0 0 0 3px rgba(22,163,74,.2); }
          50%{ opacity:.7; box-shadow:0 0 0 6px rgba(22,163,74,.1); }
        }
      `}</style>
    </div>
  );
};

export default Home;