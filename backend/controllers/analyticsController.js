const QueueHistory = require("../models/QueueHistory");
const Token = require("../models/Token");
const redis = require("../config/redis");

exports.getAdminAnalytics = async (req, res) => {
  try {
    const queueId = req.params.queueId || "hospital1";

    const totalServed = await QueueHistory.countDocuments({ status: "completed" });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const servedToday = await QueueHistory.countDocuments({ status: "completed", servedAt: { $gte: todayStart } });
    const currentWaiting = await redis.llen(`queue:${queueId}`);

    const avgWaitData = await QueueHistory.aggregate([
      { $match: { status: "completed", waitTime: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$waitTime" } } },
    ]);
    const avgWaitTime = avgWaitData[0]?.avg?.toFixed(1) || 0;

    // Last 7 days served
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const count = await QueueHistory.countDocuments({ status: "completed", servedAt: { $gte: start, $lte: end } });
      weekData.push({ date: d.toLocaleDateString("en", { weekday: "short" }), count });
    }

    res.json({
      success: true,
      data: { totalServed, servedToday, currentWaiting, avgWaitTime, weekData },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const history = await QueueHistory.find({ userId: req.user.id })
      .sort({ joinedAt: -1 })
      .limit(20);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};