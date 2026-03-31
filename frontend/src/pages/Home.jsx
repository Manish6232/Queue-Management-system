import React from "react";
import JoinQueue from "../components/JoinQueue";
import QueueStatus from "../components/QueueStatus";
import Navbar from "../components/Navbar";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user.name || "there"}</span> 👋
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Join a queue and track your position in real-time
          </p>
        </div>
        <QueueStatus />
        <div className="mt-6">
          <JoinQueue />
        </div>
      </div>
    </div>
  );
};

export default Home;