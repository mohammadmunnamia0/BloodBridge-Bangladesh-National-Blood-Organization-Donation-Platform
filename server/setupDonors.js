import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import DonorApplication from "./models/DonorApplication.js";

dotenv.config();

async function setupDonors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Step 1: Clear all donor applications
    const deletedApps = await DonorApplication.deleteMany({});
    console.log(`\n🗑️  Deleted ${deletedApps.deletedCount} donor applications`);

    // Step 2: Create 5 test donors
    const testDonors = [
      {
        fullName: "Karim Rahman",
        email: "karim@example.com",
        phone: "01711111111",
        dateOfBirth: new Date("1990-01-15"),
        gender: "male",
        address: "123 Main St",
        city: "Dhaka",
        state: "Dhaka",
        zipCode: "1000",
        bloodType: "O+",
        weight: 70,
      },
      {
        fullName: "Fatima Khan",
        email: "fatima@example.com",
        phone: "01722222222",
        dateOfBirth: new Date("1992-03-20"),
        gender: "female",
        address: "456 Oak Ave",
        city: "Dhaka",
        state: "Dhaka",
        zipCode: "1100",
        bloodType: "A+",
        weight: 60,
      },
      {
        fullName: "Md Munna",
        email: "munna@example.com",
        phone: "01733333333",
        dateOfBirth: new Date("1988-05-10"),
        gender: "male",
        address: "789 Pine Rd",
        city: "Chittagong",
        state: "Chittagong",
        zipCode: "4000",
        bloodType: "B+",
        weight: 75,
      },
      {
        fullName: "Sarah Ahmed",
        email: "sarah@example.com",
        phone: "01744444444",
        dateOfBirth: new Date("1995-07-25"),
        gender: "female",
        address: "101 Elm St",
        city: "Sylhet",
        state: "Sylhet",
        zipCode: "3100",
        bloodType: "AB+",
        weight: 62,
      },
      {
        fullName: "Ali Hassan",
        email: "ali@example.com",
        phone: "01755555555",
        dateOfBirth: new Date("1987-09-08"),
        gender: "male",
        address: "202 Maple Dr",
        city: "Khulna",
        state: "Khulna",
        zipCode: "9000",
        bloodType: "O-",
        weight: 72,
      },
    ];

    // Delete existing test users
    await User.deleteMany({
      email: { $in: testDonors.map((d) => d.email) },
    });
    console.log("\n🗑️  Deleted existing test users");

    // Create new test users with isDonor = true
    const createdDonors = [];
    for (const donor of testDonors) {
      const user = new User({
        fullName: donor.fullName,
        email: donor.email,
        phone: donor.phone,
        dateOfBirth: donor.dateOfBirth,
        gender: donor.gender,
        address: donor.address,
        city: donor.city,
        state: donor.state,
        zipCode: donor.zipCode,
        bloodType: donor.bloodType,
        weight: donor.weight,
        isDonor: true,
        donorVerifiedAt: new Date(),
        password: "hashed_password_123",
      });

      const savedUser = await user.save();
      createdDonors.push(savedUser);
      console.log(`✅ Created donor: ${donor.fullName}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Deleted ${deletedApps.deletedCount} applications`);
    console.log(`- Created 5 verified donors`);
    console.log(`\n✨ All donors are now verified and ready to use!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupDonors();
