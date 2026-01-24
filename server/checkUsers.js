import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ isDonor: true });
    const nonDonors = await User.countDocuments({ isDonor: false });

    console.log(`\n📊 User Statistics:`);
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Donors (isDonor=true): ${totalDonors}`);
    console.log(`- Non-Donors (isDonor=false): ${nonDonors}`);

    console.log(`\n👥 All Donors:`);
    const donors = await User.find({ isDonor: true }).select("fullName email isDonor");
    donors.forEach((donor) => {
      console.log(`- ${donor.fullName} (${donor.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUsers();
