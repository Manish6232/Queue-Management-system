import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";

const Feedback = () => {
  const { appointmentId } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  const quickTags = ["Short wait time","Friendly staff","Clean facility","Professional doctor","Easy check-in","Good communication"];
  const negativeTags = ["Long wait","Unhelpful staff","Dirty facility","Poor communication","Confusing process"];

  useEffect(() => {
    if (appointmentId) {
      API.get(`/appointments/${appointmentId}`)
        .then(r => setAppointment(r.data.data))
        .catch(() => {});
    }
  }, [appointmentId]);

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error("Please select a rating");
    setLoading(true);
    try {
      await API.post("/appointments/feedback", {
        appointmentId,
        rating,
        comment: comment + (tags.length ? `\nTags: ${tags.join(", ")}` : ""),
      });
      setDone(true);
      toast.success("Thank you for your feedback!");
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ["","Poor","Fair","Good","Very Good","Excellent"];
  const ratingEmoji  = ["","😞","😕","😊","😄","🤩"];
  const ratingColors = ["","#ef4444","#f59e0b","#3b82f6","#22c55e","#8b5cf6"];

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: "480px", margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "24px", padding: "48px 32px" }}>
            <div style={{ fontSize: "72px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 12px" }}>
              Thank You!
            </h2>
            <p style={{ color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: "1.6" }}>
              Your feedback helps us improve our services for all patients. We really appreciate it!
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "28px" }}>
              {Array.from({ length: rating }).map((_, i) => (
                <span key={i} style={{ fontSize: "28px" }}>⭐</span>
              ))}
            </div>
            <button onClick={() => navigate("/my-appointments")}
              style={{ padding: "12px 32px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "12px", color: "#fff", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "32px 16px" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Rate Your Visit</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>Your feedback improves patient experience</p>
        </div>

        {/* Visit summary */}
        {appointment && (
          <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "14px", padding: "16px", marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginBottom: "6px" }}>Your Visit</div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              🏥 {appointment.departmentId?.name} &nbsp;|&nbsp;
              👨‍⚕️ {appointment.doctorId?.name || "General"} &nbsp;|&nbsp;
              📅 {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN") : "Today"}
            </div>
          </div>
        )}

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px" }}>

          {/* Star Rating */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
              How was your overall experience?
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
              {[1,2,3,4,5].map(star => (
                <button key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    fontSize: "48px", background: "none", border: "none", cursor: "pointer",
                    filter: star <= (hover || rating) ? "none" : "grayscale(100%) opacity(0.3)",
                    transform: star <= (hover || rating) ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s",
                  }}>
                  ⭐
                </button>
              ))}
            </div>
            {(hover || rating) > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{ fontSize: "28px" }}>{ratingEmoji[hover || rating]}</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: ratingColors[hover || rating] }}>
                  {ratingLabels[hover || rating]}
                </span>
              </div>
            )}
          </div>

          {/* Quick tags */}
          {rating >= 3 ? (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "10px" }}>
                What did you like? (optional)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {quickTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    style={{
                      padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
                      background: tags.includes(tag) ? "rgba(34,197,94,0.1)" : "var(--bg-elevated)",
                      border: `1px solid ${tags.includes(tag) ? "#22c55e" : "var(--border)"}`,
                      color: tags.includes(tag) ? "#22c55e" : "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}>
                    {tags.includes(tag) ? "✓ " : ""}{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : rating > 0 ? (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "10px" }}>
                What could be improved? (optional)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {negativeTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    style={{
                      padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
                      background: tags.includes(tag) ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)",
                      border: `1px solid ${tags.includes(tag) ? "#ef4444" : "var(--border)"}`,
                      color: tags.includes(tag) ? "#ef4444" : "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}>
                    {tags.includes(tag) ? "✓ " : ""}{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Comment */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Additional comments (optional)
            </label>
            <textarea
              placeholder="Tell us more about your experience..."
              rows={4} value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--bg-elevated)",
                color: "var(--text-primary)", fontSize: "14px",
                outline: "none", resize: "vertical", boxSizing: "border-box",
                lineHeight: "1.6",
              }}
            />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading || !rating}
            style={{
              width: "100%", padding: "14px",
              background: !rating ? "var(--bg-elevated)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "15px", fontWeight: "600", cursor: !rating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: loading ? 0.7 : 1, transition: "all 0.2s",
            }}>
            {loading
              ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Submitting...</>
              : "Submit Feedback →"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Feedback;