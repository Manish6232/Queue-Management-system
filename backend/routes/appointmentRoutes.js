const express = require("express");
const router  = express.Router();
const {
  bookAppointment,
  checkIn,
  getDepartmentQueue,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  searchAppointment,
  submitFeedback,
  getAllAppointments,
} = require("../controllers/appointmentController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// ── Public routes (no auth needed) ──────────────
router.get("/queue/:departmentId", getDepartmentQueue);
router.get("/search",              searchAppointment);
 
// ── Authenticated routes ─────────────────────────
router.post("/book",     verifyToken, bookAppointment);
router.post("/checkin",  verifyToken, checkIn);
router.post("/feedback", verifyToken, submitFeedback);
router.get("/my",        verifyToken, getMyAppointments);
 
// ✅ FIX: /all MUST come before /:id
// Otherwise Express treats "all" as a MongoDB ObjectId → crash
router.get("/all", verifyToken, isAdmin, getAllAppointments);
 
// ── Dynamic :id routes — always last ────────────
router.get("/:id",          verifyToken, getAppointmentById);
router.patch("/:id/cancel", verifyToken, cancelAppointment);

module.exports = router;