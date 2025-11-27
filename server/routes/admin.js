import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import BloodPurchase from "../models/BloodPurchase.js";

const router = express.Router();

// Get dashboard statistics
router.get("/dashboard/stats", adminAuth, async (req, res) => {
  try {
    const totalPurchases = await BloodPurchase.countDocuments();
    const pendingApprovals = await BloodPurchase.countDocuments({
      status: "pending",
    });
    const completedPurchases = await BloodPurchase.countDocuments({
      status: "completed",
    });
    const inProgressPurchases = await BloodPurchase.countDocuments({
      status: { $in: ["verified", "confirmed", "ready"] },
    });

    // Calculate total revenue
    const revenueResult = await BloodPurchase.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$pricing.totalCost" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPurchases = await BloodPurchase.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      totalPurchases,
      pendingApprovals,
      completedPurchases,
      inProgressPurchases,
      totalRevenue,
      recentPurchases,
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
    // Blood type popularity
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

    // Urgency distribution
    const urgencyStats = await BloodPurchase.aggregate([
      {
        $group: {
          _id: "$urgency",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      bloodTypeStats,
      monthlyRevenue,
      sourceTypeStats,
      urgencyStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message,
    });
  }
});

export default router;
