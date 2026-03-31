import React, { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";

const CheckIn = () => {
  const [mode, setMode] = useState("manual"); // "manual" or "mrn"
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return toast.error("Enter MRN or token number");
    setLoading(true);
    setResult(null);
    setCheckedIn(false);
    try {
      const res = await API.get(`/appointments/search?q=${input.trim()}`);
      if (res.data.data) {
        setResult(res.data.data);
      } else {
        toast.error("No appointment found");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Not found");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!result) return;
    setLoading(true);
    try {
      await API.post("/appointments/checkin", { appointmentId: result._id });
      setCheckedIn(true);
      setResult(prev => ({ ...prev, status: "waiting" }));
      toast.success(`✅ Token ${result.tokenNumber} checked in!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      booked: { bg: "rgba(99,102,241,0.1)", color: "#818cf8", label: "Booked" },
      waiting: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Waiting" },
      serving: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Serving" },
      completed: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Completed" },
      cancelled: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Cancelled" },
    };
    const s = map[status] || map.booked;
    return <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: s.bg, color: s.color }}>{s.label}</span>;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Patient Check-In</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>Search by MRN number or token number</p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "var(--bg-elevated)", borderRadius: "12px", padding: "6px" }}>
          {[
            { key: "manual", label: "🔍 Search by MRN/Token" },
            { key: "mrn", label: "📋 Enter MRN" },
          ].map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); setInput(""); setResult(null); setCheckedIn(false); }}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
                background: mode === m.key ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                border: "none", color: mode === m.key ? "#fff" : "var(--text-secondary)",
                fontSize: "14px", fontWeight: mode === m.key ? "600" : "400", transition: "all 0.2s",
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Search card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px", marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "8px" }}>
            {mode === "manual" ? "MRN Number / Token Number" : "Medical Record Number (MRN)"}
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              placeholder={mode === "manual" ? "e.g. MRN-00001 or 42" : "e.g. MRN-00001"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--bg-elevated)",
                color: "var(--text-primary)", fontSize: "15px", outline: "none",
                fontFamily: "monospace", letterSpacing: "1px",
              }}
            />
            <button onClick={handleSearch} disabled={loading}
              style={{
                padding: "12px 24px", borderRadius: "10px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none", color: "#fff", cursor: "pointer",
                fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px",
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : "Search"}
            </button>
          </div>
        </div>

        {/* Result card */}
        {result && (
          <div style={{
            background: "var(--bg-card)", border: `1px solid ${checkedIn ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
            borderRadius: "20px", padding: "28px",
            boxShadow: checkedIn ? "0 0 30px rgba(34,197,94,0.1)" : "none",
            transition: "all 0.3s",
          }}>
            {/* Patient card */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", fontWeight: "700", color: "#fff",
                }}>
                  {result.patientName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>{result.patientName}</div>
                  <div style={{ fontSize: "13px", color: "#818cf8", marginTop: "2px" }}>
                    {result.departmentId?.name || "Department"}
                  </div>
                </div>
              </div>
              {statusBadge(result.status)}
            </div>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Token Number", value: String(result.tokenNumber || "?").padStart(3, "0"), mono: true, color: "#6366f1" },
                { label: "MRN", value: result.mrn || "N/A", mono: true },
                { label: "Appointment Date", value: result.appointmentDate ? new Date(result.appointmentDate).toLocaleDateString("en-IN") : "Today" },
                { label: "Time Slot", value: result.appointmentTime || "Walk-in" },
                { label: "Doctor", value: result.doctorId?.name || "Any Available" },
                { label: "Phone", value: result.patientPhone || "N/A" },
              ].map(d => (
                <div key={d.label} style={{ padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>{d.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: d.color || "var(--text-primary)", fontFamily: d.mono ? "monospace" : "inherit" }}>
                    {d.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {result.notes && (
              <div style={{ padding: "12px 14px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#f59e0b", marginBottom: "4px", fontWeight: "600" }}>📝 Patient Notes</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{result.notes}</div>
              </div>
            )}

            {/* Check-in button */}
            {checkedIn ? (
              <div style={{ padding: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "6px" }}>✅</div>
                <div style={{ fontWeight: "700", color: "#22c55e", fontSize: "16px" }}>Checked In Successfully!</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                  Token {String(result.tokenNumber).padStart(3,"0")} is now in the waiting queue
                </div>
              </div>
            ) : (
              <button onClick={handleCheckIn} disabled={loading || result.status === "completed" || result.status === "cancelled"}
                style={{
                  width: "100%", padding: "14px",
                  background: result.status === "completed" || result.status === "cancelled"
                    ? "var(--bg-elevated)" : "linear-gradient(135deg,#22c55e,#16a34a)",
                  border: "none", borderRadius: "12px", color: "#fff",
                  fontSize: "16px", fontWeight: "700", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading
                  ? <><div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Processing...</>
                  : result.status === "completed" ? "Already Completed"
                  : result.status === "cancelled" ? "Appointment Cancelled"
                  : result.status === "waiting" || result.status === "checked-in" ? "Already Checked In"
                  : "✓ Check In Patient"}
              </button>
            )}
          </div>
        )}

        {/* Help text */}
        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", fontSize: "14px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
            Search for a patient using their MRN number (e.g. MRN-00001) or token number
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CheckIn;