const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not authenticated",
    });
  }

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token is not valid",
      });
    }

    req.userId = payload.userId;
    next();
  });
};
