const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: String,                        // "Cardiologist", "Dentist"
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  email: String,
  phone: String,
  avatar: String,
  availableDays: [String],                       // ["Monday","Tuesday"]
  availableSlots: [{
    time: String,                                // "10:00 AM"
    isBooked: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doctor", doctorSchema);