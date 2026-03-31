const express = require("express");
const router = express.Router();
const { getAdminAnalytics, getUserHistory } = require("../controllers/analyticsController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/admin/:queueId", verifyToken, isAdmin, getAdminAnalytics);
router.get("/history", verifyToken, getUserHistory);

module.exports = router;