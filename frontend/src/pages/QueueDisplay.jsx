import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import API from "../services/api";

const QueueDisplay = () => {
  const { deptId } = useParams();
  const [nowServing, setNowServing] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [time, setTime] = useState(new Date());
  const [deptName, setDeptName] = useState("Queue Display");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    // Clock
    const clock = setInterval(() => setTime(new Date()), 1000);

    // Load queue
    const loadQueue = () => {
      API.get(`/appointments/queue/${deptId}`)
        .then(r => {
          const data = r.data.data || [];
          const serving = data.find(a => a.status === "serving");
          const waiting = data.filter(a => a.status === "waiting");
          if (serving) setNowServing(serving.tokenNumber);
          setWaitingList(waiting.slice(0, 5));
        }).catch(() => {});
    };
    loadQueue();

    // Real-time socket
    socket.emit("joinQueueRoom", `dept_${deptId}`);
    socket.on("tokenCalled", data => {
      setNowServing(data.tokenNumber);
      setFlash(true);
      setTimeout(() => setFlash(false), 2000);
    });
    socket.on("queueUpdated", loadQueue);
    socket.on("patientCheckedIn", loadQueue);

    return () => {
      clearInterval(clock);
      socket.off("tokenCalled");
      socket.off("queueUpdated");
      socket.off("patientCheckedIn");
    };
  }, [deptId]);

  return (
    <div style={{
      minHeight: "100vh", background: "#020209",
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 48px",
        background: "rgba(99,102,241,0.05)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "900", color: "#fff" }}>Q</div>
          <div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: "#fff" }}>
              Queue<span style={{ color: "#818cf8" }}>Pro</span>
            </div>
            <div style={{ fontSize: "14px", color: "#4b5563" }}>City Hospital</div>
          </div>
        </div>

        {/* Department badge */}
        <div style={{ padding: "8px 24px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px" }}>
          <span style={{ color: "#818cf8", fontSize: "16px", fontWeight: "600" }}>🏥 {deptName}</span>
        </div>

        {/* Clock */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "44px", fontWeight: "700", color: "#6366f1", fontFamily: "monospace", lineHeight: 1 }}>
            {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
          </div>
          <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "4px" }}>
            {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", padding: "48px" }}>

        {/* NOW SERVING — big */}
        <div style={{
          flex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          borderRight: "1px solid rgba(99,102,241,0.1)", paddingRight: "48px",
        }}>
          <div style={{ fontSize: "18px", letterSpacing: "8px", color: "#4b5563", textTransform: "uppercase", marginBottom: "20px" }}>
            Now Serving
          </div>

          {/* Token display */}
          <div style={{
            fontSize: "200px", fontWeight: "900", lineHeight: 1, fontFamily: "monospace",
            background: flash ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#6366f1,#a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            transition: "all 0.5s",
            filter: `drop-shadow(0 0 60px ${flash ? "rgba(34,197,94,0.5)" : "rgba(99,102,241,0.4)"})`,
          }}>
            {nowServing ? String(nowServing).padStart(3, "0") : "---"}
          </div>

          {/* Live pulse */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "32px" }}>
            <div style={{
              position: "relative", width: "14px", height: "14px",
            }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#22c55e", position: "absolute" }} />
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#22c55e", position: "absolute", animation: "ping 1.5s ease-out infinite" }} />
            </div>
            <span style={{ color: "#22c55e", fontSize: "18px", letterSpacing: "3px", fontWeight: "600" }}>LIVE</span>
          </div>

          {/* Please proceed */}
          {nowServing && (
            <div style={{ marginTop: "24px", padding: "12px 32px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px" }}>
              <span style={{ color: "#22c55e", fontSize: "16px" }}>Please proceed to the counter</span>
            </div>
          )}
        </div>

        {/* NEXT IN LINE */}
        <div style={{ flex: 1, paddingLeft: "48px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "16px", letterSpacing: "4px", color: "#4b5563", textTransform: "uppercase", marginBottom: "24px" }}>
            Next in Line
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {waitingList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#374151", fontSize: "14px" }}>
                No patients in queue
              </div>
            ) : (
              waitingList.map((appt, i) => (
                <div key={appt._id} style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "16px 20px", borderRadius: "14px",
                  background: i === 0 ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${i === 0 ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.3s",
                }}>
                  <div style={{
                    fontSize: "32px", fontWeight: "800", fontFamily: "monospace",
                    color: i === 0 ? "#818cf8" : "#374151", minWidth: "70px",
                  }}>
                    {String(appt.tokenNumber).padStart(3, "0")}
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", color: i === 0 ? "#d1d5db" : "#4b5563", fontWeight: i === 0 ? "600" : "400" }}>
                      {appt.patientName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#374151", marginTop: "2px" }}>
                      {i === 0 ? "⏭ Up next" : `~${(i) * 8} min wait`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats at bottom */}
          <div style={{ marginTop: "auto", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Waiting", value: waitingList.length, color: "#f59e0b" },
                { label: "Avg Wait", value: `~${waitingList.length * 8}m`, color: "#818cf8" },
              ].map(s => (
                <div key={s.label} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{ padding: "12px 48px", background: "rgba(99,102,241,0.06)", borderTop: "1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ fontSize: "14px", color: "#4b5563" }}>
          🏥 City Hospital Queue Management System &nbsp;|&nbsp;
          📞 For assistance call reception &nbsp;|&nbsp;
          ⏰ OPD Hours: 9:00 AM – 5:00 PM
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default QueueDisplay;