// ─── STEP 7: Replace frontend/src/pages/MyAppointments.jsx ───
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";

const statusMap = {
  booked:      { label: "Booked",     cls: "badge-blue" },
  "checked-in":{ label: "Checked In", cls: "badge-amber" },
  waiting:     { label: "Waiting",    cls: "badge-amber" },
  serving:     { label: "In Progress",cls: "badge-teal" },
  completed:   { label: "Completed",  cls: "badge-green" },
  cancelled:   { label: "Cancelled",  cls: "badge-red" },
};

const QRModal = ({ appointment, onClose }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
    <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "320px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "700", fontSize: "18px", marginBottom: "6px", color: "var(--text-primary)" }}>Your QR Code</h3>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Show this at the reception counter</p>
      {appointment.qrCode ? (
        <img src={appointment.qrCode} alt="QR" style={{ width: "180px", height: "180px", borderRadius: "12px", border: "1px solid var(--border)" }} />
      ) : (
        <div style={{ width: "180px", height: "180px", background: "var(--bg-elevated)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto", gap: "8px" }}>
          <span style={{ fontSize: "2.5rem" }}>🔲</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>QR not available</span>
        </div>
      )}
      <div style={{ marginTop: "18px", padding: "12px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: "700", fontSize: "1.4rem", color: "var(--accent)" }}>
          {appointment.mrn || `TOKEN-${String(appointment.tokenNumber || 0).padStart(3, "0")}`}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>Medical Record Number</div>
      </div>
      <button onClick={onClose} className="btn btn-primary" style={{ marginTop: "20px", width: "100%" }}>Close</button>
    </div>
  </div>
);

const ApptCard = ({ appt, onCancel, onQR, onFeedback }) => {
  const s = statusMap[appt.status] || statusMap.booked;
  return (
    <div style={{
      background: "white", border: "1px solid var(--border)",
      borderRadius: "16px", padding: "20px 22px",
      boxShadow: "var(--shadow-sm)", transition: "box-shadow .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'JetBrains Mono',monospace", fontWeight: "700", fontSize: "13px", color: "var(--accent)",
          }}>
            #{String(appt.tokenNumber || "—").padStart(3, "0")}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "15px", color: "var(--text-primary)" }}>{appt.patientName}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {appt.department?.name || "Department"} {appt.doctor && `· Dr. ${appt.doctor.name}`}
            </div>
          </div>
        </div>
        <span className={`badge ${s.cls}`}>{s.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {[
          { icon: "📅", label: "Date", value: appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
          { icon: "🕐", label: "Time", value: appt.appointmentTime || "—" },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{icon} {label}</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={() => onQR(appt)} className="btn btn-ghost btn-sm">🔲 QR Code</button>
        {appt.status === "completed" && !appt.feedback && (
          <button onClick={() => onFeedback(appt._id)} className="btn btn-sm" style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>⭐ Leave Feedback</button>
        )}
        {["booked"].includes(appt.status) && (
          <button onClick={() => onCancel(appt._id)} className="btn btn-danger btn-sm">Cancel</button>
        )}
      </div>
    </div>
  );
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrAppt, setQrAppt] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/appointments/my")
      .then(r => setAppointments(r.data.data || []))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled");
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: "cancelled" } : a));
    } catch { toast.error("Failed to cancel"); }
  };

  const filters = ["all", "booked", "waiting", "completed", "cancelled"];
  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="page">
      <Navbar />
      <div className="page-inner animate-slide-up">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="section-label">Your History</span>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "800", fontSize: "1.8rem", color: "var(--text-primary)", margin: 0 }}>My Appointments</h1>
          </div>
          <Link to="/book" className="btn btn-primary">📅 Book New</Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", padding: "6px", background: "white", borderRadius: "12px", border: "1px solid var(--border)" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "500", fontFamily: "'DM Sans',sans-serif",
              background: filter === f ? "var(--accent)" : "transparent",
              color: filter === f ? "white" : "var(--text-secondary)",
              transition: "all .15s",
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && <span style={{ marginLeft: "5px", fontSize: "11px", opacity: .8 }}>({appointments.filter(a => a.status === f).length})</span>}
              {f === "all" && <span style={{ marginLeft: "5px", fontSize: "11px", opacity: .8 }}>({appointments.length})</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", gap: "12px" }}>
            <span className="spinner spinner-dark" />
            <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading appointments...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📋</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
              {filter === "all" ? "No appointments yet" : `No ${filter} appointments`}
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              Book your first appointment to get started.
            </p>
            <Link to="/book" className="btn btn-primary">Book Appointment →</Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map(appt => (
            <ApptCard
              key={appt._id} appt={appt}
              onCancel={handleCancel}
              onQR={setQrAppt}
              onFeedback={id => navigate(`/feedback/${id}`)}
            />
          ))}
        </div>
      </div>

      {qrAppt && <QRModal appointment={qrAppt} onClose={() => setQrAppt(null)} />}
    </div>
  );
};

export default MyAppointments;