const queueService = require("../services/queueService");
const socket = require("../socket");
const redis = require("../config/redis");

/**
 * @desc Join Queue
 * @route POST /api/queue/join
 */
exports.joinQueue = async (req, res, next) => {
  try {
    const { userName, queueId } = req.body;

    if (!userName || !queueId) {
      return res.status(400).json({
        success: false,
        message: "userName and queueId are required"
      });
    }

    // Add user to queue (service layer)
    const result = await queueService.addToQueue(userName, queueId);

    const io = socket.getIO();

    // Emit update only to that queue room
    io.to(queueId).emit("queueUpdated", {
      queueId,
      ...result
    });

    res.status(201).json({
      success: true,
      message: "Joined queue successfully",
      data: result
    });

  } catch (err) {
    next(err);
  }
};


/**
 * @desc Call Next Token (Admin)
 * @route POST /api/queue/next
 */
exports.callNext = async (req, res, next) => {
  try {
    const { queueId } = req.body;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: "queueId is required"
      });
    }

    const tokenNumber = await queueService.getNextToken(queueId);

    if (!tokenNumber) {
      return res.status(200).json({
        success: true,
        message: "Queue is empty"
      });
    }

    const io = socket.getIO();

    // Emit token called event
    io.to(queueId).emit("tokenCalled", {
      queueId,
      tokenNumber
    });

    res.status(200).json({
      success: true,
      message: "Next token called",
      tokenNumber
    });

  } catch (err) {
    next(err);
  }
};


/**
 * @desc Get Queue Status (position, length)
 * @route GET /api/queue/status/:queueId
 */
exports.getQueueStatus = async (req, res, next) => {
  try {
    const { queueId } = req.params;

    const length = await redis.llen(`queue:${queueId}`);

    res.status(200).json({
      success: true,
      queueId,
      totalPeopleInQueue: length
    });

  } catch (err) {
    next(err);
  }
};


/**
 * @desc Get Token Position
 * @route GET /api/queue/position/:queueId/:tokenNumber
 */
exports.getTokenPosition = async (req, res, next) => {
  try {
    const { queueId, tokenNumber } = req.params;

    // Get full queue
    const queue = await redis.lrange(`queue:${queueId}`, 0, -1);

    // Find position
    const position = queue.findIndex(
      (t) => t == tokenNumber
    );

    if (position === -1) {
      return res.status(404).json({
        success: false,
        message: "Token not found in queue"
      });
    }

    const avgTime = 5;
    const eta = (position + 1) * avgTime;

    res.status(200).json({
      success: true,
      queueId,
      tokenNumber,
      position: position + 1,
      eta
    });

  } catch (err) {
    next(err);
  }
};


/**
 * @desc Reset Queue (Admin / Testing)
 * @route DELETE /api/queue/reset/:queueId
 */
exports.resetQueue = async (req, res, next) => {
  try {
    const { queueId } = req.params;

    await redis.del(`queue:${queueId}`);
    await redis.del(`queue:${queueId}:token`);

    const io = socket.getIO();

    io.to(queueId).emit("queueReset", {
      queueId
    });

    res.status(200).json({
      success: true,
      message: "Queue reset successfully"
    });

  } catch (err) {
    next(err);
  }
};