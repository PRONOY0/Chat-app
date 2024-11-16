const { compare } = require("bcrypt");
const Users = require("../model/UserModel");
const { renameSync, unlinkSync } = require("fs");

const maxAge = 3 * 24 * 60 * 60 * 1000;

const jwt = require("jsonwebtoken");

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password is required",
      });
    }

    const user = await Users.create({ email, password });

    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json({
      success: true,
      message: "Successfully created User",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password is required",
      });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with given email is not found",
      });
    }

    const auth = await compare(password, user.password);

    if (!auth) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      success: true,
      message: "Successfully Logged In",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        profileSetup: user.profileSetup,
        color: user.color,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const userData = await Users.findById(req.userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User with the given id not found",
      });
    }

    return res.status(200).json({
      success: true,
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      profileSetup: userData.profileSetup,
      color: userData.color,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const id = req.userId;
    console.log(req.body);

    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Firstname lastname aand color is required",
      });
    }

    const userData = await Users.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      color: userData.color,
      profileSetup: userData.profileSetup,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const date = Date.now();
    console.log(req.file.originalname);
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);

    const userData = await Users.findByIdAndUpdate(
      req.userId,
      {
        image: fileName,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      image: userData.image,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image removed successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });

    return res.status(200).send("Logged Out");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to log out",
    });
  }
};
