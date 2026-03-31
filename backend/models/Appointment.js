const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientPhone: String,
  patientEmail: String,
  mrn: { type: String, unique: true },           // Medical Record Number: MRN-00001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  appointmentDate: Date,
  appointmentTime: String,
  tokenNumber: Number,
  queueId: String,
  status: {
    type: String,
    enum: ["booked", "checked-in", "waiting", "serving", "completed", "cancelled"],
    default: "booked"
  },
  checkedInAt: Date,
  servedAt: Date,
  completedAt: Date,
  waitTime: Number,
  notes: String,
  feedback: {
    rating: Number,                              // 1-5
    comment: String,
    submittedAt: Date
  },
  qrCode: String,                               // QR code data string
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate MRN before save
appointmentSchema.pre("save", async function(next) {
  if (!this.mrn) {
    const count = await mongoose.model("Appointment").countDocuments();
    this.mrn = `MRN-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);