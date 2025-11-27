import mongoose from "mongoose";

const bloodPurchaseSchema = new mongoose.Schema(
  {
    // Tracking number
    trackingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    
    // User who is purchasing
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Source of blood (either organization or hospital)
    sourceType: {
      type: String,
      required: true,
      enum: ["organization", "hospital"],
    },
    
    sourceName: {
      type: String,
      required: true,
    },
    
    sourceId: {
      type: Number,
      required: true,
    },
    
  // Blood details
  bloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  
  units: {
    type: Number,
    required: true,
    min: 1,
  },
  
  expiryDate: {
    type: Date,
    required: true,
  },    // Pricing breakdown
    pricing: {
      bloodPrice: {
        type: Number,
        required: true,
      },
      processingFee: {
        type: Number,
        required: true,
      },
      screeningFee: {
        type: Number,
        required: true,
      },
      serviceCharge: {
        type: Number,
        required: true,
      },
      additionalFees: {
        type: Object,
        default: {},
      },
      totalCost: {
        type: Number,
        required: true,
      },
    },
    
    // Patient information
    patientName: {
      type: String,
      required: true,
    },
    
    patientAge: {
      type: Number,
    },
    
    patientCondition: {
      type: String,
    },
    
    // Contact information
    contactName: {
      type: String,
      required: true,
    },
    
    contactPhone: {
      type: String,
      required: true,
    },
    
    contactEmail: {
      type: String,
    },
    
    // Urgency
    urgency: {
      type: String,
      required: true,
      enum: ["emergency", "urgent", "normal"],
      default: "normal",
    },
    
    // Required date
    requiredDate: {
      type: Date,
      required: true,
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ["pending", "verified", "confirmed", "ready", "completed", "cancelled"],
      default: "pending",
    },
    
    // Pickup/Delivery details
    pickupDetails: {
      address: String,
      date: Date,
      time: String,
      instructions: String,
    },
    
    // Payment details (for future)
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    
    paymentMethod: {
      type: String,
      enum: ["cash", "bKash", "nagad", "card", "online"],
    },
    
    // Notes and tracking
    adminNotes: {
      type: String,
    },
    
    userNotes: {
      type: String,
    },
    
    // Status history
    statusHistory: [
      {
        status: String,
        date: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
bloodPurchaseSchema.index({ purchasedBy: 1, status: 1 });
bloodPurchaseSchema.index({ sourceType: 1, sourceId: 1 });
bloodPurchaseSchema.index({ status: 1, requiredDate: 1 });

const BloodPurchase = mongoose.model("BloodPurchase", bloodPurchaseSchema);

export default BloodPurchase;
