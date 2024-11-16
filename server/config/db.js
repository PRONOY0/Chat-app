const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Successfully connected");
  } catch (error) {
    console.log("Failed due to:", error.message);
    process.exit(1);
  }
};
