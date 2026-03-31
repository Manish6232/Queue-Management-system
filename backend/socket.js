let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("joinQueueRoom", (queueId) => {
        socket.join(queueId);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket not initialized");
    return io;
  }
};