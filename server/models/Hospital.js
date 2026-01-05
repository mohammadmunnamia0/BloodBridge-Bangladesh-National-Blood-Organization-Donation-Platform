import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  emergencyHotline: {
    type: String,
    trim: true,
  },
  ambulance: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  approvedAt: {
    type: Date,
  },
  category: {
    type: String,
    default: "General Hospital",
  },
  description: {
    type: String,
  },
  bloodInventory: {
    "A+": { type: Number, default: 0 },
    "A-": { type: Number, default: 0 },
    "B+": { type: Number, default: 0 },
    "B-": { type: Number, default: 0 },
    "AB+": { type: Number, default: 0 },
    "AB-": { type: Number, default: 0 },
    "O+": { type: Number, default: 0 },
    "O-": { type: Number, default: 0 },
  },
  pricing: {
    bloodPrice: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    screeningFee: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    additionalFees: {
      crossMatching: { type: Number, default: 0 },
      storagePerDay: { type: Number, default: 0 },
    },
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
hospitalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Hospital = mongoose.models.Hospital || mongoose.model("Hospital", hospitalSchema);

export default Hospital;