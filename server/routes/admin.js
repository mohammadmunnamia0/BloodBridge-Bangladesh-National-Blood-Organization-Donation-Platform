import express from "express";
import jwt from "jsonwebtoken";
import adminAuth from "../middleware/adminAuth.js";
import BloodPurchase from "../models/BloodPurchase.js";
import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Organization from "../models/Organization.js";
import mongoose from "mongoose";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("Admin login attempt:", { username, passwordLength: password?.length });
    
    // For now, simple hardcoded check for super admin
    // In production, this should query the Admin model
    if (username === "superadmin" && password === "super@123") {
      const token = jwt.sign(
        { adminId: "superadmin", role: "super_admin" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      console.log("Login successful, token generated");
      
      return res.json({
        token,
        admin: {
          id: "superadmin",
          username: "superadmin",
          name: "Super Administrator",
          role: "super_admin",
          permissions: "all",
        },
      });
    }

    console.log("Login failed: Invalid credentials");
    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard statistics
router.get("/dashboard/stats", adminAuth, async (req, res) => {
  try {
    // Blood Purchase Stats
    const totalPurchases = await BloodPurchase.countDocuments();
    const pendingPurchases = await BloodPurchase.countDocuments({
      status: "pending",
    });
    const completedPurchases = await BloodPurchase.countDocuments({
      status: "completed",
    });
    const inProgressPurchases = await BloodPurchase.countDocuments({
      status: { $in: ["verified", "confirmed", "ready"] },
    });

    // Blood Request Stats
    const totalBloodRequests = await BloodRequest.countDocuments();
    const pendingBloodRequests = await BloodRequest.countDocuments({
      status: "pending",
    });
    const approvedBloodRequests = await BloodRequest.countDocuments({
      status: "approved",
    });
    const fulfilledBloodRequests = await BloodRequest.countDocuments({
      status: "fulfilled",
    });

    // User Stats
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: "donor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Calculate total revenue
    const revenueResult = await BloodPurchase.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$pricing.totalCost" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Calculate monthly revenue
    const monthlyRevenueResult = await BloodPurchase.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$pricing.totalCost" } } },
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPurchases = await BloodPurchase.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentRequests = await BloodRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Blood type distribution from requests
    const bloodTypeDistribution = await BloodRequest.aggregate([
      {
        $group: {
          _id: "$bloodType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      // Purchase Stats
      totalPurchases,
      pendingPurchases,
      completedPurchases,
      inProgressPurchases,
      
      // Blood Request Stats
      totalBloodRequests,
      pendingBloodRequests,
      approvedBloodRequests,
      fulfilledBloodRequests,
      
      // User Stats
      totalUsers,
      totalDonors,
      totalAdmins,
      
      // Revenue
      totalRevenue: `৳${totalRevenue.toLocaleString()}`,
      monthlyRevenue: `৳${monthlyRevenue.toLocaleString()}`,
      
      // Recent Activity
      recentPurchases,
      recentRequests,
      recentUsers,
      
      // Blood Type Distribution
      bloodTypeDistribution,
      
      // Legacy fields for backward compatibility
      pendingApprovals: pendingPurchases,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
});

// Get all purchases with filters (for admin)
router.get("/purchases", adminAuth, async (req, res) => {
  try {
    const {
      status,
      sourceType,
      bloodType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (sourceType && sourceType !== "all") {
      query.sourceType = sourceType;
    }

    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await BloodPurchase.find(query)
      .populate("purchasedBy", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BloodPurchase.countDocuments(query);

    res.json({
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Admin purchases fetch error:", error);
    res.status(500).json({
      message: "Error fetching purchases",
      error: error.message,
    });
  }
});

// Update purchase status (admin)
router.patch("/purchases/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, pickupDetails } = req.body;

    const updateData = {
      status,
      ...(adminNotes && { adminNotes }),
      ...(pickupDetails && { pickupDetails }),
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          updatedBy: req.userId,
          notes: adminNotes,
        },
      },
    };

    const purchase = await BloodPurchase.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("purchasedBy", "fullName email phone");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json({
      message: "Purchase status updated successfully",
      purchase,
    });
  } catch (error) {
    console.error("Purchase status update error:", error);
    res.status(500).json({
      message: "Error updating purchase status",
      error: error.message,
    });
  }
});

// Get analytics data
router.get("/analytics", adminAuth, async (req, res) => {
  try {
    // Blood type popularity from purchases
    const bloodTypeStats = await BloodPurchase.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$bloodType",
          count: { $sum: 1 },
          totalUnits: { $sum: "$units" },
          totalRevenue: { $sum: "$pricing.totalCost" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly revenue
    const monthlyRevenue = await BloodPurchase.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$pricing.totalCost" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    // Source type performance
    const sourceTypeStats = await BloodPurchase.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$sourceType",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.totalCost" },
        },
      },
    ]);

    // Urgency distribution from purchases
    const urgencyStats = await BloodPurchase.aggregate([
      {
        $group: {
          _id: "$urgency",
          count: { $sum: 1 },
        },
      },
    ]);

    // Blood request urgency distribution
    const requestUrgencyStats = await BloodRequest.aggregate([
      {
        $group: {
          _id: "$urgency",
          count: { $sum: 1 },
        },
      },
    ]);

    // Donor blood type distribution
    const donorBloodTypeStats = await User.aggregate([
      { $match: { role: "donor" } },
      {
        $group: {
          _id: "$bloodType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      bloodTypeStats,
      monthlyRevenue,
      sourceTypeStats,
      urgencyStats,
      requestUrgencyStats,
      donorBloodTypeStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message,
    });
  }
});

// Get all donors
router.get("/donors", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, bloodType, city } = req.query;

    const query = { role: "donor" };
    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType;
    }
    if (city && city !== "all") {
      query.city = new RegExp(city, "i");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donors = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      donors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Donors fetch error:", error);
    res.status(500).json({
      message: "Error fetching donors",
      error: error.message,
    });
  }
});

// Get all users (donors + regular users)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;

    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (status) {
      query.isBanned = status === "banned";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// Ban/Unban user
router.patch("/users/:id/ban", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned, banReason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isBanned, 
        banReason: isBanned ? banReason : null,
        bannedAt: isBanned ? new Date() : null,
        bannedBy: isBanned ? req.userId : null
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: isBanned ? "User banned successfully" : "User unbanned successfully",
      user,
    });
  } catch (error) {
    console.error("User ban error:", error);
    res.status(500).json({
      message: "Error updating user status",
      error: error.message,
    });
  }
});

// Get all blood requests
router.get("/blood-requests", adminAuth, async (req, res) => {
  try {
    const { status, bloodType, urgency, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType;
    }
    if (urgency && urgency !== "all") {
      query.urgency = urgency;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await BloodRequest.find(query)
      .populate("requestedBy", "fullName email phone bloodType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BloodRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Blood requests fetch error:", error);
    res.status(500).json({
      message: "Error fetching blood requests",
      error: error.message,
    });
  }
});

// Update blood request status
router.patch("/blood-requests/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await BloodRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("requestedBy", "fullName email phone");

    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    res.json({
      message: "Blood request status updated successfully",
      request,
    });
  } catch (error) {
    console.error("Blood request status update error:", error);
    res.status(500).json({
      message: "Error updating blood request status",
      error: error.message,
    });
  }
});

// Hospital Management Routes
// Get all hospitals
router.get("/hospitals", adminAuth, async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json({ hospitals });
  } catch (error) {
    console.error("Hospitals fetch error:", error);
    res.status(500).json({
      message: "Error fetching hospitals",
      error: error.message,
    });
  }
});

// Create hospital
router.post("/hospitals", adminAuth, async (req, res) => {
  try {
    // Set default values for admin-created hospitals
    const hospitalData = {
      ...req.body,
      isActive: true,
      status: "approved",
      approvedBy: req.admin._id,
      approvedAt: new Date(),
    };
    
    // Set default password if not provided
    if (!hospitalData.password) {
      hospitalData.password = "hospital123"; // Default password
    }
    
    console.log("Creating hospital with data:", hospitalData);
    const hospital = new Hospital(hospitalData);
    await hospital.save();
    res.status(201).json({
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    console.error("Hospital creation error:", error);
    res.status(500).json({
      message: "Error creating hospital",
      error: error.message,
    });
  }
});

// Update hospital
router.patch("/hospitals/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (error) {
    console.error("Hospital update error:", error);
    res.status(500).json({
      message: "Error updating hospital",
      error: error.message,
    });
  }
});

// Delete hospital
router.delete("/hospitals/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndDelete(id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    console.error("Hospital deletion error:", error);
    res.status(500).json({
      message: "Error deleting hospital",
      error: error.message,
    });
  }
});

// Organization Management
// Get all organizations
router.get("/organizations", adminAuth, async (req, res) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    res.json({ organizations });
  } catch (error) {
    console.error("Organizations fetch error:", error);
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
});

// Create organization
router.post("/organizations", adminAuth, async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();
    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    console.error("Organization creation error:", error);
    res.status(500).json({
      message: "Error creating organization",
      error: error.message,
    });
  }
});

// Update organization
router.patch("/organizations/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    console.error("Organization update error:", error);
    res.status(500).json({
      message: "Error updating organization",
      error: error.message,
    });
  }
});

// Delete organization
router.delete("/organizations/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Organization deletion error:", error);
    res.status(500).json({
      message: "Error deleting organization",
      error: error.message,
    });
  }
});

// Update hospital inventory
router.patch("/hospitals/:id/inventory", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodInventory } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { bloodInventory },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      message: "Hospital inventory updated successfully",
      hospital,
    });
  } catch (error) {
    console.error("Hospital inventory update error:", error);
    res.status(500).json({
      message: "Error updating hospital inventory",
      error: error.message,
    });
  }
});

// Update organization inventory
router.patch("/organizations/:id/inventory", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodInventory } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { bloodInventory },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      message: "Organization inventory updated successfully",
      organization,
    });
  } catch (error) {
    console.error("Organization inventory update error:", error);
    res.status(500).json({
      message: "Error updating organization inventory",
      error: error.message,
    });
  }
});

// Update hospital pricing
router.patch("/hospitals/:id/pricing", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { pricing, additionalFees } = req.body;

    const updateData = {};
    if (pricing) updateData.pricing = pricing;
    if (additionalFees) updateData.additionalFees = additionalFees;

    const hospital = await Hospital.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      message: "Hospital pricing updated successfully",
      hospital,
    });
  } catch (error) {
    console.error("Hospital pricing update error:", error);
    res.status(500).json({
      message: "Error updating hospital pricing",
      error: error.message,
    });
  }
});

// Update organization pricing
router.patch("/organizations/:id/pricing", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { pricing } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { pricing },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      message: "Organization pricing updated successfully",
      organization,
    });
  } catch (error) {
    console.error("Organization pricing update error:", error);
    res.status(500).json({
      message: "Error updating organization pricing",
      error: error.message,
    });
  }
});

// Get platform overview
router.get("/overview", adminAuth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const todayPurchases = await BloodPurchase.countDocuments({
      createdAt: { $gte: startOfDay },
    });
    const todayRequests = await BloodRequest.countDocuments({
      createdAt: { $gte: startOfDay },
    });
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: startOfDay },
    });

    // Weekly stats
    const weeklyPurchases = await BloodPurchase.countDocuments({
      createdAt: { $gte: startOfWeek },
    });
    const weeklyRequests = await BloodRequest.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    // Monthly stats
    const monthlyPurchases = await BloodPurchase.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const monthlyRevenue = await BloodPurchase.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$pricing.totalCost" } } },
    ]);

    res.json({
      today: {
        purchases: todayPurchases,
        requests: todayRequests,
        newUsers: todayUsers,
      },
      weekly: {
        purchases: weeklyPurchases,
        requests: weeklyRequests,
      },
      monthly: {
        purchases: monthlyPurchases,
        revenue: monthlyRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Overview fetch error:", error);
    res.status(500).json({
      message: "Error fetching overview",
      error: error.message,
    });
  }
});

export default router;
