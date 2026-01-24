import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BloodPurchase = mongoose.model("BloodPurchase", new mongoose.Schema({}, { strict: false }));
const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));

async function fixPurchase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const purchaseId = "6973d63606967dbb4c85d152";
    
    // Fix the purchase sourceType
    console.log("Fixing purchase sourceType...");
    await BloodPurchase.findByIdAndUpdate(purchaseId, {
      sourceType: "hospital"
    });
    console.log("✅ Updated purchase sourceType to 'hospital'\n");
    
    // Reduce hospital inventory
    console.log("Reducing hospital inventory...");
    const result = await Hospital.findByIdAndUpdate(
      "6973d1fd9365508a2f0f5adc",
      {
        $inc: { "bloodInventory.O+": -5 }
      },
      { new: true }
    );
    
    if (result) {
      console.log("✅ Hospital inventory reduced!");
      console.log("New O+ Stock:", result.bloodInventory["O+"]);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixPurchase();
