import mongoose from "mongoose";
import dotenv from "dotenv";
import DonorApplication from "./models/DonorApplication.js";

dotenv.config();

const cleanupBadApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bloodbridge");

    // Delete applications with undefined fullName or email
    const result = await DonorApplication.deleteMany({
      $or: [{ fullName: undefined }, { email: undefined }, { fullName: null }, { email: null }]
    });

    console.log(`✅ Deleted ${result.deletedCount} malformed applications`);

    // Show remaining applications
    const allApps = await DonorApplication.find();
    console.log(`\n📊 Remaining Donor Applications: ${allApps.length}\n`);

    allApps.forEach((app) => {
      console.log(`  📋 ${app.fullName} (${app.email}) - Status: ${app.status}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Cleanup complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

cleanupBadApplications();
