import express from "express";
import DonorApplication from "../models/DonorApplication.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Submit Donor Application (User)
router.post("/apply", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { bloodType, age, address, dateOfBirth, weight, city, state, zipCode, gender, medicalConditions, lastBloodDonationDate } = req.body;

    // Validate required fields
    if (!bloodType || !age || !address) {
      return res.status(400).json({ message: "Blood type, age, and address are required" });
    }

    // Check if user already has a pending or approved application
    const existingApplication = await DonorApplication.findOne({
      userId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingApplication) {
      if (existingApplication.status === "approved") {
        return res.status(400).json({ message: "You are already a verified donor" });
      }
      return res.status(400).json({ message: "You already have a pending donor application" });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate user has required fields
    if (!user.fullName || !user.email) {
      return res.status(400).json({ message: "User profile incomplete. Please complete your profile first." });
    }

    // Create donor application
    const application = new DonorApplication({
      userId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      bloodType,
      age,
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      address: address || user.address,
      weight: weight || user.weight,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      gender: gender || user.gender,
      medicalConditions: medicalConditions || user.medicalConditions,
      lastBloodDonationDate: lastBloodDonationDate || null,
    });

    await application.save();

    res.status(201).json({
      message: "Thank you for applying to become a Donor. You will be contacted very soon for verification.",
      application: {
        id: application._id,
        status: application.status,
        appliedAt: application.appliedAt,
      },
    });
  } catch (error) {
    console.error("Donor application error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Donor Application Status (User)
router.get("/application-status", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const application = await DonorApplication.findOne({ userId }).sort({ appliedAt: -1 });

    res.json({
      hasApplication: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error("Get application status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Verified Donors List (Accessible only to Verified Donors)
router.get("/list", auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Check if current user is a verified donor
    const user = await User.findById(userId);
    if (!user || !user.isDonor) {
      return res.status(403).json({
        message: "You do not have permission to view the Donor List. To access the Donor List, you must be a Verified Donor. Please become a Donor first to view other Donors' information.",
      });
    }

    // Get all verified donors
    const { bloodType, city, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { isDonor: true };
    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType;
    }
    if (city && city !== "all") {
      query.city = city;
    }

    const donors = await User.find(query)
      // Privacy: Only return essential donor information, exclude phone, email, and personal identifiers
      .select("fullName age bloodType lastDonation address city state")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      donors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get donors list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all donors (users with role 'donor') - Kept for backward compatibility
router.get("/", async (req, res) => {
  try {
    const donors = await User.find({ role: "donor" }).select("-password");
    res.status(200).json(donors);
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Protected route example
router.get("/profile", auth, (req, res) => {
  res.json({ message: "Protected donor profile route" });
});

export default router;
