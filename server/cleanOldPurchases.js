import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BloodPurchase = mongoose.model("BloodPurchase", new mongoose.Schema({}, { strict: false }));

async function cleanOldPurchases() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    // Delete all purchases with invalid sourceId (demo IDs)
    const result = await BloodPurchase.deleteMany({
      sourceId: { $regex: /^demo-|^[0-9]+$/ }
    });
    
    console.log(`✅ Deleted ${result.deletedCount} old purchases with demo IDs`);
    
    // Show remaining purchases
    const remaining = await BloodPurchase.countDocuments();
    console.log(`Remaining purchases: ${remaining}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanOldPurchases();
