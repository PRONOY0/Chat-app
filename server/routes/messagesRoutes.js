const { getMessages, uploadFile } = require("../controllers/messageController");
const { verifyToken } = require("../middlewares/AuthMiddleware");
const multer = require("multer");

const messageRoute = require("express").Router();

const uploads = multer({ dest: "uploads/files" });
messageRoute.post("/get-messages", verifyToken, getMessages);
messageRoute.post("/upload-file", verifyToken, uploads.single("file"), uploadFile);

module.exports = messageRoute;
