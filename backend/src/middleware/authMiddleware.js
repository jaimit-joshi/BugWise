import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token is missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user — exclude password
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User account not found. Token may be invalid.",
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please log in again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication token.",
      });
    }

    console.error("[Auth Middleware] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Authentication failed.",
    });
  }
}

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
