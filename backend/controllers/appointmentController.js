const Appointment = require("../models/Appointment");
const Department  = require("../models/Department");
const redis       = require("../config/redis");
const socket      = require("../socket");

let QRCode;
try { QRCode = require("qrcode"); } catch(e) { QRCode = null; }

// ── Book Appointment ──────────────────────────────────────────
exports.bookAppointment = async (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, doctorId, departmentId, appointmentDate, appointmentTime, userId, notes } = req.body;

    if (!patientName) return res.status(400).json({ message: "Patient name required" });

    let queueId = "hospital1";
    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (dept) queueId = `dept_${departmentId}`;
    }

    const tokenNumber = await redis.incr(`queue:${queueId}:token`);
    await redis.rpush(`queue:${queueId}`, tokenNumber);

    // Generate QR code
    let qrCode = null;
    if (QRCode) {
      const qrData = JSON.stringify({ token: tokenNumber, queue: queueId, patient: patientName });
      qrCode = await QRCode.toDataURL(qrData);
    }

    const appointment = await Appointment.create({
      patientName, patientPhone, patientEmail,
      userId: userId || req.user?.id,
      doctorId: doctorId || null,
      departmentId: departmentId || null,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(),
      appointmentTime,
      tokenNumber, queueId, notes,
      status: "booked",
      qrCode,
    });

    // Real-time notification
    try {
      const io = socket.getIO();
      io.to(queueId).emit("newAppointment", { tokenNumber, patientName, queueId });
    } catch(e) {}

    const populated = await Appointment.findById(appointment._id)
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name code");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Check In ─────────────────────────────────────────────────
exports.checkIn = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "waiting", checkedInAt: new Date() },
      { new: true }
    ).populate("departmentId", "name").populate("doctorId", "name");

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    try {
      const io = socket.getIO();
      io.to(appointment.queueId).emit("patientCheckedIn", {
        tokenNumber: appointment.tokenNumber,
        patientName: appointment.patientName,
      });
    } catch(e) {}

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get Department Queue ──────────────────────────────────────
exports.getDepartmentQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const appointments = await Appointment.find({
      departmentId,
      status: { $in: ["waiting", "serving", "checked-in"] },
      appointmentDate: { $gte: today },
    }).populate("doctorId", "name").sort("tokenNumber");

    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── My Appointments ───────────────────────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name code")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get Single Appointment ────────────────────────────────────
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name code");

    if (!appointment) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Cancel Appointment ────────────────────────────────────────
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Not found" });

    // Remove from Redis queue
    await redis.lrem(`queue:${appointment.queueId}`, 0, appointment.tokenNumber);

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Search Appointment ────────────────────────────────────────
exports.searchAppointment = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query required" });

    let query = {};
    if (!isNaN(q)) {
      query = { tokenNumber: parseInt(q) };
    } else if (q.toUpperCase().startsWith("MRN")) {
      query = { mrn: q.toUpperCase() };
    } else {
      query = { patientName: { $regex: q, $options: "i" } };
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const appointment = await Appointment.findOne({ ...query, appointmentDate: { $gte: today } })
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name");

    if (!appointment) return res.status(404).json({ message: "No appointment found" });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Submit Feedback ───────────────────────────────────────────
exports.submitFeedback = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { feedback: { rating, comment, submittedAt: new Date() } },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── All Appointments (Admin) ──────────────────────────────────
exports.getAllAppointments = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const appointments = await Appointment.find({ appointmentDate: { $gte: today } })
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name")
      .sort({ tokenNumber: 1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};