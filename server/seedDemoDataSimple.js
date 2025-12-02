import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "./models/Organization.js";
import Hospital from "./models/Hospital.js";
import User from "./models/User.js";
import BloodRequest from "./models/BloodRequest.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Organization.deleteMany({});
    await Hospital.deleteMany({});
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    console.log("Cleared existing data");

    // Seed Organizations
    const organizations = [
      {
        name: "Bangladesh Red Crescent Society",
        email: "blood@bdrcs.org",
        phone: "09611-671100",
        password: "password123",
        address: "684-686 Red Crescent Bhaban, Aurangzeb Road, Mohammadpur, Dhaka-1207",
        description: "One of the largest voluntary blood donation organizations in Bangladesh.",
        category: "national",
        contact: "09611-671100",
        website: "https://bdrcs.org",
        icon: "🩸",
        bloodInventory: { "A+": 45, "A-": 12, "B+": 40, "B-": 8, "AB+": 22, "AB-": 6, "O+": 50, "O-": 10 },
        pricing: { bloodPrice: 1500, processingFee: 200, screeningFee: 300, serviceCharge: 100 },
        isActive: true,
        status: "approved",
      },
      {
        name: "SANDHANI",
        email: "info@sandhani.org",
        phone: "01700-000001",
        password: "password123",
        address: "DMCH Campus, Dhaka",
        description: "A pioneer in voluntary blood donation, established in 1978.",
        category: "national",
        contact: "01700-000001",
        website: "https://en.wikipedia.org/wiki/Sandhani",
        icon: "🩸",
        bloodInventory: { "A+": 38, "A-": 10, "B+": 42, "B-": 7, "AB+": 18, "AB-": 4, "O+": 48, "O-": 8 },
        pricing: { bloodPrice: 1200, processingFee: 150, screeningFee: 250, serviceCharge: 50 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Medicine Club",
        email: "contact@medicineclub.org",
        phone: "01700-000002",
        password: "password123",
        address: "Mymensingh Medical College, Mymensingh",
        description: "Founded in 1981 at Mymensingh Medical College.",
        category: "national",
        contact: "01700-000002",
        website: "https://en.wikipedia.org/wiki/Blood_donation_in_Bangladesh",
        icon: "💉",
        bloodInventory: { "A+": 35, "A-": 9, "B+": 40, "B-": 6, "AB+": 14, "AB-": 3, "O+": 45, "O-": 7 },
        pricing: { bloodPrice: 1300, processingFee: 180, screeningFee: 280, serviceCharge: 70 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Badhan",
        email: "info@badhan.org",
        phone: "01700-000003",
        password: "password123",
        address: "Dhaka University Campus, Dhaka",
        description: "Established in 1997 by students of Dhaka University.",
        category: "national",
        contact: "01700-000003",
        website: "https://www.spaandanb.org/projects/badhan-btc/",
        icon: "🎓",
        bloodInventory: { "A+": 32, "A-": 8, "B+": 36, "B-": 5, "AB+": 12, "AB-": 3, "O+": 42, "O-": 6 },
        pricing: { bloodPrice: 1100, processingFee: 150, screeningFee: 250, serviceCharge: 50 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Quantum Foundation",
        email: "blood@quantum.org.bd",
        phone: "01700-000004",
        password: "password123",
        address: "Quantum Foundation, Dhaka",
        description: "Operates a nationwide voluntary blood donation program.",
        category: "national",
        contact: "01700-000004",
        website: "https://blood.quantummethod.org.bd/en",
        icon: "🔬",
        bloodInventory: { "A+": 50, "A-": 14, "B+": 44, "B-": 9, "AB+": 20, "AB-": 6, "O+": 55, "O-": 11 },
        pricing: { bloodPrice: 1400, processingFee: 200, screeningFee: 300, serviceCharge: 100 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Evercare Hospital Blood Bank",
        email: "bloodbank@evercarebd.com",
        phone: "01713-041277",
        password: "password123",
        address: "Plot 81, Block E, Bashundhara R/A, Dhaka-1229",
        description: "Offers 24-hour blood transfusion services.",
        category: "hospital",
        contact: "01713-041277",
        website: "https://www.evercarebd.com",
        icon: "🏨",
        bloodInventory: { "A+": 28, "A-": 7, "B+": 32, "B-": 5, "AB+": 10, "AB-": 3, "O+": 35, "O-": 6 },
        pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
        isActive: true,
        status: "approved",
      },
      {
        name: "United Hospital Blood Bank",
        email: "bloodbank@uhlbd.com",
        phone: "01914-001234",
        password: "password123",
        address: "Plot 15, Road 71, Gulshan, Dhaka-1212",
        description: "Comprehensive blood banking services with modern testing facilities.",
        category: "hospital",
        contact: "01914-001234",
        website: "https://uhlbd.com",
        icon: "🏥",
        bloodInventory: { "A+": 30, "A-": 8, "B+": 34, "B-": 6, "AB+": 12, "AB-": 4, "O+": 38, "O-": 7 },
        pricing: { bloodPrice: 2100, processingFee: 320, screeningFee: 420, serviceCharge: 180 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Square Hospital Blood Bank",
        email: "bloodbank@squarehospital.com",
        phone: "01713-377775",
        password: "password123",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205",
        description: "Advanced blood banking facility with 24/7 availability.",
        category: "hospital",
        contact: "01713-377775",
        website: "https://www.squarehospital.com",
        icon: "🏨",
        bloodInventory: { "A+": 35, "A-": 9, "B+": 38, "B-": 7, "AB+": 14, "AB-": 5, "O+": 42, "O-": 8 },
        pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Roktobondhu",
        email: "info@roktobondhu.com",
        phone: "01700-000005",
        password: "password123",
        address: "Online Platform, Dhaka",
        description: "Bangladesh's first and largest blood donation platform.",
        category: "digital",
        contact: "01700-000005",
        website: "https://www.roktobondhu.com",
        icon: "📱",
        bloodInventory: { "A+": 40, "A-": 11, "B+": 36, "B-": 8, "AB+": 16, "AB-": 5, "O+": 46, "O-": 9 },
        pricing: { bloodPrice: 1000, processingFee: 100, screeningFee: 200, serviceCharge: 50 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Shohay Blood Donors",
        email: "contact@shohay.org",
        phone: "01700-000006",
        password: "password123",
        address: "Online Platform, Dhaka",
        description: "Digital platform connecting blood donors with those in need.",
        category: "digital",
        contact: "01700-000006",
        website: "https://www.shohay.org",
        icon: "💻",
        bloodInventory: { "A+": 35, "A-": 9, "B+": 32, "B-": 6, "AB+": 14, "AB-": 4, "O+": 40, "O-": 7 },
        pricing: { bloodPrice: 1100, processingFee: 120, screeningFee: 220, serviceCharge: 60 },
        isActive: true,
        status: "approved",
      },
    ];

    // Seed Hospitals
    const hospitals = [
      {
        name: "Evercare Hospital Dhaka",
        email: "info@evercarebd.com",
        phone: "01713-041277",
        password: "password123",
        address: "Plot 81, Block E, Bashundhara R/A, Dhaka-1229",
        emergencyHotline: "10678",
        ambulance: "01958-677678",
        website: "https://www.evercarebd.com",
        bloodInventory: { "A+": 28, "A-": 7, "B+": 32, "B-": 5, "AB+": 10, "AB-": 3, "O+": 35, "O-": 6 },
        pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
        isActive: true,
        status: "approved",
      },
      {
        name: "United Hospital",
        email: "info@uhlbd.com",
        phone: "01914-001234",
        password: "password123",
        address: "Plot 15, Road 71, Gulshan, Dhaka-1212",
        emergencyHotline: "10666",
        ambulance: "01958-677788",
        website: "https://uhlbd.com",
        bloodInventory: { "A+": 30, "A-": 8, "B+": 34, "B-": 6, "AB+": 12, "AB-": 4, "O+": 38, "O-": 7 },
        pricing: { bloodPrice: 2100, processingFee: 320, screeningFee: 420, serviceCharge: 180 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Square Hospital",
        email: "info@squarehospital.com",
        phone: "01713-377775",
        password: "password123",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205",
        emergencyHotline: "10616",
        ambulance: "01713-377776",
        website: "https://www.squarehospital.com",
        bloodInventory: { "A+": 35, "A-": 9, "B+": 38, "B-": 7, "AB+": 14, "AB-": 5, "O+": 42, "O-": 8 },
        pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
        isActive: true,
        status: "approved",
      },
      {
        name: "Apollo Hospitals Dhaka",
        email: "info@apollodhaka.com",
        phone: "10606",
        password: "password123",
        address: "Plot 81, Block E, Bashundhara, Dhaka-1229",
        emergencyHotline: "10606",
        ambulance: "01776-333999",
        website: "https://www.apollodhaka.com",
        bloodInventory: { "A+": 26, "A-": 6, "B+": 30, "B-": 5, "AB+": 9, "AB-": 2, "O+": 33, "O-": 5 },
        pricing: { bloodPrice: 1950, processingFee: 290, screeningFee: 390, serviceCharge: 145 },
        isActive: true,
        status: "approved",
      },
      {
        name: "BIRDEM General Hospital",
        email: "info@birdem.org.bd",
        phone: "02-9661551",
        password: "password123",
        address: "122 Kazi Nazrul Islam Avenue, Dhaka-1000",
        emergencyHotline: "02-9661551",
        ambulance: "02-9667116",
        website: "https://www.birdem.org.bd",
        bloodInventory: { "A+": 24, "A-": 5, "B+": 28, "B-": 4, "AB+": 8, "AB-": 2, "O+": 30, "O-": 4 },
        pricing: { bloodPrice: 1600, processingFee: 220, screeningFee: 320, serviceCharge: 110 },
        isActive: true,
        status: "approved",
      },
    ];

    await Organization.insertMany(organizations);
    console.log(`✅ Seeded ${organizations.length} organizations`);

    await Hospital.insertMany(hospitals);
    console.log(`✅ Seeded ${hospitals.length} hospitals`);

    // Create demo users for blood requests
    const demoUsers = [
      {
        fullName: "Sarah Ahmed",
        email: "sarah.ahmed@example.com",
        password: "password123",
        bloodType: "O+",
        phone: "+880-1711-123456",
        dateOfBirth: new Date("1992-05-15"),
        gender: "female",
        address: "House 12, Road 5",
        city: "Dhaka",
        state: "Dhaka Division",
        zipCode: "1209",
        weight: 58,
        isDemoUser: true,
      },
      {
        fullName: "Karim Rahman",
        email: "karim.rahman@example.com",
        password: "password123",
        bloodType: "A+",
        phone: "+880-1712-234567",
        dateOfBirth: new Date("1988-08-22"),
        gender: "male",
        address: "House 45, Road 18",
        city: "Dhaka",
        state: "Dhaka Division",
        zipCode: "1212",
        weight: 72,
        isDemoUser: true,
      },
      {
        fullName: "Fatima Khan",
        email: "fatima.khan@example.com",
        password: "password123",
        bloodType: "B+",
        phone: "+880-1713-345678",
        dateOfBirth: new Date("1995-03-10"),
        gender: "female",
        address: "House 78, Road 11",
        city: "Dhaka",
        state: "Dhaka Division",
        zipCode: "1213",
        weight: 55,
        isDemoUser: true,
      },
    ];

    const users = await User.insertMany(demoUsers);
    console.log(`✅ Seeded ${users.length} demo users`);

    // Create blood requests linked to users
    const bloodRequests = [
      {
        patientName: "Mohammad Hasan",
        bloodType: "O+",
        units: 2,
        hospital: "Evercare Hospital Dhaka",
        reason: "Emergency surgery",
        urgency: "emergency",
        contactName: "Sarah Ahmed",
        contactPhone: "+880-1711-123456",
        requiredDate: new Date(Date.now() + 86400000), // tomorrow
        requestedBy: users[0]._id,
        status: "pending",
      },
      {
        patientName: "Ayesha Siddiqui",
        bloodType: "A-",
        units: 3,
        hospital: "United Hospital",
        reason: "Thalassemia treatment",
        urgency: "urgent",
        contactName: "Karim Rahman",
        contactPhone: "+880-1712-234567",
        requiredDate: new Date(Date.now() + 172800000), // day after tomorrow
        requestedBy: users[1]._id,
        status: "approved",
      },
      {
        patientName: "Rahim Uddin",
        bloodType: "B+",
        units: 1,
        hospital: "Square Hospital",
        reason: "Anemia treatment",
        urgency: "normal",
        contactName: "Fatima Khan",
        contactPhone: "+880-1713-345678",
        requiredDate: new Date(Date.now() + 259200000), // 3 days from now
        requestedBy: users[2]._id,
        status: "pending",
      },
      {
        patientName: "Nusrat Jahan",
        bloodType: "AB+",
        units: 4,
        hospital: "Apollo Hospitals Dhaka",
        reason: "Post-surgery complications",
        urgency: "emergency",
        contactName: "Sarah Ahmed",
        contactPhone: "+880-1711-123456",
        requiredDate: new Date(Date.now() + 43200000), // 12 hours from now
        requestedBy: users[0]._id,
        status: "pending",
      },
      {
        patientName: "Imran Ali",
        bloodType: "O-",
        units: 2,
        hospital: "BIRDEM General Hospital",
        reason: "Accident victim",
        urgency: "urgent",
        contactName: "Karim Rahman",
        contactPhone: "+880-1712-234567",
        requiredDate: new Date(Date.now() + 345600000), // 4 days from now
        requestedBy: users[1]._id,
        status: "fulfilled",
      },
      {
        patientName: "Zainab Hossain",
        bloodType: "A+",
        units: 3,
        hospital: "United Hospital",
        reason: "Cancer treatment",
        urgency: "normal",
        contactName: "Fatima Khan",
        contactPhone: "+880-1713-345678",
        requiredDate: new Date(Date.now() + 518400000), // 6 days from now
        requestedBy: users[2]._id,
        status: "approved",
      },
      {
        patientName: "Tariq Hassan",
        bloodType: "B-",
        units: 2,
        hospital: "Square Hospital",
        reason: "Surgery preparation",
        urgency: "emergency",
        contactName: "Sarah Ahmed",
        contactPhone: "+880-1711-123456",
        requiredDate: new Date(Date.now() + 86400000), // tomorrow
        requestedBy: users[0]._id,
        status: "pending",
      },
    ];

    await BloodRequest.insertMany(bloodRequests);
    console.log(`✅ Seeded ${bloodRequests.length} blood requests`);

    console.log("✅ Demo data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
