import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import API from "../services/api";

const timeSlots = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM",
];

const BookAppointment = () => {
  const [step, setStep] = useState(1); // 1=Dept, 2=Doctor, 3=Slot, 4=Details
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [form, setForm] = useState({ patientName: "", patientPhone: "", patientEmail: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const deptIcons = {
    "OPD": "🏥", "CARD": "❤️", "ORTH": "🦴",
    "LAB": "🔬", "RAD": "☢️", "PHAR": "💊",
  };

  useEffect(() => {
    API.get("/departments").then(r => setDepartments(r.data.data)).catch(() => {});
    // Pre-fill user info
    setForm(f => ({ ...f, patientName: user.name || "", patientEmail: user.email || "" }));
  }, []);

  useEffect(() => {
    if (selectedDept) {
      API.get(`/departments/${selectedDept._id}/doctors`)
        .then(r => setDoctors(r.data.data)).catch(() => {});
    }
  }, [selectedDept]);

  const handleBook = async () => {
    if (!form.patientName || !form.patientPhone) return toast.error("Name and phone required");
    setLoading(true);
    try {
      const res = await API.post("/appointments/book", {
        ...form,
        userId: user.id,
        departmentId: selectedDept._id,
        doctorId: selectedDoctor?._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
      });
      toast.success("Appointment booked!");
      navigate("/my-appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Book Appointment
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
            Schedule your visit in 4 easy steps
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
          {["Department","Doctor","Date & Time","Details"].map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "700",
                  background: step > i + 1 ? "#22c55e" : step === i + 1 ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--bg-elevated)",
                  color: step >= i + 1 ? "#fff" : "var(--text-secondary)",
                  border: step === i + 1 ? "none" : "1px solid var(--border)",
                  transition: "all 0.3s",
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "11px", marginTop: "6px", color: step === i + 1 ? "#818cf8" : "var(--text-secondary)" }}>
                  {s}
                </span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: "2px", background: step > i + 1 ? "#22c55e" : "var(--border)", maxWidth: "40px", transition: "all 0.3s" }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px" }}>

          {/* STEP 1 — Department */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginTop: 0, marginBottom: "20px" }}>
                Select Department
              </h2>
              {departments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  Loading departments...
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {departments.map(dept => (
                    <button key={dept._id} onClick={() => { setSelectedDept(dept); setStep(2); }}
                      style={{
                        padding: "20px", borderRadius: "14px", textAlign: "left", cursor: "pointer",
                        background: selectedDept?._id === dept._id ? "rgba(99,102,241,0.1)" : "var(--bg-elevated)",
                        border: `1px solid ${selectedDept?._id === dept._id ? "#6366f1" : "var(--border)"}`,
                        transition: "all 0.2s",
                      }}>
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                        {deptIcons[dept.code] || "🏥"}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                        {dept.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {dept.description}
                      </div>
                      <div style={{ fontSize: "11px", color: "#818cf8", marginTop: "8px" }}>
                        ~{dept.avgServiceTime} min/patient
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Doctor */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginTop: 0, marginBottom: "6px" }}>
                Select Doctor
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                {selectedDept?.name}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Walk-in option */}
                <button onClick={() => { setSelectedDoctor(null); setStep(3); }}
                  style={{
                    padding: "16px 20px", borderRadius: "14px", textAlign: "left", cursor: "pointer",
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: "16px",
                  }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    🚶
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Any Available Doctor</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Walk-in — first available</div>
                  </div>
                </button>

                {doctors.map(doc => (
                  <button key={doc._id} onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                    style={{
                      padding: "16px 20px", borderRadius: "14px", textAlign: "left", cursor: "pointer",
                      background: "var(--bg-elevated)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: "16px", transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", fontWeight: "700", color: "#fff", flexShrink: 0,
                    }}>
                      {doc.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{doc.name}</div>
                      <div style={{ fontSize: "12px", color: "#818cf8", marginTop: "2px" }}>{doc.specialization}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Available: {doc.availableDays?.join(", ")}
                      </div>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "18px" }}>›</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: "20px", background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: "14px" }}>
                ← Back
              </button>
            </div>
          )}

          {/* STEP 3 — Date & Time */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginTop: 0, marginBottom: "6px" }}>
                Select Date & Time
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                {selectedDept?.name} {selectedDoctor ? `• ${selectedDoctor.name}` : "• Any Doctor"}
              </p>

              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Appointment Date
              </label>
              <input type="date" min={today} value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: "10px",
                  border: "1px solid var(--border)", background: "var(--bg-elevated)",
                  color: "var(--text-primary)", fontSize: "14px", outline: "none",
                  boxSizing: "border-box", marginBottom: "20px",
                }}
              />

              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Time Slot
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {timeSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "10px", borderRadius: "10px", cursor: "pointer",
                      fontSize: "13px", fontWeight: "500",
                      background: selectedSlot === slot ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--bg-elevated)",
                      border: `1px solid ${selectedSlot === slot ? "#6366f1" : "var(--border)"}`,
                      color: selectedSlot === slot ? "#fff" : "var(--text-primary)",
                      transition: "all 0.2s",
                    }}>
                    {slot}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px" }}>
                  ← Back
                </button>
                <button onClick={() => { if (!selectedDate || !selectedSlot) return toast.error("Select date and time"); setStep(4); }}
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Patient Details */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginTop: 0, marginBottom: "6px" }}>
                Patient Details
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                {selectedDept?.name} • {selectedSlot} • {selectedDate}
              </p>

              {/* Summary box */}
              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginBottom: "6px" }}>Booking Summary</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  📍 {selectedDept?.name}<br />
                  👨‍⚕️ {selectedDoctor?.name || "Any Available Doctor"}<br />
                  📅 {selectedDate} at {selectedSlot}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Patient Full Name *", key: "patientName", type: "text", placeholder: "Enter full name" },
                  { label: "Phone Number *", key: "patientPhone", type: "tel", placeholder: "+91 98765 43210" },
                  { label: "Email Address", key: "patientEmail", type: "email", placeholder: "optional" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>Additional Notes</label>
                  <textarea placeholder="Describe your symptoms (optional)" rows={3} value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: "13px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px" }}>
                  ← Back
                </button>
                <button onClick={handleBook} disabled={loading}
                  style={{ flex: 2, padding: "13px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {loading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Booking...</> : "✅ Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BookAppointment;