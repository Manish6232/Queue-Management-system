import React, { useState, useEffect } from "react";
import { callNext, getAdminAnalytics } from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../socket/socket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";

const QUEUE_ID = "hospital1";

const StatCard = ({ icon, label, value, color }) => (
  <div className="p-5 rounded-2xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${color}20`, color }}>live</span>
    </div>
    <p className="text-3xl font-black mono" style={{ color }}>{value}</p>
    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      const res = await getAdminAnalytics(QUEUE_ID);
      setAnalytics(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetch();
    socket.on("queueUpdated", fetch);
    socket.on("tokenCalled", fetch);
    return () => { socket.off("queueUpdated", fetch); socket.off("tokenCalled", fetch); };
  }, []);

  const handleNext = async () => {
    setLoading(true);
    try {
      const res = await callNext({ queueId: QUEUE_ID });
      if (res.data.tokenNumber) {
        toast.success(`Token #${res.data.tokenNumber} called!`);
      } else {
        toast("Queue is empty", { icon: "ℹ️" });
      }
      fetch();
    } catch {
      toast.error("Failed to call next");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>City Hospital — Real-time queue control</p>
          </div>
          <button onClick={handleNext} disabled={loading}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "📢"}
            Call Next Token
          </button>
        </div>

        {analytics && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon="⏳" label="Currently Waiting" value={analytics.currentWaiting} color="#6366f1" />
              <StatCard icon="✅" label="Served Today" value={analytics.servedToday} color="#22c55e" />
              <StatCard icon="🏆" label="Total Served" value={analytics.totalServed} color="#f59e0b" />
              <StatCard icon="⏱️" label="Avg Wait (min)" value={analytics.avgWaitTime} color="#a78bfa" />
            </div>

            {/* Chart */}
            <div className="p-6 rounded-2xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <h3 className="font-bold mb-5">Last 7 Days — Tokens Served</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.weekData} barSize={28}>
                  <XAxis dataKey="date" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "#f0f0ff" }}
                    cursor={{ fill: "rgba(99,102,241,0.05)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {analytics.weekData.map((_, i) => (
                      <Cell key={i} fill={i === analytics.weekData.length - 1 ? "#6366f1" : "#1e1e35"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {!analytics && (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;