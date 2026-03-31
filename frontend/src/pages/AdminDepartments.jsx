import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";

const deptIcons = { "OPD":"🏥","CARD":"❤️","ORTH":"🦴","LAB":"🔬","RAD":"☢️","PHAR":"💊" };

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px", width: "90%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "20px" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const AdminDepartments = () => {
  const [tab, setTab] = useState("departments"); // departments | doctors | appointments
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "", avgServiceTime: 5 });
  const [doctorForm, setDoctorForm] = useState({ name: "", specialization: "", departmentId: "", availableDays: [] });
  const [saving, setSaving] = useState(false);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const load = async () => {
    setLoading(true);
    try {
      const [d, appt] = await Promise.all([
        API.get("/departments"),
        API.get("/appointments/all"),
      ]);
      setDepartments(d.data.data || []);
      setAppointments(appt.data.data || []);

      // Load doctors for all depts
      const allDocs = await Promise.all(
        (d.data.data || []).map(dept => API.get(`/departments/${dept._id}/doctors`))
      );
      setDoctors(allDocs.flatMap(r => r.data.data || []));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveDept = async () => {
    if (!deptForm.name || !deptForm.code) return toast.error("Name and code required");
    setSaving(true);
    try {
      await API.post("/departments", deptForm);
      toast.success("Department created!");
      setShowDeptModal(false);
      setDeptForm({ name: "", code: "", description: "", avgServiceTime: 5 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const saveDoctor = async () => {
    if (!doctorForm.name || !doctorForm.departmentId) return toast.error("Name and department required");
    setSaving(true);
    try {
      await API.post("/departments/doctors", doctorForm);
      toast.success("Doctor added!");
      setShowDoctorModal(false);
      setDoctorForm({ name: "", specialization: "", departmentId: "", availableDays: [] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setDoctorForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day) ? prev.availableDays.filter(d => d !== day) : [...prev.availableDays, day],
    }));
  };

  const callNextToken = async (deptId) => {
    try {
      await API.post("/queue/next", { queueId: `dept_${deptId}` });
      toast.success("Next token called!");
      load();
    } catch {
      toast.error("Queue empty or error");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1px solid var(--border)", background: "var(--bg-elevated)",
    color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box",
  };

  const statusColor = { booked:"#818cf8", "checked-in":"#f59e0b", waiting:"#f59e0b", serving:"#22c55e", completed:"#22c55e", cancelled:"#ef4444" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Dept Modal */}
      {showDeptModal && (
        <Modal title="Add Department" onClose={() => setShowDeptModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Department Name *", key: "name", placeholder: "e.g. Cardiology" },
              { label: "Code *", key: "code", placeholder: "e.g. CARD" },
              { label: "Description", key: "description", placeholder: "Brief description" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>{f.label}</label>
                <input placeholder={f.placeholder} value={deptForm[f.key]} onChange={e => setDeptForm({ ...deptForm, [f.key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Avg Service Time (minutes)</label>
              <input type="number" min="1" max="60" value={deptForm.avgServiceTime} onChange={e => setDeptForm({ ...deptForm, avgServiceTime: +e.target.value })} style={inputStyle} />
            </div>
            <button onClick={saveDept} disabled={saving}
              style={{ padding: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600", marginTop: "8px" }}>
              {saving ? "Saving..." : "Create Department"}
            </button>
          </div>
        </Modal>
      )}

      {/* Doctor Modal */}
      {showDoctorModal && (
        <Modal title="Add Doctor" onClose={() => setShowDoctorModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Doctor Full Name *", key: "name", placeholder: "Dr. Ravi Sharma" },
              { label: "Specialization", key: "specialization", placeholder: "e.g. Cardiologist" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>{f.label}</label>
                <input placeholder={f.placeholder} value={doctorForm[f.key]} onChange={e => setDoctorForm({ ...doctorForm, [f.key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Department *</label>
              <select value={doctorForm.departmentId} onChange={e => setDoctorForm({ ...doctorForm, departmentId: e.target.value })} style={inputStyle}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>Available Days</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {days.map(day => (
                  <button key={day} onClick={() => toggleDay(day)}
                    style={{
                      padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px",
                      background: doctorForm.availableDays.includes(day) ? "rgba(99,102,241,0.15)" : "var(--bg-elevated)",
                      border: `1px solid ${doctorForm.availableDays.includes(day) ? "#6366f1" : "var(--border)"}`,
                      color: doctorForm.availableDays.includes(day) ? "#818cf8" : "var(--text-secondary)",
                    }}>
                    {day.slice(0,3)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveDoctor} disabled={saving}
              style={{ padding: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontWeight: "600", marginTop: "8px" }}>
              {saving ? "Saving..." : "Add Doctor"}
            </button>
          </div>
        </Modal>
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Hospital Management</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>Manage departments, doctors, and appointments</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowDoctorModal(true)}
              style={{ padding: "10px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
              + Doctor
            </button>
            <button onClick={() => setShowDeptModal(true)}
              style={{ padding: "10px 16px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
              + Department
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-elevated)", borderRadius: "12px", padding: "5px" }}>
          {[
            { key: "departments", label: "🏥 Departments", count: departments.length },
            { key: "doctors", label: "👨‍⚕️ Doctors", count: doctors.length },
            { key: "appointments", label: "📋 Today's Queue", count: appointments.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: "8px", cursor: "pointer",
                background: tab === t.key ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                border: "none", color: tab === t.key ? "#fff" : "var(--text-secondary)",
                fontSize: "13px", fontWeight: tab === t.key ? "600" : "400", transition: "all 0.2s",
              }}>
              {t.label} <span style={{ opacity: 0.7, marginLeft: "4px" }}>({t.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Loading...
          </div>
        ) : (
          <>
            {/* DEPARTMENTS TAB */}
            {tab === "departments" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {departments.map(dept => (
                  <div key={dept._id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ fontSize: "32px" }}>{deptIcons[dept.code] || "🏥"}</div>
                      <span style={{ padding: "3px 10px", background: "rgba(34,197,94,0.1)", borderRadius: "20px", fontSize: "11px", color: "#22c55e", fontWeight: "600" }}>
                        Active
                      </span>
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>{dept.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>{dept.description}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1, padding: "8px", background: "var(--bg-elevated)", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#6366f1" }}>{dept.avgServiceTime}m</div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>avg time</div>
                      </div>
                      <div style={{ flex: 1, padding: "8px", background: "var(--bg-elevated)", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#f59e0b" }}>
                          {doctors.filter(d => d.departmentId === dept._id || d.departmentId?._id === dept._id).length}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>doctors</div>
                      </div>
                    </div>
                    <button onClick={() => callNextToken(dept._id)}
                      style={{ width: "100%", marginTop: "12px", padding: "9px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "8px", color: "#818cf8", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                      📢 Call Next Token
                    </button>
                  </div>
                ))}
                {departments.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏥</div>
                    No departments yet. Run seed.js or click "+ Department"
                  </div>
                )}
              </div>
            )}

            {/* DOCTORS TAB */}
            {tab === "doctors" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {doctors.map(doc => (
                  <div key={doc._id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                      {doc.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{doc.name}</div>
                      <div style={{ fontSize: "13px", color: "#818cf8", marginTop: "2px" }}>{doc.specialization}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        📅 {doc.availableDays?.join(", ") || "All days"}
                      </div>
                    </div>
                    <span style={{ padding: "4px 12px", background: "rgba(34,197,94,0.1)", borderRadius: "20px", fontSize: "11px", color: "#22c55e", fontWeight: "600" }}>Active</span>
                  </div>
                ))}
                {doctors.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>👨‍⚕️</div>
                    No doctors yet. Click "+ Doctor" to add.
                  </div>
                )}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {tab === "appointments" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {appointments.map(appt => (
                  <div key={appt._id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: "#6366f1", fontFamily: "monospace" }}>
                        {String(appt.tokenNumber || "?").padStart(3, "0")}
                      </div>
                      <div style={{ fontSize: "9px", color: "#818cf8" }}>TOKEN</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{appt.patientName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                        🏥 {appt.departmentId?.name} &nbsp;|&nbsp; ⏰ {appt.appointmentTime || "Walk-in"}
                        {appt.doctorId && ` | 👨‍⚕️ ${appt.doctorId.name}`}
                      </div>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: `${statusColor[appt.status]}15`, color: statusColor[appt.status] }}>
                      {appt.status}
                    </span>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
                    No appointments booked yet today
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDepartments;