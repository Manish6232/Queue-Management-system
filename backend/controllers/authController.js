const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTPEmail, sendWelcomeEmail } = require("../config/email");

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ========================
// SIGNUP
// ========================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// VERIFY OTP
// ========================
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: "OTP expired. Request new one." });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    const token = generateToken(user);
    res.json({
      success: true,
      message: "Email verified!",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// RESEND OTP
// ========================
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp, user.name);
    res.json({ success: true, message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================
// LOGIN
// ========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Email not verified",
        userId: user._id,
        needsVerification: true,
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};