import React from "react";
 
const TokenCard = ({ tokenData, currentToken }) => {
  if (!tokenData) return null;
 
  return (
    <div style={{
      background: "white", border: "2px solid #c7d2fe",
      borderRadius: "16px", padding: "24px 20px", textAlign: "center",
      boxShadow: "0 0 0 4px rgba(26,86,219,.06)",
    }}>
      <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "8px" }}>
        Your Token
      </p>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "3.5rem", fontWeight: "700", color: "var(--accent)", lineHeight: 1 }}>
        {String(tokenData.tokenNumber).padStart(3, "0")}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "16px" }}>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1a56db" }}>{tokenData.position}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Position</div>
        </div>
        <div style={{ width: "1px", background: "var(--border)" }} />
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0891b2" }}>{tokenData.eta}m</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Est. wait</div>
        </div>
      </div>
      {currentToken && (
        <div style={{ marginTop: "14px", padding: "8px 14px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#16a34a" }}>🔔 Now Serving: {String(currentToken).padStart(3, "0")}</span>
        </div>
      )}
    </div>
  );
};
 
export default TokenCard;