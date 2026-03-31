import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{ background: "rgba(8,8,16,0.8)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <span className="text-white font-bold text-sm">Q</span>
        </div>
        <span className="font-bold text-lg">Queue<span className="gradient-text">Pro</span></span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>Home</Link>
        <Link to="/dashboard" className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>My Queue</Link>
        {user.role === "admin" && (
          <Link to="/admin" className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>Admin</Link>
        )}

        <div className="flex items-center gap-3 ml-2">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border" style={{ borderColor: "var(--border)" }} />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <button onClick={logout} className="text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;