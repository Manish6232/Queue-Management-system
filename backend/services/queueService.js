const redis = require("../config/redis");
const Token = require("../models/Token");

exports.addToQueue = async (userName, queueId) => {
  const tokenNumber = await redis.incr(`queue:${queueId}:token`);

  await redis.rpush(`queue:${queueId}`, tokenNumber);

  const position = await redis.llen(`queue:${queueId}`);

  const avgTime = 5;
  const eta = position * avgTime;

  await Token.create({
    userName,
    queueId,
    tokenNumber
  });

  return { tokenNumber, position, eta };
};

exports.getNextToken = async (queueId) => {
  const tokenNumber = await redis.lpop(`queue:${queueId}`);

  if (!tokenNumber) return null;

  await Token.findOneAndUpdate(
    { tokenNumber, queueId },
    { status: "serving" }
  );

  return tokenNumber;
};