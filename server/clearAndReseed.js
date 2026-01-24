import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Hospital = mongoose.model("Hospital", new mongoose.Schema({}, { strict: false }));
const Organization = mongoose.model("Organization", new mongoose.Schema({}, { strict: false }));

async function clearAndReseed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    console.log("Deleting existing hospitals...");
    await Hospital.deleteMany({});
    console.log("Hospitals deleted");

    console.log("Deleting existing organizations...");
    await Organization.deleteMany({});
    console.log("Organizations deleted");

    console.log("Now run: node seedDemoData.js");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

clearAndReseed();
