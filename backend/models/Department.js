const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },        // "OPD", "Cardiology", "Lab"
  code: { type: String, required: true },        // "OPD-01"
  description: String,
  avgServiceTime: { type: Number, default: 5 },  // minutes per patient
  isActive: { type: Boolean, default: true },
  currentCounter: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Department", departmentSchema);