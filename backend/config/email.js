const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"Queue System" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🔐 Your OTP Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background:#0f0f1a; padding:40px; border-radius:12px; max-width:500px; margin:auto;">
        <div style="text-align:center; margin-bottom:30px;">
          <h1 style="color:#6366f1; font-size:28px; margin:0;">Queue<span style="color:#a78bfa;">Pro</span></h1>
        </div>
        <div style="background:#1a1a2e; border:1px solid #2d2d44; border-radius:10px; padding:30px;">
          <h2 style="color:#ffffff; margin-top:0;">Hello, ${name}! 👋</h2>
          <p style="color:#9ca3af;">Use this OTP to verify your email address. Valid for <strong style="color:#a78bfa;">10 minutes</strong>.</p>
          <div style="background:#0f0f1a; border:2px dashed #6366f1; border-radius:8px; padding:20px; text-align:center; margin:20px 0;">
            <span style="font-size:42px; font-weight:900; color:#6366f1; letter-spacing:12px;">${otp}</span>
          </div>
          <p style="color:#6b7280; font-size:13px;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Queue System" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎉 Welcome to QueuePro!",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background:#0f0f1a; padding:40px; border-radius:12px; max-width:500px; margin:auto;">
        <div style="text-align:center; margin-bottom:30px;">
          <h1 style="color:#6366f1; font-size:32px; margin:0;">Queue<span style="color:#a78bfa;">Pro</span></h1>
        </div>
        <div style="background:#1a1a2e; border:1px solid #2d2d44; border-radius:10px; padding:30px;">
          <h2 style="color:#ffffff; margin-top:0;">Welcome aboard, ${name}! 🚀</h2>
          <p style="color:#9ca3af;">Your account has been <strong style="color:#22c55e;">successfully verified</strong>. You can now join queues, track your position in real-time, and receive instant updates.</p>
          <div style="background:#0f0f1a; border-radius:8px; padding:15px; margin:20px 0;">
            <p style="color:#a78bfa; margin:0; font-size:14px;">✅ Real-time position tracking</p>
            <p style="color:#a78bfa; margin:8px 0 0; font-size:14px;">✅ Smart ETA predictions</p>
            <p style="color:#a78bfa; margin:8px 0 0; font-size:14px;">✅ Instant notifications</p>
          </div>
          <a href="${process.env.CLIENT_URL}" style="display:block; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; text-align:center; padding:14px; border-radius:8px; text-decoration:none; font-weight:600; margin-top:20px;">Go to Dashboard →</a>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendWelcomeEmail };