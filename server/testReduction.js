import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));

async function testReduction() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const hospitalId = "6973c58cec697569d8554d2c";
    const bloodType = "AB+";
    const units = 5;

    console.log("Before reduction:");
    const before = await Hospital.findById(hospitalId);
    console.log(`${bloodType}: ${before.bloodInventory[bloodType]}`);

    console.log("\nAttempting reduction by ID...");
    const result = await Hospital.findByIdAndUpdate(
      hospitalId,
      {
        $inc: { [`bloodInventory.${bloodType}`]: -units }
      },
      { new: true }
    );

    if (result) {
      console.log("✅ Reduction successful!");
      console.log(`${bloodType}: ${result.bloodInventory[bloodType]}`);
    } else {
      console.log("❌ Reduction failed - hospital not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testReduction();
