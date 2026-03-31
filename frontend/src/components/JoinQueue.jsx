import React, { useState, useEffect } from "react";
import { joinQueue } from "../services/api";
import socket from "../socket/socket";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const queues = [
  { id: "hospital1", label: "🏥 City Hospital", desc: "General OPD" },
  { id: "bank1", label: "🏦 State Bank", desc: "Account Services" },
  { id: "govt1", label: "🏛️ Govt Office", desc: "Document Services" },
];

const JoinQueue = () => {
  const [selectedQueue, setSelectedQueue] = useState("hospital1");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleJoin = async () => {
    if (!user.name) return navigate("/login");
    setLoading(true);
    try {
      const res = await joinQueue({ userName: user.name, queueId: selectedQueue });
      localStorage.setItem("tokenData", JSON.stringify({ ...res.data.data, queueId: selectedQueue }));
      toast.success(`Token #${res.data.data.tokenNumber} assigned!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border animate-slide-up"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <h2 className="text-lg font-bold mb-5">Select a Queue</h2>

      <div className="grid gap-3 mb-6">
        {queues.map((q) => (
          <button key={q.id} onClick={() => setSelectedQueue(q.id)}
            className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
            style={{
              background: selectedQueue === q.id ? "rgba(99,102,241,0.1)" : "var(--bg-elevated)",
              border: `1px solid ${selectedQueue === q.id ? "#6366f1" : "var(--border)"}`,
              boxShadow: selectedQueue === q.id ? "0 0 0 2px rgba(99,102,241,0.2)" : "none"
            }}>
            <span className="text-2xl">{q.label.split(" ")[0]}</span>
            <div>
              <p className="font-semibold text-sm">{q.label.slice(2)}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{q.desc}</p>
            </div>
            {selectedQueue === q.id && (
              <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#6366f1" }}>
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <button onClick={handleJoin} disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
        {loading ? <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Joining...
        </span> : "Join Queue →"}
      </button>
    </div>
  );
};

export default JoinQueue;