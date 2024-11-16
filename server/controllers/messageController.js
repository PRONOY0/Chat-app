const Messaage = require("../model/MessagesModel");
const fs = require("fs");

exports.getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      return res.status(400).json({
        success: false,
        message: "Both ID's are required.",
      });
    }

    const messages = await Messaage.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    console.log(req.file);

    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${req.file.originalname}`;

    fs.mkdirSync(fileDir, { recursive: true });

    fs.renameSync(req.file.path, fileName);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      filePath: fileName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
