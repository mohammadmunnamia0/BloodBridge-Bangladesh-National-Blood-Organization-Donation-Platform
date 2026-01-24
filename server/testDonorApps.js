const mongoose = require("mongoose");
require("dotenv").config();

const DonorApplication = require("./models/DonorApplication");

async function checkApps() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const allApps = await DonorApplication.find();
    console.log("\n📊 ALL APPLICATIONS:");
    console.log(`Total: ${allApps.length}`);
    allApps.forEach((app, i) => {
      console.log(`${i + 1}. ${app.fullName || "N/A"} - Status: ${app.status}`);
    });

    const pending = await DonorApplication.find({ status: "pending" });
    console.log("\n⏳ PENDING APPLICATIONS:");
    console.log(`Total Pending: ${pending.length}`);
    pending.forEach((app, i) => {
      console.log(`${i + 1}. ${app.fullName} - Email: ${app.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkApps();
