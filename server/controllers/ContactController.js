const mongoose = require("mongoose");
const Users = require("../model/UserModel");
const Message = require("../model/MessagesModel");

exports.searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;

    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).json({
        success: false,
        message: "Search Term is required",
      });
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await Users.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getContactsForDMList = async (req, res, next) => {
  try {
    let { userId } = req;

    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAllContacts = async (req, res, next) => {
  try {
    const users = await Users.find(
      { _id: { $ne: req.userId } },
      "firstName lastName _id"
    );

    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
