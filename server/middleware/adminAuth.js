import jwt from "jsonwebtoken";
import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "No authentication token, access denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "bloodservice_secret_key_2024"
    );

    // Find user and check if admin
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};

export default adminAuth;
