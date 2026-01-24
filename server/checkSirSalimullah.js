import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BloodPurchase = mongoose.model("BloodPurchase", new mongoose.Schema({}, { strict: false }));
const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));

async function checkSirSalimullah() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    // Find the purchase
    const purchase = await BloodPurchase.findOne({
      sourceName: "Sir Salimullah Medical College Hospital",
      bloodType: "O+",
      units: 5
    }).sort({ createdAt: -1 });
    
    if (purchase) {
      console.log("Purchase Details:");
      console.log("ID:", purchase._id);
      console.log("Source Name:", purchase.sourceName);
      console.log("Source Type:", purchase.sourceType, purchase.sourceType === "organization" ? "❌ WRONG!" : "✅");
      console.log("Source ID:", purchase.sourceId);
      console.log("Blood Type:", purchase.bloodType);
      console.log("Units:", purchase.units);
      console.log("Status:", purchase.status);
      console.log("Inventory Reduced:", purchase.inventoryReduced);
      
      // Check if hospital exists
      console.log("\n--- Checking Hospital ---");
      const hospital = await Hospital.findOne({ name: "Sir Salimullah Medical College Hospital" });
      
      if (hospital) {
        console.log("✅ Hospital found in database");
        console.log("Hospital ID:", hospital._id);
        console.log("O+ Stock:", hospital.bloodInventory["O+"]);
        
        if (purchase.sourceType === "organization") {
          console.log("\n❌ PROBLEM: Purchase saved as 'organization' but should be 'hospital'");
          console.log("This is why inventory didn't reduce!");
        }
      } else {
        console.log("❌ Hospital NOT found");
      }
    } else {
      console.log("❌ Purchase not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSirSalimullah();
