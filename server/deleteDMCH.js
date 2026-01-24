import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));

async function deleteHospital() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const result = await Hospital.deleteOne({ name: "Dhaka Medical College Hospital (DMCH)" });
    
    if (result.deletedCount > 0) {
      console.log("✅ Deleted: Dhaka Medical College Hospital (DMCH)");
    } else {
      console.log("❌ Hospital not found in database");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

deleteHospital();
