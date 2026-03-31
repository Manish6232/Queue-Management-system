import React, { useEffect, useState } from "react";
import { getStatus } from "../services/api";
import socket from "../socket/socket";

const QueueStatus = () => {
  const [counts, setCounts] = useState({ hospital1: 0, bank1: 0, govt1: 0 });

  const fetchAll = async () => {
    try {
      const ids = ["hospital1", "bank1", "govt1"];
      const results = await Promise.all(ids.map(id => getStatus(id)));
      setCounts({
        hospital1: results[0].data.totalPeopleInQueue,
        bank1: results[1].data.totalPeopleInQueue,
        govt1: results[2].data.totalPeopleInQueue,
      });
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    socket.on("queueUpdated", fetchAll);
    socket.on("tokenCalled", fetchAll);
    return () => {
      socket.off("queueUpdated", fetchAll);
      socket.off("tokenCalled", fetchAll);
    };
  }, []);

  const queues = [
    { id: "hospital1", label: "City Hospital", icon: "🏥", color: "#6366f1" },
    { id: "bank1", label: "State Bank", icon: "🏦", color: "#22c55e" },
    { id: "govt1", label: "Govt Office", icon: "🏛️", color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {queues.map(q => (
        <div key={q.id} className="p-4 rounded-2xl border text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <span className="text-2xl">{q.icon}</span>
          <p className="text-3xl font-bold mono mt-2" style={{ color: q.color }}>{counts[q.id]}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>waiting</p>
          <p className="text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>{q.label}</p>
        </div>
      ))}
    </div>
  );
};

export default QueueStatus;