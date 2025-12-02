import express from "express";
import Hospital from "../models/Hospital.js";
import Organization from "../models/Organization.js";
import BloodRequest from "../models/BloodRequest.js";

const router = express.Router();

// Public route: Get all hospitals
router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    console.error("Hospitals fetch error:", error);
    res.status(500).json({
      message: "Error fetching hospitals",
      error: error.message,
    });
  }
});

// Public route: Get all organizations
router.get("/organizations", async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    const organizations = await Organization.find(query).sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    console.error("Organizations fetch error:", error);
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
});

// Public route: Get all blood requests
router.get("/blood-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate("requestedBy", "name email bloodType")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Blood requests fetch error:", error);
    res.status(500).json({
      message: "Error fetching blood requests",
      error: error.message,
    });
  }
});

export default router;
