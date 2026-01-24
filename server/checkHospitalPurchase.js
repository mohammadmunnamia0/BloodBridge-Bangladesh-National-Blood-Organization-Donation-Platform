import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));
const BloodPurchase = mongoose.model("BloodPurchase", new mongoose.Schema({}, { strict: false }));

async function checkHospitalPurchase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    // Get latest hospital purchase
    const latestPurchase = await BloodPurchase.findOne({ 
      sourceType: "hospital",
      status: "completed"
    }).sort({ createdAt: -1 });
    
    if (latestPurchase) {
      console.log("Latest Completed Hospital Purchase:");
      console.log("Purchase ID:", latestPurchase._id);
      console.log("Source ID:", latestPurchase.sourceId);
      console.log("Source Name:", latestPurchase.sourceName);
      console.log("Blood Type:", latestPurchase.bloodType);
      console.log("Units:", latestPurchase.units);
      console.log("Inventory Reduced:", latestPurchase.inventoryReduced);
      console.log("Status:", latestPurchase.status);
      
      console.log("\n--- Checking Hospital in Database ---");
      
      // Try to find hospital by ID
      let hospital = await Hospital.findById(latestPurchase.sourceId);
      
      if (hospital) {
        console.log("✅ Found by ID:", hospital.name);
        console.log(`${latestPurchase.bloodType} Stock:`, hospital.bloodInventory[latestPurchase.bloodType]);
      } else {
        console.log("❌ NOT found by ID, trying by name...");
        
        // Try to find by name
        hospital = await Hospital.findOne({ name: latestPurchase.sourceName });
        
        if (hospital) {
          console.log("✅ Found by name:", hospital.name);
          console.log("Hospital ID in DB:", hospital._id);
          console.log("Purchase sourceId:", latestPurchase.sourceId);
          console.log(`${latestPurchase.bloodType} Stock:`, hospital.bloodInventory[latestPurchase.bloodType]);
        } else {
          console.log("❌ NOT found by name either!");
          console.log("\nAll hospitals in database:");
          const allHosps = await Hospital.find({}, { name: 1 });
          allHosps.forEach(h => console.log(`  - ${h.name}`));
        }
      }
    } else {
      console.log("❌ No completed hospital purchases found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkHospitalPurchase();
