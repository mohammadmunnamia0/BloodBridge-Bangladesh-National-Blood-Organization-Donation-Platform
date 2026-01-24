import mongoose from "mongoose";

const donorApplicationSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },

  // Application Details
  bloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  age: {
    type: Number,
    required: true,
    min: 16,
    max: 120,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  weight: {
    type: Number,
    min: 45,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  medicalConditions: {
    type: String,
    trim: true,
  },
  lastBloodDonationDate: {
    type: Date,
    default: null,
  },

  // Application Status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
    trim: true,
  },

  // Admin Review Info
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  reviewedAt: {
    type: Date,
  },

  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("DonorApplication", donorApplicationSchema);
