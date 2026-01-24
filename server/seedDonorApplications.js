import mongoose from "mongoose";
import dotenv from "dotenv";
import DonorApplication from "./models/DonorApplication.js";
import User from "./models/User.js";

dotenv.config();

const seedDonorApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bloodbridge");

    // Clear existing test applications
    await DonorApplication.deleteMany({ email: { $in: ["testdonor1@test.com", "testdonor2@test.com", "testdonor3@test.com"] } });

    // Get some users to create applications for
    const users = await User.find().limit(3);

    if (users.length === 0) {
      console.log("No users found. Please create some users first.");
      process.exit(1);
    }

    const testApplications = [];

    // Create test applications
    for (let i = 0; i < Math.min(users.length, 3); i++) {
      const user = users[i];
      testApplications.push({
        userId: user._id,
        fullName: user.fullName || `Test Donor ${i + 1}`,
        email: user.email,
        phone: user.phone || "01700000000",
        bloodType: ["A+", "B+", "O+", "AB-"][i % 4],
        age: 25 + i,
        dateOfBirth: new Date(1998 + i, 5, 15),
        address: user.address || `123 Test Street ${i + 1}`,
        weight: 70 + i * 5,
        city: user.city || "Dhaka",
        state: user.state || "Dhaka",
        zipCode: user.zipCode || "1000",
        gender: ["male", "female"][i % 2],
        medicalConditions: i === 0 ? "None" : "None",
        status: i === 0 ? "pending" : i === 1 ? "approved" : "rejected",
        rejectionReason: i === 2 ? "Age requirement not met" : null,
        appliedAt: new Date(2026, 0, 14 - i),
      });
    }

    const result = await DonorApplication.insertMany(testApplications);
    console.log(`✅ Created ${result.length} test donor applications:`);
    result.forEach((app, idx) => {
      console.log(`  ${idx + 1}. ${app.fullName} (${app.email}) - Status: ${app.status}`);
    });

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding donor applications:", error);
    process.exit(1);
  }
};

seedDonorApplications();
