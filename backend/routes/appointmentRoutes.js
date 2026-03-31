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

// Public
router.get("/queue/:departmentId", getDepartmentQueue);
router.get("/search",              searchAppointment);

// User (authenticated)
router.post("/book",               verifyToken, bookAppointment);
router.post("/checkin",            verifyToken, checkIn);
router.post("/feedback",           verifyToken, submitFeedback);
router.get("/my",                  verifyToken, getMyAppointments);
router.get("/:id",                 verifyToken, getAppointmentById);
router.patch("/:id/cancel",        verifyToken, cancelAppointment);

// Admin only
router.get("/all",                 verifyToken, isAdmin, getAllAppointments);

module.exports = router;