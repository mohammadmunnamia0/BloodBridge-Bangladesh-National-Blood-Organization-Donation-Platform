import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));

async function checkInventory() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const dmch = await Hospital.findOne({ name: "Dhaka Medical College Hospital (DMCH)" });
    
    if (dmch) {
      console.log("✅ Found: Dhaka Medical College Hospital (DMCH)");
      console.log("ID:", dmch._id);
      console.log("\nBlood Inventory:");
      console.log(dmch.bloodInventory);
      console.log("\nAB+ Stock:", dmch.bloodInventory["AB+"]);
    } else {
      console.log("❌ Hospital NOT found in database!");
      console.log("\nAll hospitals in database:");
      const allHospitals = await Hospital.find({}, { name: 1 });
      allHospitals.forEach(h => console.log(`  - ${h.name}`));
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkInventory();
