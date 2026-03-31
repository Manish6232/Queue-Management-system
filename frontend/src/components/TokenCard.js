import React from "react";

const TokenCard = ({ tokenData, currentToken }) => {
  return (
    <div className="mt-6 bg-gray-100 p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2">Your Token</h3>

      <p>🎟 Token: {tokenData.tokenNumber}</p>
      <p>📍 Position: {tokenData.position}</p>
      <p>⏱ ETA: {tokenData.eta} mins</p>

      {currentToken && (
        <p className="text-red-500 mt-2 font-semibold">
          🔔 Now Serving: {currentToken}
        </p>
      )}
    </div>
  );
};

export default TokenCard;