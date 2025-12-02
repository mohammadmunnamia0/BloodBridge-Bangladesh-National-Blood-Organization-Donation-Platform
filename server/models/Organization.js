import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Blood Bank", "Medical Center", "Healthcare Organization", "NGO", "Foundation", "national", "hospital", "digital"],
  },
  contact: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  website: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
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
    bloodPrice: { type: Number, required: true },
    processingFee: { type: Number, required: true },
    screeningFee: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
  },
  icon: {
    type: String,
    default: "🏢",
  },
  isActive: {
    type: Boolean,
    default: false, // Only active after approval
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  approvedAt: {
    type: Date,
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

// Hash password before saving
organizationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    this.updatedAt = Date.now();
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
organizationSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

export default Organization;
