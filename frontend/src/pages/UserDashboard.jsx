import React, { useEffect, useState } from "react";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [tokenData, setTokenData] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [livePosition, setLivePosition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tokenData"));
    if (!saved) return navigate("/");
    setTokenData(saved);
    setLivePosition(saved.position);

    socket.emit("joinQueueRoom", saved.queueId);
    socket.on("queueUpdated", (data) => {
      if (data.queueId === saved.queueId) setLivePosition(data.position);
    });
    socket.on("tokenCalled", (data) => {
      setCurrentToken(data.tokenNumber);
      if (saved.tokenNumber > 1) {
        setTokenData(prev => prev ? { ...prev, position: Math.max(1, prev.position - 1), eta: Math.max(0, prev.eta - 5) } : prev);
      }
    });
    return () => { socket.off("queueUpdated"); socket.off("tokenCalled"); };
  }, []);

  if (!tokenData) return null;

  const progress = Math.max(0, 100 - ((tokenData.position - 1) / 10) * 100);
  const isNext = tokenData.tokenNumber === (currentToken + 1);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
        <h2 className="text-2xl font-bold mb-6">Your Queue Status</h2>

        {/* Token Card */}
        <div className="p-8 rounded-2xl border mb-6 text-center glow-purple relative overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "#6366f1" }}>
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />

          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>YOUR TOKEN</p>
          <p className="text-7xl font-black mono gradient-text">{String(tokenData.tokenNumber).padStart(3, "0")}</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-2xl font-bold" style={{ color: "#6366f1" }}>{tokenData.position}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Position in queue</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-2xl font-bold" style={{ color: "#a78bfa" }}>{tokenData.eta}m</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Estimated wait</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
              <span>Progress</span><span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
            </div>
          </div>
        </div>

        {/* Now Serving */}
        {currentToken && (
          <div className="p-5 rounded-2xl border flex items-center gap-4 mb-4"
            style={{ background: "rgba(34,197,94,0.05)", borderColor: "#22c55e" }}>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(34,197,94,0.1)" }}>🔔</div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
                style={{ background: "#22c55e" }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: "#22c55e" }}>Now Serving</p>
              <p className="text-2xl font-black mono">{String(currentToken).padStart(3, "0")}</p>
            </div>
            {isNext && (
              <div className="ml-auto px-3 py-1.5 rounded-lg text-sm font-bold animate-pulse"
                style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}>
                You're next!
              </div>
            )}
          </div>
        )}

        <button onClick={() => { localStorage.removeItem("tokenData"); navigate("/"); }}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          Leave Queue
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;