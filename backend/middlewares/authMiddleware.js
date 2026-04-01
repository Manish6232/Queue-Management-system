const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ FIX 1: Check header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ FIX 2: Strip "Bearer " prefix before verifying
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: "Token is empty" });
  }

  // ✅ FIX 3: Log the real error so you can debug in terminal
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message, "| JWT_SECRET set:", !!process.env.JWT_SECRET);
    return res.status(401).json({ message: "Invalid token: " + err.message });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};