const express = require("express");
const router = express.Router();

const {
  joinQueue,
  callNext,
  getQueueStatus,
  getTokenPosition,
  resetQueue
} = require("../controllers/queueController");

router.post("/join", joinQueue);
router.post("/next", callNext);
router.get("/status/:queueId", getQueueStatus);
router.get("/position/:queueId/:tokenNumber", getTokenPosition);
router.delete("/reset/:queueId", resetQueue);

module.exports = router;