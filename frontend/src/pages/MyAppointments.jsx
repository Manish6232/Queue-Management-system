import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";

const statusColors = {
  booked:     { bg: "rgba(99,102,241,0.1)",  text: "#818cf8",  label: "Booked" },
  "checked-in":{ bg: "rgba(245,158,11,0.1)", text: "#f59e0b",  label: "Checked In" },
  waiting:    { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b",  label: "Waiting" },
  serving:    { bg: "rgba(34,197,94,0.1)",   text: "#22c55e",  label: "Serving" },
  completed:  { bg: "rgba(34,197,94,0.1)",   text: "#22c55e",  label: "Completed" },
  cancelled:  { bg: "rgba(239,68,68,0.1)",   text: "#ef4444",  label: "Cancelled" },
};

const QRModal = ({ appointment, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  }} onClick={onClose}>
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "20px", padding: "32px", textAlign: "center",
      maxWidth: "320px", width: "90%",
    }} onClick={e => e.stopPropagation()}>
      <h3 style={{ color: "var(--text-primary)", margin: "0 0 8px", fontSize: "18px" }}>
        Your QR Code
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "0 0 20px" }}>
        Show this at the reception counter
      </p>
      {appointment.qrCode ? (
        <img src={appointment.qrCode} alt="QR Code" style={{ width: "200px", height: "200px", borderRadius: "12px" }} />
      ) : (
        <div style={{ width: "200px", height: "200px", background: "var(--bg-elevated)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "40px" }}>🔲</span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>QR not available</span>
        </div>
      )}
      <div style={{ marginTop: "20px", padding: "12px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
        <div style={{ fontSize: "24px", fontWeight: "800", color: "#6366f1", fontFamily: "monospace" }}>
          {appointment.mrn || `TOKEN-${String(appointment.tokenNumber).padStart(3,"0")}`}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Medical Record Number</div>
      </div>
      <button onClick={onClose} style={{ marginTop: "20px", padding: "10px 32px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
        Close
      </button>
    </div>
  </div>
);

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrAppt, setQrAppt] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/appointments/my")
      .then(r => setAppointments(r.data.data))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: "cancelled" } : a));
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const filtered = appointments.filter(a => filter === "all" || a.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      {qrAppt && <QRModal appointment={qrAppt} onClose={() => setQrAppt(null)} />}

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>My Appointments</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>{appointments.length} total appointments</p>
          </div>
          <button onClick={() => navigate("/book")}
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
            + Book New
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
          {["all","booked","waiting","serving","completed","cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: "20px", cursor: "pointer", whiteSpace: "nowrap",
                fontSize: "13px", fontWeight: filter === f ? "600" : "400",
                background: filter === f ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--bg-elevated)",
                border: `1px solid ${filter === f ? "#6366f1" : "var(--border)"}`,
                color: filter === f ? "#fff" : "var(--text-secondary)",
                textTransform: "capitalize",
              }}>
              {f === "all" ? "All" : statusColors[f]?.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
            <p style={{ color: "var(--text-primary)", fontWeight: "600", margin: "0 0 6px" }}>No appointments found</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 20px" }}>
              {filter === "all" ? "You haven't booked any appointments yet" : `No ${filter} appointments`}
            </p>
            <button onClick={() => navigate("/book")}
              style={{ padding: "10px 24px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
              Book Appointment
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map(appt => {
              const sc = statusColors[appt.status] || statusColors.booked;
              return (
                <div key={appt._id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", transition: "border-color 0.2s" }}>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      {/* Token badge */}
                      <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: "900", color: "#6366f1", fontFamily: "monospace", lineHeight: 1 }}>
                          {String(appt.tokenNumber || "?").padStart(3,"0")}
                        </div>
                        <div style={{ fontSize: "9px", color: "#818cf8", marginTop: "2px" }}>TOKEN</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>{appt.patientName}</div>
                        <div style={{ fontSize: "13px", color: "#818cf8", marginTop: "2px" }}>
                          {appt.departmentId?.name || "Department"}
                        </div>
                        {appt.doctorId && (
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                            👨‍⚕️ {appt.doctorId.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Details row */}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {[
                      { icon: "📅", text: appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A" },
                      { icon: "⏰", text: appt.appointmentTime || "N/A" },
                      { icon: "🆔", text: appt.mrn || `#${appt._id?.slice(-6)}` },
                    ].map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px" }}>{d.icon}</span>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{d.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                    <button onClick={() => setQrAppt(appt)}
                      style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                      🔲 Show QR
                    </button>
                    {appt.status === "completed" && !appt.feedback?.rating && (
                      <button onClick={() => navigate(`/feedback/${appt._id}`)}
                        style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                        ⭐ Rate Visit
                      </button>
                    )}
                    {["booked","waiting"].includes(appt.status) && (
                      <button onClick={() => handleCancel(appt._id)}
                        style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MyAppointments;