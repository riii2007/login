
const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/tokenModel");

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
    }

    const token = header.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    const revoked = await RevokedToken.exists({ token });

    if (revoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    req.user = { id: decoded.id };
    req.token = token;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    next(error);
  }
};

module.exports = authMiddleware;
