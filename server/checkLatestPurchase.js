import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BloodPurchase = mongoose.model("BloodPurchase", new mongoose.Schema({}, { strict: false }));

async function checkLatestPurchase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const latestPurchase = await BloodPurchase.findOne({ 
      sourceName: "Dhaka Medical College Hospital (DMCH)" 
    }).sort({ createdAt: -1 });
    
    if (latestPurchase) {
      console.log("Latest Purchase from DMCH:");
      console.log("Purchase ID:", latestPurchase._id);
      console.log("Source ID:", latestPurchase.sourceId);
      console.log("Source Name:", latestPurchase.sourceName);
      console.log("Blood Type:", latestPurchase.bloodType);
      console.log("Units:", latestPurchase.units);
      console.log("Status:", latestPurchase.status);
      console.log("Inventory Reduced:", latestPurchase.inventoryReduced);
      console.log("Created:", latestPurchase.createdAt);
    } else {
      console.log("❌ No purchases found for DMCH");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkLatestPurchase();
