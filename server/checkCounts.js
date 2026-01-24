import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));
const Organization = mongoose.model("Organization", new mongoose.Schema({}, { strict: false }));

async function checkCounts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const orgCount = await Organization.countDocuments();
    const hospCount = await Hospital.countDocuments();
    
    console.log(`✅ Total Organizations in Database: ${orgCount}`);
    console.log(`✅ Total Hospitals in Database: ${hospCount}`);
    console.log(`✅ Total Sources: ${orgCount + hospCount}\n`);
    
    console.log("Sample Organizations:");
    const orgs = await Organization.find({}, { name: 1 }).limit(5);
    orgs.forEach(o => console.log(`  - ${o.name}`));
    
    console.log("\nSample Hospitals:");
    const hosps = await Hospital.find({}, { name: 1 }).limit(5);
    hosps.forEach(h => console.log(`  - ${h.name}`));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkCounts();
