import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin.js";
import Organization from "./models/Organization.js";
import Hospital from "./models/Hospital.js";

dotenv.config();

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing admins, organizations, hospitals
    await Admin.deleteMany({});
    await Organization.deleteMany({});
    await Hospital.deleteMany({});
    console.log("Cleared existing data");

    // Create multiple organizations
    const redCrescent = await Organization.create({
      name: "Bangladesh Red Crescent Society",
      category: "national",
      email: "info@bdrcs.org",
      phone: "+880-2-9330188",
      address: "684-686, Bara Maghbazar, Dhaka-1217",
      bloodInventory: {
        "A+": 150,
        "A-": 30,
        "B+": 120,
        "B-": 25,
        "AB+": 40,
        "AB-": 15,
        "O+": 200,
        "O-": 50,
      },
      pricing: {
        bloodPrice: 1200,
        processingFee: 300,
        screeningFee: 200,
        serviceCharge: 100,
      },
      icon: "🏥",
      isActive: true,
    });

    const quantumFoundation = await Organization.create({
      name: "Quantum Foundation",
      category: "national",
      email: "info@quantumfoundation.org",
      phone: "+880-2-8189091",
      address: "Quantum Tower, 38/2 Lake Circus, Kalabagan, Dhaka-1205",
      bloodInventory: {
        "A+": 200,
        "A-": 45,
        "B+": 180,
        "B-": 35,
        "AB+": 60,
        "AB-": 25,
        "O+": 250,
        "O-": 70,
      },
      pricing: {
        bloodPrice: 1000,
        processingFee: 250,
        screeningFee: 150,
        serviceCharge: 100,
      },
      icon: "🏥",
      isActive: true,
    });

    const sandhaniDhaka = await Organization.create({
      name: "Sandhani Dhaka",
      category: "national",
      email: "sandhani@du.ac.bd",
      phone: "+880-2-9661900",
      address: "Dhaka University, Dhaka-1000",
      bloodInventory: {
        "A+": 100,
        "A-": 20,
        "B+": 90,
        "B-": 18,
        "AB+": 30,
        "AB-": 12,
        "O+": 150,
        "O-": 40,
      },
      pricing: {
        bloodPrice: 1100,
        processingFee: 200,
        screeningFee: 150,
        serviceCharge: 50,
      },
      icon: "🏥",
      isActive: true,
    });

    const evercare = await Hospital.create({
      name: "Evercare Hospital Dhaka",
      email: "info@evercarebd.com",
      phone: "+880-9666710678",
      emergencyHotline: "+880-9666710678",
      ambulance: "+880-9666710678",
      address: "Plot 81, Block E, Bashundhara R/A, Dhaka 1229",
      bloodInventory: {
        "A+": 80,
        "A-": 20,
        "B+": 70,
        "B-": 15,
        "AB+": 25,
        "AB-": 10,
        "O+": 100,
        "O-": 30,
      },
      pricing: {
        bloodPrice: 1500,
        processingFee: 400,
        screeningFee: 250,
        serviceCharge: 150,
        additionalFees: {
          crossMatching: 500,
          urgentProcessing: 800,
        },
      },
      isActive: true,
    });

    console.log("Created organizations and hospitals");

    // Create super admin
    const superAdmin = await Admin.create({
      username: "superadmin",
      password: "super@123",
      name: "Super Administrator",
      email: "super@bloodbridge.com",
      role: "super_admin",
      permissions: "all",
      isActive: true,
    });

    // Create ONE shared org admin account (no specific organization assigned yet)
    const orgAdmin = await Admin.create({
      username: "orgadmin",
      password: "org@123",
      name: "Organization Admin",
      email: "admin@organization.com",
      role: "org_admin",
      permissions: "limited",
      isActive: true,
    });

    // Create hospital admin
    const hospitalAdmin = await Admin.create({
      username: "hospitaladmin",
      password: "hospital@123",
      name: "Evercare Admin",
      email: "admin@evercarebd.com",
      role: "hospital_admin",
      permissions: "limited",
      hospitalId: evercare._id,
      isActive: true,
    });

    // Update hospital with admin reference
    await Hospital.findByIdAndUpdate(evercare._id, { adminId: hospitalAdmin._id });

    console.log("✅ Seeding completed successfully!");
    console.log("\nAdmin Credentials:");
    console.log("==================");
    console.log("Super Admin:");
    console.log("  Username: superadmin");
    console.log("  Password: super@123");
    console.log("\nOrganization Admin (Shared for all organizations):");
    console.log("  Username: orgadmin");
    console.log("  Password: org@123");
    console.log("  Note: Select organization during login");
    console.log("\nAvailable Organizations:");
    console.log("  - Bangladesh Red Crescent Society");
    console.log("  - Quantum Foundation");
    console.log("  - Sandhani Dhaka");
    console.log("\nHospital Admin (Evercare):");
    console.log("  Username: hospitaladmin");
    console.log("  Password: hospital@123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedAdmins();
