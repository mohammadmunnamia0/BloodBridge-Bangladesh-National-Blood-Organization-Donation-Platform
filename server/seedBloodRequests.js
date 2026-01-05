import dotenv from "dotenv";
import mongoose from "mongoose";
import BloodRequest from "./models/BloodRequest.js";
import User from "./models/User.js";

dotenv.config();

const seedBloodRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get or create demo users
    let users = await User.find({ role: "donor" }).limit(5);
    
    if (users.length === 0) {
      console.log("No donor users found. Creating demo users...");

      const demoUsers = [
        {
          fullName: "Karim Rahman",
          email: "karim@example.com",
          phone: "01711111111",
          dateOfBirth: new Date("1990-05-15"),
          gender: "male",
          address: "123 Main Street, Dhaka",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          bloodType: "A+",
          weight: 65,
          role: "donor",
          password: "password123",
          isDemoUser: true,
        },
        {
          fullName: "Fatima Begum",
          email: "fatima@example.com",
          phone: "01722222222",
          dateOfBirth: new Date("1992-08-20"),
          gender: "female",
          address: "456 Green Road, Dhaka",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1205",
          bloodType: "B+",
          weight: 58,
          role: "donor",
          password: "password123",
          isDemoUser: true,
        },
        {
          fullName: "Rahim Ahmed",
          email: "rahim@example.com",
          phone: "01733333333",
          dateOfBirth: new Date("1988-03-10"),
          gender: "male",
          address: "789 Lake Road, Chittagong",
          city: "Chittagong",
          state: "Chittagong Division",
          zipCode: "4000",
          bloodType: "O+",
          weight: 72,
          role: "donor",
          password: "password123",
          isDemoUser: true,
        },
        {
          fullName: "Nasrin Khan",
          email: "nasrin@example.com",
          phone: "01744444444",
          dateOfBirth: new Date("1995-11-25"),
          gender: "female",
          address: "321 Park Avenue, Sylhet",
          city: "Sylhet",
          state: "Sylhet Division",
          zipCode: "3100",
          bloodType: "AB+",
          weight: 55,
          role: "donor",
          password: "password123",
          isDemoUser: true,
        },
        {
          fullName: "Hasan Ali",
          email: "hasan@example.com",
          phone: "01755555555",
          dateOfBirth: new Date("1987-07-30"),
          gender: "male",
          address: "654 River View, Rajshahi",
          city: "Rajshahi",
          state: "Rajshahi Division",
          zipCode: "6000",
          bloodType: "A-",
          weight: 68,
          role: "donor",
          password: "password123",
          isDemoUser: true,
        },
      ];

      for (const userData of demoUsers) {
        await User.create(userData);
      }
      
      users = await User.find({ role: "donor" }).limit(5);
      console.log(`✅ Created ${users.length} demo users`);
    } else {
      console.log(`✅ Found ${users.length} existing donor users`);
    }

    // Check if blood requests already exist
    const existingRequests = await BloodRequest.countDocuments();
    if (existingRequests > 0) {
      console.log(`Clearing ${existingRequests} existing blood requests...`);
      await BloodRequest.deleteMany({});
      console.log("✅ Cleared existing blood requests");
    }


    // Create demo blood requests
    const bloodRequests = [
      {
        patientName: "Abdul Karim",
        bloodType: "A+",
        units: 2,
        hospital: "Dhaka Medical College Hospital",
        reason: "Emergency surgery - accident victim",
        urgency: "emergency",
        contactName: "Dr. Rahman",
        contactPhone: "01711112233",
        requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        requestedBy: users[0]._id,
        status: "pending",
      },
      {
        patientName: "Mina Akter",
        bloodType: "O+",
        units: 3,
        hospital: "Square Hospital",
        reason: "Thalassemia treatment",
        urgency: "urgent",
        contactName: "Fatima Ahmed",
        contactPhone: "01722223344",
        requiredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        requestedBy: users[1]._id,
        status: "pending",
      },
      {
        patientName: "Rifat Hossain",
        bloodType: "B+",
        units: 1,
        hospital: "United Hospital Limited",
        reason: "Scheduled surgery",
        urgency: "normal",
        contactName: "Rahim Khan",
        contactPhone: "01733334455",
        requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        requestedBy: users[2]._id,
        status: "approved",
      },
      {
        patientName: "Sultana Begum",
        bloodType: "AB+",
        units: 2,
        hospital: "Evercare Hospital Dhaka",
        reason: "Maternal complications",
        urgency: "emergency",
        contactName: "Dr. Nasrin",
        contactPhone: "01744445566",
        requiredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        requestedBy: users[3]._id,
        status: "pending",
      },
      {
        patientName: "Jamal Uddin",
        bloodType: "A-",
        units: 2,
        hospital: "Bangabandhu Sheikh Mujib Medical University",
        reason: "Cancer treatment",
        urgency: "urgent",
        contactName: "Hasan Ali",
        contactPhone: "01755556677",
        requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        requestedBy: users[4]._id,
        status: "approved",
      },
      {
        patientName: "Ayesha Rahman",
        bloodType: "O-",
        units: 1,
        hospital: "Apollo Hospitals Dhaka",
        reason: "Road accident - emergency",
        urgency: "emergency",
        contactName: "Dr. Karim",
        contactPhone: "01766667788",
        requiredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        requestedBy: users[0]._id,
        status: "fulfilled",
      },
      {
        patientName: "Shamsul Alam",
        bloodType: "B-",
        units: 3,
        hospital: "Labaid Specialized Hospital",
        reason: "Kidney disease treatment",
        urgency: "normal",
        contactName: "Nasima Akter",
        contactPhone: "01777778899",
        requiredDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        requestedBy: users[1]._id,
        status: "pending",
      },
      {
        patientName: "Rabeya Khatun",
        bloodType: "AB-",
        units: 2,
        hospital: "BIRDEM General Hospital",
        reason: "Diabetes complication surgery",
        urgency: "urgent",
        contactName: "Dr. Fatema",
        contactPhone: "01788889900",
        requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        requestedBy: users[2]._id,
        status: "approved",
      },
      {
        patientName: "Shakib Hasan",
        bloodType: "A+",
        units: 1,
        hospital: "Holy Family Red Crescent Medical College Hospital",
        reason: "Dengue fever",
        urgency: "emergency",
        contactName: "Rahim Uddin",
        contactPhone: "01799990011",
        requiredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        requestedBy: users[3]._id,
        status: "pending",
      },
      {
        patientName: "Rahima Sultana",
        bloodType: "O+",
        units: 2,
        hospital: "National Institute of Cardiovascular Diseases",
        reason: "Heart surgery preparation",
        urgency: "normal",
        contactName: "Dr. Hasan",
        contactPhone: "01700001122",
        requiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        requestedBy: users[4]._id,
        status: "fulfilled",
      },
    ];

    // Insert blood requests
    for (const request of bloodRequests) {
      await BloodRequest.create(request);
    }

    console.log(`✅ Successfully created ${bloodRequests.length} demo blood requests`);
    console.log("\nBreakdown by status:");
    console.log(`- Pending: ${bloodRequests.filter(r => r.status === "pending").length}`);
    console.log(`- Approved: ${bloodRequests.filter(r => r.status === "approved").length}`);
    console.log(`- Fulfilled: ${bloodRequests.filter(r => r.status === "fulfilled").length}`);
    console.log("\nBreakdown by urgency:");
    console.log(`- Emergency: ${bloodRequests.filter(r => r.urgency === "emergency").length}`);
    console.log(`- Urgent: ${bloodRequests.filter(r => r.urgency === "urgent").length}`);
    console.log(`- Normal: ${bloodRequests.filter(r => r.urgency === "normal").length}`);

    console.log("\n🎉 Blood requests seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedBloodRequests();
