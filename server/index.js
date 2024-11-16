const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParseer = require("cookie-parser");
const { dbConnect } = require("./config/db");
const port = process.env.PORT || 3001;
const authRoutes = require("./routes/AuthRoutes");
const contactRoutes = require("./routes/ContactRoutes");
const { setupSocket } = require("./socket");
const messageRoute = require("./routes/messagesRoutes");
const channelRoutes = require("./routes/channelRoute");

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParseer());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/contacts", contactRoutes);

app.use("/api/messages", messageRoute);

app.use("/api/channel", channelRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

setupSocket(server);

dbConnect();
