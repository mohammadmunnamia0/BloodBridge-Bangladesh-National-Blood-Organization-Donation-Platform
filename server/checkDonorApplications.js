import mongoose from "mongoose";
import dotenv from "dotenv";
import DonorApplication from "./models/DonorApplication.js";

dotenv.config();

const checkDonorApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bloodbridge");

    const allApps = await DonorApplication.find();
    console.log(`\n📊 Total Donor Applications: ${allApps.length}\n`);

    if (allApps.length > 0) {
      console.log("Applications in Database:");
      allApps.forEach((app) => {
        console.log(`
  📋 ${app.fullName}
     Email: ${app.email}
     Status: ${app.status}
     Applied: ${new Date(app.appliedAt).toLocaleDateString()}
     ID: ${app._id}
        `);
      });
    } else {
      console.log("❌ No donor applications found in database!");
    }

    const pendingCount = await DonorApplication.countDocuments({ status: "pending" });
    const approvedCount = await DonorApplication.countDocuments({ status: "approved" });
    const rejectedCount = await DonorApplication.countDocuments({ status: "rejected" });

    console.log(`\n📈 Status Breakdown:`);
    console.log(`   Pending: ${pendingCount}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   Rejected: ${rejectedCount}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkDonorApplications();
