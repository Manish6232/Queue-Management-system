const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  queueId: String,
  tokenNumber: Number,
  joinedAt: { type: Date, default: Date.now },
  servedAt: Date,
  waitTime: Number, // in minutes
  status: { type: String, enum: ["waiting", "serving", "completed", "cancelled"], default: "waiting" },
});

module.exports = mongoose.model("QueueHistory", historySchema);