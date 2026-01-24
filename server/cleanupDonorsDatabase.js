import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function cleanupDonors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // The 5 new donors we want to keep
    const keepDonorEmails = [
      "karim@example.com",
      "fatima@example.com",
      "munna@example.com",
      "sarah@example.com",
      "ali@example.com",
    ];

    // Find all users with isDonor = true
    const allDonors = await User.find({ isDonor: true });
    console.log(`\n📊 Found ${allDonors.length} total donors`);

    // Mark all donors as NOT donors
    const result = await User.updateMany({ isDonor: true }, { $set: { isDonor: false, donorVerifiedAt: null } });
    console.log(`\n✅ Marked ${result.modifiedCount} users as non-donors`);

    // Now set ONLY the 5 new donors as verified donors
    const updateResult = await User.updateMany(
      { email: { $in: keepDonorEmails } },
      { $set: { isDonor: true, donorVerifiedAt: new Date() } }
    );
    console.log(`✅ Re-verified ${updateResult.modifiedCount} new donors`);

    // Show final donors
    const finalDonors = await User.find({ isDonor: true }).select("fullName email isDonor");
    console.log("\n🎯 Final verified donors:");
    finalDonors.forEach((donor) => {
      console.log(`- ${donor.fullName} (${donor.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanupDonors();
