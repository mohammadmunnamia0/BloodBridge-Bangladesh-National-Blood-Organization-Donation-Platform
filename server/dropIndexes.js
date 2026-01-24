import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function dropIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    console.log("Dropping indexes on organizations...");
    await mongoose.connection.db.collection('organizations').dropIndexes();
    console.log("Indexes dropped on organizations");

    console.log("Dropping indexes on hospitals...");
    await mongoose.connection.db.collection('hospitals').dropIndexes();
    console.log("Indexes dropped on hospitals");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

dropIndexes();
