import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Define schemas inline
const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  contact: String,
  emergencyHotline: String,
  emergencyContact: String,
  ambulance: String,
  landline: String,
  mobile: String,
  address: String,
  email: String,
  website: String,
  bloodInventory: {
    "A+": { type: Number, default: 0 },
    "A-": { type: Number, default: 0 },
    "B+": { type: Number, default: 0 },
    "B-": { type: Number, default: 0 },
    "AB+": { type: Number, default: 0 },
    "AB-": { type: Number, default: 0 },
    "O+": { type: Number, default: 0 },
    "O-": { type: Number, default: 0 },
  },
  pricing: {
    bloodPrice: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    screeningFee: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
  },
  additionalFees: {
    crossMatching: { type: Number, default: 0 },
    storagePerDay: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  category: { type: String, default: "General" },
  contact: String,
  email: String,
  website: String,
  location: String,
  bloodInventory: {
    "A+": { type: Number, default: 0 },
    "A-": { type: Number, default: 0 },
    "B+": { type: Number, default: 0 },
    "B-": { type: Number, default: 0 },
    "AB+": { type: Number, default: 0 },
    "AB-": { type: Number, default: 0 },
    "O+": { type: Number, default: 0 },
    "O-": { type: Number, default: 0 },
  },
  pricing: {
    bloodPrice: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    handlingFee: { type: Number, default: 0 },
    screeningFee: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Hospital = mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);
const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);

// Demo Organizations Data
const organizationsData = {
  national: [
    {
      name: "Bangladesh Red Crescent Society (BDRCS)",
      description: "Operates 10 blood centers nationwide, including in Dhaka, Chattogram, Sylhet, Rajshahi, Dinajpur, Jessore, Natore, Magura, and Gopalganj.",
      contact: "01811 458524",
      website: "https://bdrcs.org/donate-blood/",
      category: "National",
      icon: "🏥",
      bloodInventory: { "A+": 45, "A-": 12, "B+": 38, "B-": 8, "AB+": 15, "AB-": 5, "O+": 52, "O-": 10 },
      pricing: { bloodPrice: 1500, processingFee: 200, screeningFee: 300, serviceCharge: 100 },
    },
    {
      name: "SANDHANI",
      description: "A pioneer in voluntary blood donation, established in 1978. Operates units in 25 medical and dental colleges across Bangladesh.",
      website: "https://en.wikipedia.org/wiki/Sandhani",
      category: "National",
      icon: "🩸",
      bloodInventory: { "A+": 38, "A-": 10, "B+": 42, "B-": 7, "AB+": 18, "AB-": 4, "O+": 48, "O-": 8 },
      pricing: { bloodPrice: 1200, processingFee: 150, screeningFee: 250, serviceCharge: 50 },
    },
    {
      name: "Medicine Club",
      description: "Founded in 1981 at Mymensingh Medical College. Active in 21 medical and dental colleges.",
      website: "https://en.wikipedia.org/wiki/Blood_donation_in_Bangladesh",
      category: "National",
      icon: "💉",
      bloodInventory: { "A+": 35, "A-": 9, "B+": 40, "B-": 6, "AB+": 14, "AB-": 3, "O+": 45, "O-": 7 },
      pricing: { bloodPrice: 1300, processingFee: 180, screeningFee: 280, serviceCharge: 70 },
    },
    {
      name: "Badhan",
      description: "Established in 1997 by students of Dhaka University. Promotes voluntary blood donation among university students.",
      website: "https://www.spaandanb.org/projects/badhan-btc/",
      category: "National",
      icon: "🎓",
      bloodInventory: { "A+": 32, "A-": 8, "B+": 36, "B-": 5, "AB+": 12, "AB-": 3, "O+": 42, "O-": 6 },
      pricing: { bloodPrice: 1100, processingFee: 150, screeningFee: 250, serviceCharge: 50 },
    },
    {
      name: "Quantum Foundation",
      description: "Operates a nationwide voluntary blood donation program. Maintains a large database of blood donors.",
      website: "https://blood.quantummethod.org.bd/en",
      category: "National",
      icon: "🔬",
      bloodInventory: { "A+": 50, "A-": 14, "B+": 44, "B-": 9, "AB+": 20, "AB-": 6, "O+": 55, "O-": 11 },
      pricing: { bloodPrice: 1400, processingFee: 200, screeningFee: 300, serviceCharge: 100 },
    },
  ],
  hospital: [
    {
      name: "Evercare Hospital Dhaka - Blood Bank",
      description: "Offers 24-hour blood transfusion services through their Transfusion Medicine Department.",
      contact: "01713 041277",
      website: "https://www.evercarebd.com/dhaka/specialities/transfusion-medicine/",
      category: "Hospital",
      icon: "🏨",
      bloodInventory: { "A+": 28, "A-": 7, "B+": 32, "B-": 5, "AB+": 10, "AB-": 3, "O+": 35, "O-": 6 },
      pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
    },
    {
      name: "United Hospital Blood Bank",
      description: "Provides comprehensive blood banking services with modern testing facilities.",
      contact: "01914-001234",
      website: "https://uhlbd.com",
      category: "Hospital",
      icon: "🏥",
      bloodInventory: { "A+": 30, "A-": 8, "B+": 34, "B-": 6, "AB+": 12, "AB-": 4, "O+": 38, "O-": 7 },
      pricing: { bloodPrice: 2100, processingFee: 320, screeningFee: 420, serviceCharge: 180 },
    },
    {
      name: "Square Hospital Blood Bank",
      description: "Advanced blood banking facility with 24/7 availability.",
      contact: "01713-377775",
      website: "https://www.squarehospital.com",
      category: "Hospital",
      icon: "🏨",
      bloodInventory: { "A+": 35, "A-": 9, "B+": 38, "B-": 7, "AB+": 14, "AB-": 5, "O+": 42, "O-": 8 },
      pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
    },
    {
      name: "Labaid Hospital Blood Bank",
      description: "Modern blood banking services with strict quality control.",
      contact: "01777-467890",
      website: "https://labaidbd.com",
      category: "Hospital",
      icon: "🏥",
      bloodInventory: { "A+": 22, "A-": 5, "B+": 26, "B-": 4, "AB+": 8, "AB-": 2, "O+": 30, "O-": 5 },
      pricing: { bloodPrice: 1900, processingFee: 280, screeningFee: 380, serviceCharge: 140 },
    },
    {
      name: "IBN SINA Hospital Blood Bank",
      description: "Reliable blood banking services with experienced staff.",
      contact: "09666-710678",
      website: "https://ibnsinahospital.com",
      category: "Hospital",
      icon: "🏨",
      bloodInventory: { "A+": 18, "A-": 4, "B+": 22, "B-": 3, "AB+": 7, "AB-": 2, "O+": 25, "O-": 4 },
      pricing: { bloodPrice: 1750, processingFee: 250, screeningFee: 350, serviceCharge: 120 },
    },
  ],
  digital: [
    {
      name: "Roktobondhu",
      description: "Bangladesh's first and largest blood donation platform. Connects donors with recipients nationwide.",
      contact: "01700-000000",
      website: "https://www.roktobondhu.com",
      category: "Digital",
      icon: "📱",
      bloodInventory: { "A+": 40, "A-": 11, "B+": 36, "B-": 8, "AB+": 16, "AB-": 5, "O+": 46, "O-": 9 },
      pricing: { bloodPrice: 1000, processingFee: 100, deliveryCharge: 200, handlingFee: 50 },
    },
    {
      name: "Shohay Foundation",
      description: "Digital platform for emergency blood donation services.",
      website: "https://shohay.org",
      category: "Digital",
      icon: "💻",
      bloodInventory: { "A+": 25, "A-": 6, "B+": 28, "B-": 5, "AB+": 10, "AB-": 3, "O+": 32, "O-": 6 },
      pricing: { bloodPrice: 900, processingFee: 80, deliveryCharge: 150, handlingFee: 40 },
    },
    {
      name: "Blood Heroes BD",
      description: "Mobile app-based blood donation network.",
      contact: "01800-123456",
      website: "https://bloodheroesbd.com",
      category: "Digital",
      icon: "🦸",
      bloodInventory: { "A+": 30, "A-": 8, "B+": 32, "B-": 6, "AB+": 12, "AB-": 4, "O+": 36, "O-": 7 },
      pricing: { bloodPrice: 950, processingFee: 90, deliveryCharge: 180, handlingFee: 45 },
    },
  ],
};

// Demo Hospitals Data
const hospitalsData = [
  {
    name: "Evercare Hospital Dhaka",
    emergencyHotline: "10678",
    ambulance: "+880 1714-090000",
    address: "Plot 81, Block-E, Bashundhara R/A, Dhaka 1229",
    website: "https://www.evercarebd.com",
    bloodInventory: { "A+": 28, "A-": 7, "B+": 32, "B-": 5, "AB+": 10, "AB-": 3, "O+": 35, "O-": 6 },
    pricing: { bloodPrice: 2200, processingFee: 350, screeningFee: 450, serviceCharge: 200 },
    additionalFees: { crossMatching: 500, storagePerDay: 100 },
  },
  {
    name: "United Hospital Limited",
    emergencyContact: "01914-001234",
    address: "Plot 15, Road 71, Gulshan, Dhaka 1212",
    website: "https://uhlbd.com",
    bloodInventory: { "A+": 30, "A-": 8, "B+": 34, "B-": 6, "AB+": 12, "AB-": 4, "O+": 38, "O-": 7 },
    pricing: { bloodPrice: 2100, processingFee: 320, screeningFee: 420, serviceCharge: 180 },
    additionalFees: { crossMatching: 480, storagePerDay: 90 },
  },
  {
    name: "Square Hospital",
    emergencyHotline: "10616",
    landline: "+88 02 8144400",
    mobile: "+88 01713-377775",
    address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205",
    website: "https://www.squarehospital.com",
    bloodInventory: { "A+": 35, "A-": 9, "B+": 38, "B-": 7, "AB+": 14, "AB-": 5, "O+": 42, "O-": 8 },
    pricing: { bloodPrice: 2000, processingFee: 300, screeningFee: 400, serviceCharge: 150 },
    additionalFees: { crossMatching: 450, storagePerDay: 80 },
  },
  {
    name: "Bangladesh Specialized Hospital",
    emergencyContact: "01313-777771",
    address: "21 Shyamoli, Mirpur Road, Dhaka 1207",
    website: "https://bdspecializedhospital.com",
    bloodInventory: { "A+": 25, "A-": 6, "B+": 28, "B-": 5, "AB+": 10, "AB-": 3, "O+": 32, "O-": 6 },
    pricing: { bloodPrice: 1800, processingFee: 270, screeningFee: 370, serviceCharge: 130 },
    additionalFees: { crossMatching: 420, storagePerDay: 70 },
  },
  {
    name: "Labaid Specialized Hospital",
    emergencyContact: "01777-467890",
    address: "House 1, Road 4, Dhanmondi, Dhaka 1205",
    website: "https://labaidbd.com",
    bloodInventory: { "A+": 22, "A-": 5, "B+": 26, "B-": 4, "AB+": 8, "AB-": 2, "O+": 30, "O-": 5 },
    pricing: { bloodPrice: 1900, processingFee: 280, screeningFee: 380, serviceCharge: 140 },
    additionalFees: { crossMatching: 430, storagePerDay: 75 },
  },
  {
    name: "Apollo Hospitals Dhaka",
    emergencyHotline: "10606",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka 1229",
    website: "https://www.apollodhaka.com",
    bloodInventory: { "A+": 32, "A-": 8, "B+": 36, "B-": 7, "AB+": 13, "AB-": 4, "O+": 40, "O-": 8 },
    pricing: { bloodPrice: 2150, processingFee: 330, screeningFee: 430, serviceCharge: 175 },
    additionalFees: { crossMatching: 470, storagePerDay: 85 },
  },
  {
    name: "Popular Diagnostic Centre",
    contact: "01777-777555",
    address: "House 16, Road 2, Dhanmondi, Dhaka 1205",
    website: "https://populardiagnostic.com",
    bloodInventory: { "A+": 20, "A-": 5, "B+": 24, "B-": 4, "AB+": 9, "AB-": 2, "O+": 28, "O-": 5 },
    pricing: { bloodPrice: 1700, processingFee: 240, screeningFee: 340, serviceCharge: 110 },
    additionalFees: { crossMatching: 390, storagePerDay: 65 },
  },
  {
    name: "IBN SINA Specialized Hospital",
    emergencyHotline: "09666-710678",
    address: "House 47-48, Road 9/A, Dhanmondi, Dhaka 1209",
    website: "https://ibnsinahospital.com",
    bloodInventory: { "A+": 18, "A-": 4, "B+": 22, "B-": 3, "AB+": 7, "AB-": 2, "O+": 25, "O-": 4 },
    pricing: { bloodPrice: 1750, processingFee: 250, screeningFee: 350, serviceCharge: 120 },
    additionalFees: { crossMatching: 400, storagePerDay: 68 },
  },
  {
    name: "BIRDEM General Hospital",
    contact: "02-9661551",
    address: "122 Kazi Nazrul Islam Avenue, Shahbagh, Dhaka 1000",
    website: "https://birdem.org.bd",
    bloodInventory: { "A+": 26, "A-": 6, "B+": 30, "B-": 5, "AB+": 11, "AB-": 3, "O+": 34, "O-": 6 },
    pricing: { bloodPrice: 1650, processingFee: 230, screeningFee: 330, serviceCharge: 105 },
    additionalFees: { crossMatching: 380, storagePerDay: 62 },
  },
  {
    name: "Holy Family Red Crescent Medical College Hospital",
    contact: "02-9127842",
    address: "Eskaton, Dhaka 1000",
    website: "https://holyfamilyhospital.org",
    bloodInventory: { "A+": 24, "A-": 5, "B+": 28, "B-": 4, "AB+": 10, "AB-": 2, "O+": 32, "O-": 5 },
    pricing: { bloodPrice: 1550, processingFee: 210, screeningFee: 310, serviceCharge: 95 },
    additionalFees: { crossMatching: 360, storagePerDay: 58 },
  },
  {
    name: "Dhaka Medical College Hospital",
    contact: "02-9672757",
    address: "Secretariat Road, Dhaka 1000",
    website: "https://dmch.gov.bd",
    bloodInventory: { "A+": 40, "A-": 10, "B+": 45, "B-": 8, "AB+": 18, "AB-": 5, "O+": 50, "O-": 10 },
    pricing: { bloodPrice: 1200, processingFee: 150, screeningFee: 250, serviceCharge: 50 },
    additionalFees: { crossMatching: 300, storagePerDay: 40 },
  },
  {
    name: "Bangabandhu Sheikh Mujib Medical University",
    contact: "02-9668202",
    address: "Shahbagh, Dhaka 1000",
    website: "https://bsmmu.edu.bd",
    bloodInventory: { "A+": 38, "A-": 9, "B+": 42, "B-": 7, "AB+": 16, "AB-": 4, "O+": 48, "O-": 9 },
    pricing: { bloodPrice: 1300, processingFee: 160, screeningFee: 260, serviceCharge: 60 },
    additionalFees: { crossMatching: 320, storagePerDay: 45 },
  },
  {
    name: "National Institute of Cardiovascular Diseases",
    contact: "02-9898181",
    address: "Sher-E-Bangla Nagar, Dhaka 1207",
    website: "https://nicvd.gov.bd",
    bloodInventory: { "A+": 30, "A-": 7, "B+": 34, "B-": 6, "AB+": 12, "AB-": 3, "O+": 38, "O-": 7 },
    pricing: { bloodPrice: 1400, processingFee: 180, screeningFee: 280, serviceCharge: 70 },
    additionalFees: { crossMatching: 340, storagePerDay: 50 },
  },
  {
    name: "Shaheed Suhrawardy Medical College Hospital",
    contact: "02-9144033",
    address: "Sher-E-Bangla Nagar, Dhaka 1207",
    website: "https://ssmch.gov.bd",
    bloodInventory: { "A+": 35, "A-": 8, "B+": 38, "B-": 7, "AB+": 14, "AB-": 4, "O+": 42, "O-": 8 },
    pricing: { bloodPrice: 1250, processingFee: 155, screeningFee: 255, serviceCharge: 55 },
    additionalFees: { crossMatching: 310, storagePerDay: 43 },
  },
  {
    name: "Sir Salimullah Medical College Hospital",
    contact: "02-7319002",
    address: "Mitford, Dhaka 1100",
    website: "https://ssmc.edu.bd",
    bloodInventory: { "A+": 32, "A-": 7, "B+": 36, "B-": 6, "AB+": 13, "AB-": 3, "O+": 40, "O-": 7 },
    pricing: { bloodPrice: 1220, processingFee: 152, screeningFee: 252, serviceCharge: 52 },
    additionalFees: { crossMatching: 305, storagePerDay: 42 },
  },
];

const seedDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if data already exists
    const existingHospitals = await Hospital.countDocuments();
    const existingOrganizations = await Organization.countDocuments();

    if (existingHospitals > 3 || existingOrganizations > 3) {
      console.log("Demo data already exists. Skipping seed...");
      console.log(`Current counts - Hospitals: ${existingHospitals}, Organizations: ${existingOrganizations}`);
      process.exit(0);
    }

    console.log("Seeding demo data...");

    // Insert all organizations
    const allOrganizations = [
      ...organizationsData.national,
      ...organizationsData.hospital,
      ...organizationsData.digital,
    ];

    for (const org of allOrganizations) {
      await Organization.create(org);
    }

    console.log(`✅ Inserted ${allOrganizations.length} organizations`);

    // Insert all hospitals
    for (const hospital of hospitalsData) {
      await Hospital.create(hospital);
    }

    console.log(`✅ Inserted ${hospitalsData.length} hospitals`);

    console.log("\n🎉 Demo data seeding completed successfully!");
    console.log(`Total Organizations: ${allOrganizations.length}`);
    console.log(`Total Hospitals: ${hospitalsData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDemoData();
