const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  queueId: {
    type: String,
    required: true
  },
  tokenNumber: Number,
  status: {
    type: String,
    enum: ["waiting", "serving", "completed"],
    default: "waiting"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Token", tokenSchema);