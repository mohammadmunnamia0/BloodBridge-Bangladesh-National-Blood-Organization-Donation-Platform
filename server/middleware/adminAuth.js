import jwt from "jsonwebtoken";

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
      process.env.JWT_SECRET
    );

    // Check if it's an admin token (has adminId or role)
    if (!decoded.adminId && !decoded.role) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    // Attach admin info to request
    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    req.organizationId = decoded.organizationId;
    req.hospitalId = decoded.hospitalId;
    
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};

export default adminAuth;
