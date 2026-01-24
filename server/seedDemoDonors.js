import mongoose from "mongoose";
import User from "./models/User.js";

const demoDonors = [
  {
    fullName: "Ahmed Hassan",
    email: "ahmed.hassan@demo.com",
    phone: "01700000001",
    password: "demo123456",
    bloodType: "O+",
    dateOfBirth: new Date("1990-05-15"),
    weight: 75,
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1200",
    address: "Gulshan, Dhaka",
    gender: "male",
    medicalConditions: "None",
    isDonor: true,
    donorVerifiedAt: new Date(),
  },
  {
    fullName: "Fatima Begum",
    email: "fatima.begum@demo.com",
    phone: "01700000002",
    password: "demo123456",
    bloodType: "A+",
    dateOfBirth: new Date("1992-08-22"),
    weight: 62,
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1207",
    address: "Banani, Dhaka",
    gender: "female",
    medicalConditions: "None",
    isDonor: true,
    donorVerifiedAt: new Date(),
  },
  {
    fullName: "Mohammad Ali",
    email: "mohammad.ali@demo.com",
    phone: "01700000003",
    password: "demo123456",
    bloodType: "B+",
    dateOfBirth: new Date("1988-03-10"),
    weight: 82,
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1213",
    address: "Dhanmondi, Dhaka",
    gender: "male",
    medicalConditions: "Hypertension",
    isDonor: true,
    donorVerifiedAt: new Date(),
  },
  {
    fullName: "Nadia Islam",
    email: "nadia.islam@demo.com",
    phone: "01700000004",
    password: "demo123456",
    bloodType: "AB-",
    dateOfBirth: new Date("1995-11-30"),
    weight: 58,
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1220",
    address: "Mirpur, Dhaka",
    gender: "female",
    medicalConditions: "None",
    isDonor: true,
    donorVerifiedAt: new Date(),
  },
  {
    fullName: "Karim Khan",
    email: "karim.khan@demo.com",
    phone: "01700000005",
    password: "demo123456",
    bloodType: "O-",
    dateOfBirth: new Date("1985-07-18"),
    weight: 78,
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1230",
    address: "Uttara, Dhaka",
    gender: "male",
    medicalConditions: "None",
    isDonor: true,
    donorVerifiedAt: new Date(),
  },
  {
    fullName: "Sophia Das",
    email: "sophia.das@demo.com",
    phone: "01700000006",
    password: "demo123456",
    bloodType: "AB+",
    dateOfBirth: new Date("1993-02-14"),
    weight: 65,
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1208",
    address: "Mohakhali, Dhaka",
    gender: "female",
    medicalConditions: "Asthma",
    isDonor: true,
    donorVerifiedAt: new Date(),
  },
];

async function seedDemoDonors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bloodbridge");
    console.log("Connected to MongoDB");

    // Check if demo donors already exist
    const existingDemoDonors = await User.findOne({ email: "ahmed.hassan@demo.com" });

    if (existingDemoDonors) {
      console.log("Demo donors already seeded. Skipping...");
      await mongoose.connection.close();
      return;
    }

    // Insert demo donors
    const result = await User.insertMany(demoDonors);
    console.log(`Successfully seeded ${result.length} demo donors`);

    // Display seeded donors
    console.log("\nSeeded Demo Donors:");
    result.forEach((donor) => {
      console.log(`- ${donor.fullName} (${donor.bloodType}) - ${donor.city}`);
    });

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error seeding demo donors:", error);
    process.exit(1);
  }
}

seedDemoDonors();
