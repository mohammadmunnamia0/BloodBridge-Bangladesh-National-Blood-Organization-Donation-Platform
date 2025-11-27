import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import BloodPurchase from "../models/BloodPurchase.js";

const router = express.Router();

// Generate unique tracking number
function generateTrackingNumber() {
  const prefix = "BL";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `${prefix}${timestamp}-${random}`;
}

// Create a new blood purchase request
router.post("/", auth, async (req, res) => {
  try {
    console.log("Received blood purchase data:", req.body);
    console.log("User from auth:", req.user);

    const {
      sourceType,
      sourceName,
      sourceId,
      bloodType,
      units,
      pricing,
      patientName,
      patientAge,
      patientCondition,
      contactName,
      contactPhone,
      contactEmail,
      urgency,
      requiredDate,
      userNotes,
    } = req.body;

    // Validate required fields
    if (
      !sourceType ||
      !sourceName ||
      !sourceId ||
      !bloodType ||
      !units ||
      !pricing ||
      !patientName ||
      !contactName ||
      !contactPhone ||
      !urgency ||
      !requiredDate
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Validate source type
    if (!["organization", "hospital"].includes(sourceType)) {
      return res.status(400).json({
        message: "Invalid source type. Must be 'organization' or 'hospital'",
      });
    }

    // Validate blood type
    const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        message: "Invalid blood type",
      });
    }

    // Validate urgency
    const validUrgencyLevels = ["emergency", "urgent", "normal"];
    if (!validUrgencyLevels.includes(urgency)) {
      return res.status(400).json({
        message: "Invalid urgency level",
      });
    }

    // Validate units
    const unitsNum = Number(units);
    if (isNaN(unitsNum) || unitsNum < 1) {
      return res.status(400).json({
        message: "Units must be a positive number",
      });
    }

    // Validate pricing
    if (
      !pricing.bloodPrice ||
      !pricing.processingFee ||
      !pricing.screeningFee ||
      !pricing.serviceCharge ||
      !pricing.totalCost
    ) {
      return res.status(400).json({
        message: "Incomplete pricing information",
      });
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();
    
    // Generate expiry date (35 days from now - typical blood storage duration)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 35);

    // Create new blood purchase
    const bloodPurchase = new BloodPurchase({
      trackingNumber,
      purchasedBy: req.userId,
      expiryDate,
      sourceType,
      sourceName,
      sourceId,
      bloodType,
      units: unitsNum,
      pricing,
      patientName,
      patientAge,
      patientCondition,
      contactName,
      contactPhone,
      contactEmail,
      urgency,
      requiredDate: new Date(requiredDate),
      userNotes,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          date: new Date(),
          note: "Purchase request submitted",
        },
      ],
    });

    await bloodPurchase.save();

    console.log("Blood purchase created successfully:", bloodPurchase._id);

    res.status(201).json({
      message: "Blood purchase request created successfully",
      purchase: bloodPurchase,
    });
  } catch (error) {
    console.error("Error creating blood purchase:", error);
    res.status(500).json({
      message: "Failed to create blood purchase request",
      error: error.message,
    });
  }
});

// Get all blood purchases for the logged-in user
router.get("/my-purchases", auth, async (req, res) => {
  try {
    const purchases = await BloodPurchase.find({
      purchasedBy: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      purchases,
      count: purchases.length,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
});

// Get a specific blood purchase by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID",
      });
    }

    const purchase = await BloodPurchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    // Check if the user owns this purchase
    if (purchase.purchasedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized to view this purchase",
      });
    }

    res.json({ purchase });
  } catch (error) {
    console.error("Error fetching purchase:", error);
    res.status(500).json({
      message: "Failed to fetch purchase",
      error: error.message,
    });
  }
});

// Update purchase status (for admins - simplified version)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, pickupDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID",
      });
    }

    const validStatuses = [
      "pending",
      "verified",
      "confirmed",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const purchase = await BloodPurchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    // Update status
    purchase.status = status;
    if (adminNotes) purchase.adminNotes = adminNotes;
    if (pickupDetails) purchase.pickupDetails = pickupDetails;

    // Add to status history
    purchase.statusHistory.push({
      status,
      date: new Date(),
      note: adminNotes || `Status updated to ${status}`,
    });

    await purchase.save();

    res.json({
      message: "Purchase status updated successfully",
      purchase,
    });
  } catch (error) {
    console.error("Error updating purchase status:", error);
    res.status(500).json({
      message: "Failed to update purchase status",
      error: error.message,
    });
  }
});

// Cancel a purchase
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID",
      });
    }

    const purchase = await BloodPurchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    // Check if the user owns this purchase
    if (purchase.purchasedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Unauthorized to cancel this purchase",
      });
    }

    // Check if purchase can be cancelled
    if (["completed", "cancelled"].includes(purchase.status)) {
      return res.status(400).json({
        message: `Cannot cancel a purchase that is ${purchase.status}`,
      });
    }

    purchase.status = "cancelled";
    purchase.statusHistory.push({
      status: "cancelled",
      date: new Date(),
      note: "Cancelled by user",
    });

    await purchase.save();

    res.json({
      message: "Purchase cancelled successfully",
      purchase,
    });
  } catch (error) {
    console.error("Error cancelling purchase:", error);
    res.status(500).json({
      message: "Failed to cancel purchase",
      error: error.message,
    });
  }
});

// Get all purchases (for admin - simplified)
router.get("/", auth, async (req, res) => {
  try {
    const { status, sourceType, bloodType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType;
    if (bloodType) filter.bloodType = bloodType;

    const purchases = await BloodPurchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      purchases,
      count: purchases.length,
    });
  } catch (error) {
    console.error("Error fetching all purchases:", error);
    res.status(500).json({
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
});

export default router;
