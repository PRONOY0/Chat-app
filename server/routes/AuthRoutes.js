const express = require("express");
const authRoutes = express.Router();
const multer = require("multer");

const upload = multer({ dest: "uploads/profiles/" });

const {
  signup,
  login,
  getUserInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logout,
} = require("../controllers/AuthController");
const { verifyToken } = require("../middlewares/AuthMiddleware");

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);
authRoutes.post("/logout", verifyToken, logout);

authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);

module.exports = authRoutes;
