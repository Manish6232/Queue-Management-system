const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

// Configs
const connectDB = require("./config/db");
const passport = require("./config/passport");

// Routes
const queueRoutes = require("./routes/queueRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

// Middlewares
const rateLimiter = require("./middlewares/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");

// Socket
const socketInit = require("./socket");

// ✅ CREATE APP FIRST (IMPORTANT)
const app = express();
const server = http.createServer(app);

// ✅ INIT SOCKET
socketInit.init(server);

// ✅ CONNECT DATABASE
connectDB();

// =======================
// MIDDLEWARES
// =======================
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "queuepro_secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(rateLimiter);

// =======================
// ROUTES
// =======================

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 QueuePro API is running...",
    status: "ok"
  });
});

// Auth & Core
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/analytics", analyticsRoutes);

// ✅ NEW ROUTES (FIXED POSITION)
app.use("/api/appointments", appointmentRoutes);
app.use("/api/departments", departmentRoutes);

// =======================
// ERROR HANDLER
// =======================
app.use(errorHandler);

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});