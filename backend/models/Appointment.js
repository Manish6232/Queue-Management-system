const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientName:     { type: String, required: true },
  patientPhone:    String,
  patientEmail:    String,
  mrn:             { type: String, unique: true, sparse: true },
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId:        { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  departmentId:    { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  appointmentDate: Date,
  appointmentTime: String,
  tokenNumber:     Number,
  queueId:         String,
  status: {
    type: String,
    enum: ["booked", "checked-in", "waiting", "serving", "completed", "cancelled"],
    default: "booked",
  },
  checkedInAt:  Date,
  servedAt:     Date,
  completedAt:  Date,
  waitTime:     Number,
  notes:        String,
  feedback: {
    rating:      Number,
    comment:     String,
    submittedAt: Date,
  },
  qrCode:    String,
  createdAt: { type: Date, default: Date.now },
});

// ✅ FIX: Mongoose 7+ async pre-hooks must NOT use next()
// Use async without next — just return when done
appointmentSchema.pre("save", async function () {
  if (!this.mrn) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random    = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.mrn = `MRN-${timestamp}-${random}`;
  }
  // No next() needed — Mongoose 7+ awaits the async function automatically
});

module.exports = mongoose.model("Appointment", appointmentSchema);