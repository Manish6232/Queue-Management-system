import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth pages
import Auth from "./pages/Auth";
import VerifyOTP from "./pages/VerifyOTP";
import AuthCallback from "./pages/AuthCallback";

// User pages
import Home from "./pages/Home";
import UserDashboard from "./pages/UserDashboard";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Feedback from "./pages/Feedback";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminDepartments from "./pages/AdminDepartments";
import CheckIn from "./pages/CheckIn";

// Public pages
import QueueDisplay from "./pages/QueueDisplay";

// ─── Route Guards ────────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#16162a",
            color: "#f0f0ff",
            border: "1px solid #1e1e35",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#16162a" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#16162a" } },
        }}
      />

      <Routes>
        {/* ── Public / Auth ── */}
        <Route path="/login"          element={<Auth />} />
        <Route path="/signup"         element={<Navigate to="/login" replace />} />
        <Route path="/verify-otp"     element={<VerifyOTP />} />
        <Route path="/auth/callback"  element={<AuthCallback />} />

        {/* ── TV Queue Display (public — no auth needed) ── */}
        <Route path="/queue-display/:deptId" element={<QueueDisplay />} />
        <Route path="/queue-display"         element={<QueueDisplay />} />

        {/* ── User Pages ── */}
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><UserDashboard /></ProtectedRoute>
        } />
        <Route path="/book" element={
          <ProtectedRoute><BookAppointment /></ProtectedRoute>
        } />
        <Route path="/my-appointments" element={
          <ProtectedRoute><MyAppointments /></ProtectedRoute>
        } />
        <Route path="/feedback/:appointmentId" element={
          <ProtectedRoute><Feedback /></ProtectedRoute>
        } />

        {/* ── Admin Only Pages ── */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute adminOnly><AdminDepartments /></ProtectedRoute>
        } />
        <Route path="/admin/checkin" element={
          <ProtectedRoute adminOnly><CheckIn /></ProtectedRoute>
        } />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;