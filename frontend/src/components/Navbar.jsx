// ─── STEP 2: Replace frontend/src/components/Navbar.jsx ───
import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/book", label: "Book Appointment" },
    { to: "/my-appointments", label: "My Appointments" },
    ...(user.role === "admin"
      ? [
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/departments", label: "Departments" },
          { to: "/admin/checkin", label: "Check-In" },
        ]
      : []),
  ];

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(248,250,252,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: "0 20px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #1a56db, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
              Queue<span style={{ color: "var(--accent)" }}>Pro</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hide-mobile">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"} style={({ isActive }) => ({
                padding: "6px 14px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "500",
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-light)" : "transparent",
                transition: "all .15s",
              })}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* User + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--border)", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "linear-gradient(135deg,#1a56db,#0891b2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "700", fontSize: "13px", color: "white",
                }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hide-mobile">
                {user.name?.split(" ")[0]}
              </span>
            </div>

            {user.role === "admin" && (
              <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "100px", background: "#eef2ff", color: "#1a56db" }}>
                ADMIN
              </span>
            )}

            <button onClick={logout} style={{
              padding: "7px 16px", borderRadius: "8px", border: "1px solid var(--border)",
              background: "white", color: "var(--text-secondary)", fontSize: "13px",
              fontWeight: "500", cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={e => { e.target.style.background = "#fef2f2"; e.target.style.color = "#dc2626"; e.target.style.borderColor = "#fecaca"; }}
              onMouseLeave={e => { e.target.style.background = "white"; e.target.style.color = "var(--text-secondary)"; e.target.style.borderColor = "var(--border)"; }}
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="show-mobile" style={{
              background: "none", border: "1px solid var(--border)", borderRadius: "8px",
              padding: "6px 10px", cursor: "pointer", color: "var(--text-primary)",
            }}>
              ☰
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            borderTop: "1px solid var(--border)", background: "white",
            padding: "12px 20px", display: "flex", flexDirection: "column", gap: "4px",
          }}>
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
                padding: "10px 14px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "500", textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-primary)",
                background: isActive ? "var(--accent-light)" : "transparent",
              })}>
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media(max-width:700px){
          .hide-mobile{display:none!important}
          .show-mobile{display:flex!important}
        }
        @media(min-width:701px){
          .show-mobile{display:none!important}
        }
      `}</style>
    </>
  );
};

export default Navbar;