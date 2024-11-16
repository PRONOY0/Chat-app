const {
  createChannel,
  getUserChannels,
  getChannelMessages,
} = require("../controllers/ChannelController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

const channelRoutes = require("express").Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);

module.exports = channelRoutes;
