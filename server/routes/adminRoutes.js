import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Organization from "../models/Organization.js";
import Hospital from "../models/Hospital.js";
import BloodPurchase from "../models/BloodPurchase.js";
import User from "../models/User.js";

const router = express.Router();

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    req.organizationId = decoded.organizationId; // For org admins
    req.hospitalId = decoded.hospitalId; // For hospital admins
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Super admin only middleware
const superAdminOnly = (req, res, next) => {
  if (req.adminRole !== "super_admin") {
    return res.status(403).json({ message: "Access denied. Super admin only." });
  }
  next();
};

// Login - Now handles organization-specific authentication
router.post("/login", async (req, res) => {
  try {
    const { username, password, organizationName } = req.body;
    
    // Check if it's super admin
    if (username === "superadmin") {
      const admin = await Admin.findOne({ username, isActive: true });
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isMatch = await admin.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      admin.lastLogin = new Date();
      await admin.save();
      
      const token = jwt.sign(
        { adminId: admin._id, role: admin.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      
      return res.json({
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
        },
      });
    }
    
    // Handle org admin login
    if (username === "orgadmin") {
      if (!organizationName) {
        return res.status(400).json({ message: "Organization name is required" });
      }

      // Find organization by name
      const organization = await Organization.findOne({ 
        name: organizationName,
        status: "approved",
        isActive: true 
      });

      if (!organization) {
        return res.status(401).json({ message: "Organization not found or not approved" });
      }

      // Verify organization password
      const isMatch = await organization.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password for this organization" });
      }

      const token = jwt.sign(
        { 
          organizationId: organization._id.toString(),
          role: "org_admin",
          organizationName: organization.name
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      
      return res.json({
        token,
        admin: {
          username: "orgadmin",
          name: `${organization.name} Admin`,
          role: "org_admin",
          permissions: "limited",
          organizationId: organization._id,
          organizationName: organization.name,
        },
      });
    }

    // Handle hospital admin login
    if (username === "hospitaladmin") {
      const { hospitalName } = req.body;

      if (!hospitalName) {
        return res.status(400).json({ message: "Hospital name is required" });
      }

      // Find the hospital by name
      const hospital = await Hospital.findOne({ 
        name: hospitalName,
        status: "approved",
        isActive: true 
      });

      if (!hospital) {
        return res.status(401).json({ message: "Hospital not found or not approved" });
      }

      // Verify hospital password
      const isMatch = await hospital.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password for this hospital" });
      }

      const token = jwt.sign(
        { 
          hospitalId: hospital._id.toString(),
          role: "hospital_admin",
          hospitalName: hospital.name
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      
      return res.json({
        token,
        admin: {
          username: "hospitaladmin",
          name: `${hospital.name} Admin`,
          role: "hospital_admin",
          permissions: "limited",
          hospitalId: hospital._id,
          hospitalName: hospital.name,
        },
      });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available organizations for org admin
router.get("/organizations/list", async (req, res) => {
  try {
    const organizations = await Organization.find({ 
      status: "approved",
      isActive: true 
    })
      .select("_id name icon")
      .sort({ name: 1 });
    res.json(organizations);
  } catch (error) {
    console.error("Get organizations list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public organization registration (no auth required)
router.post("/organizations/register", async (req, res) => {
  try {
    const { name, email, phone, address, password, category, description, website, contact } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ 
      $or: [{ email }, { name }] 
    });

    if (existingOrg) {
      return res.status(400).json({ 
        message: "Organization with this email or name already exists" 
      });
    }

    // Create new organization with pending status
    const organization = new Organization({
      name,
      email,
      phone,
      address,
      password, // Will be hashed by pre-save hook
      category: category || "national",
      description,
      website,
      contact,
      status: "pending",
      isActive: false,
      bloodInventory: {
        "A+": 0,
        "A-": 0,
        "B+": 0,
        "B-": 0,
        "AB+": 0,
        "AB-": 0,
        "O+": 0,
        "O-": 0,
      },
      pricing: {
        bloodPrice: 1000,
        processingFee: 200,
        screeningFee: 150,
        serviceCharge: 100,
      },
    });

    await organization.save();

    res.status(201).json({
      message: "Organization registration submitted successfully. Please wait for admin approval.",
      organization: {
        id: organization._id,
        name: organization.name,
        email: organization.email,
        status: organization.status,
      },
    });
  } catch (error) {
    console.error("Organization registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Get dashboard stats
router.get("/dashboard/stats", adminAuth, async (req, res) => {
  try {
    const { adminRole } = req;
    
    if (adminRole === "super_admin") {
      const [
        totalOrganizations,
        totalHospitals,
        totalAdmins,
        totalOrders,
        pendingOrders,
        totalUsers
      ] = await Promise.all([
        Organization.countDocuments({ isActive: true }),
        Hospital.countDocuments({ isActive: true }),
        Admin.countDocuments({ isActive: true }),
        BloodPurchase.countDocuments(),
        BloodPurchase.countDocuments({ status: "pending" }),
        User.countDocuments()
      ]);
      
      const orders = await BloodPurchase.find({ status: { $in: ["approved", "delivered"] } });
      const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.totalCost, 0);
      
      res.json({
        totalOrganizations,
        totalHospitals,
        totalAdmins,
        totalOrders,
        pendingApprovals: pendingOrders,
        totalRevenue: `৳${totalRevenue.toLocaleString()}`,
        totalUsers
      });
    } else {
      // For org_admin and hospital_admin
      const filter = {};
      let bloodUnits = 0;
      
      if (req.adminRole === "org_admin" && req.organizationId) {
        filter.sourceType = "organization";
        filter.sourceId = req.organizationId;
        
        const org = await Organization.findById(req.organizationId);
        if (org) {
          bloodUnits = Object.values(org.bloodInventory).reduce((sum, units) => sum + units, 0);
        }
      } else if (req.adminRole === "hospital_admin" && req.hospitalId) {
        filter.sourceType = "hospital";
        filter.sourceId = req.hospitalId;
        
        const hospital = await Hospital.findById(req.hospitalId);
        if (hospital) {
          bloodUnits = Object.values(hospital.bloodInventory).reduce((sum, units) => sum + units, 0);
        }
      }
      
      const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
        BloodPurchase.countDocuments(filter),
        BloodPurchase.countDocuments({ ...filter, status: "pending" }),
        BloodPurchase.countDocuments({ ...filter, status: "delivered" })
      ]);
      
      const orders = await BloodPurchase.find({ ...filter, status: { $in: ["approved", "delivered"] } });
      const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.totalCost, 0);
      
      res.json({
        [req.adminRole === "org_admin" ? "organizationOrders" : "hospitalOrders"]: totalOrders,
        [req.adminRole === "org_admin" ? "pendingOrders" : "pendingRequests"]: pendingOrders,
        [req.adminRole === "org_admin" ? "bloodUnitsAvailable" : "bloodUnitsStock"]: bloodUnits,
        [req.adminRole === "org_admin" ? "completedOrders" : "completedDeliveries"]: completedOrders,
        monthlyRevenue: `৳${totalRevenue.toLocaleString()}`
      });
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== ORGANIZATION MANAGEMENT =====

// Get all organizations (super admin sees all, org admin sees only theirs)
router.get("/organizations", adminAuth, async (req, res) => {
  try {
    let query = {};
    
    // If org admin, filter by their organization
    if (req.adminRole === "org_admin") {
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      query._id = decoded.organizationId;
    }
    
    const organizations = await Organization.find(query)
      .populate("approvedBy", "name username")
      .sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending organizations (super admin only)
router.get("/organizations/pending", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const organizations = await Organization.find({ status: "pending" })
      .sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    console.error("Get pending organizations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve organization (super admin only)
router.patch("/organizations/:id/approve", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (organization.status !== "pending") {
      return res.status(400).json({ message: "Organization is not pending approval" });
    }

    organization.status = "approved";
    organization.isActive = true;
    organization.approvedBy = req.adminId;
    organization.approvedAt = new Date();
    
    await organization.save();

    res.json({
      message: "Organization approved successfully",
      organization,
    });
  } catch (error) {
    console.error("Approve organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject organization (super admin only)
router.patch("/organizations/:id/reject", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (organization.status !== "pending") {
      return res.status(400).json({ message: "Organization is not pending approval" });
    }

    organization.status = "rejected";
    organization.rejectionReason = reason || "Not specified";
    organization.isActive = false;
    
    await organization.save();

    res.json({
      message: "Organization rejected",
      organization,
    });
  } catch (error) {
    console.error("Reject organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create organization (super admin only - direct creation)
router.post("/organizations", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const organization = new Organization({
      ...req.body,
      status: "approved", // Direct creation by super admin is auto-approved
      isActive: true,
      approvedBy: req.adminId,
      approvedAt: new Date(),
    });
    await organization.save();
    res.status(201).json(organization);
  } catch (error) {
    console.error("Create organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update organization
router.put("/organizations/:id", adminAuth, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    res.json(organization);
  } catch (error) {
    console.error("Update organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete organization
router.delete("/organizations/:id", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Delete organization error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== HOSPITAL MANAGEMENT =====

// Hospital registration (public - no auth required)
router.post("/hospitals/register", async (req, res) => {
  try {
    const { name, email, phone, address, password, emergencyHotline, ambulance, website, category, description } = req.body;

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({
      $or: [{ email }, { name }]
    });

    if (existingHospital) {
      return res.status(400).json({
        message: existingHospital.email === email
          ? "Hospital with this email already exists"
          : "Hospital with this name already exists"
      });
    }

    // Create new hospital with pending status
    const hospital = new Hospital({
      name,
      email,
      phone,
      address,
      password,
      emergencyHotline,
      ambulance,
      website,
      category: category || "General Hospital",
      description,
      status: "pending",
      isActive: false
    });

    await hospital.save();

    res.status(201).json({
      message: "Hospital registration submitted successfully. Waiting for Super Admin approval.",
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.status
      }
    });
  } catch (error) {
    console.error("Hospital registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Get list of approved hospitals for login selection (no auth required)
router.get("/hospitals/list", async (req, res) => {
  try {
    const hospitals = await Hospital.find(
      { status: "approved", isActive: true },
      { name: 1, _id: 1 }
    ).sort({ name: 1 });
    
    res.json(hospitals);
  } catch (error) {
    console.error("Get hospitals list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending hospitals (super admin only)
router.get("/hospitals/pending", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: "pending" })
      .sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    console.error("Get pending hospitals error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve hospital (super admin only)
router.patch("/hospitals/:id/approve", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (hospital.status !== "pending") {
      return res.status(400).json({ message: "Hospital is not pending approval" });
    }

    hospital.status = "approved";
    hospital.isActive = true;
    hospital.approvedBy = req.adminId;
    hospital.approvedAt = new Date();
    
    await hospital.save();

    res.json({
      message: "Hospital approved successfully",
      hospital,
    });
  } catch (error) {
    console.error("Approve hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject hospital (super admin only)
router.patch("/hospitals/:id/reject", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (hospital.status !== "pending") {
      return res.status(400).json({ message: "Hospital is not pending approval" });
    }

    hospital.status = "rejected";
    hospital.rejectionReason = reason || "Not specified";
    hospital.isActive = false;
    
    await hospital.save();

    res.json({
      message: "Hospital rejected",
      hospital,
    });
  } catch (error) {
    console.error("Reject hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all hospitals
router.get("/hospitals", adminAuth, async (req, res) => {
  try {
    let query = {};
    
    // If hospital admin, filter by their hospital
    if (req.adminRole === "hospital_admin") {
      query._id = req.hospitalId;
    }
    
    const hospitals = await Hospital.find(query)
      .populate("adminId", "name username")
      .populate("approvedBy", "name username")
      .sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    console.error("Get hospitals error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create hospital
router.post("/hospitals", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    console.error("Create hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update hospital
router.put("/hospitals/:id", adminAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    res.json(hospital);
  } catch (error) {
    console.error("Update hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete hospital
router.delete("/hospitals/:id", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    res.json({ message: "Hospital deleted successfully" });
  } catch (error) {
    console.error("Delete hospital error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== ADMIN MANAGEMENT =====

// Get all admins
router.get("/admins", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .populate("organizationId", "name")
      .populate("hospitalId", "name");
    res.json(admins);
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create admin
router.post("/admins", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    res.status(201).json(adminResponse);
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update admin
router.put("/admins/:id", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password update through this endpoint
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.json(admin);
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Disable/Enable admin
router.patch("/admins/:id/toggle-status", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    admin.isActive = !admin.isActive;
    await admin.save();
    
    res.json({ message: `Admin ${admin.isActive ? "enabled" : "disabled"} successfully`, admin });
  } catch (error) {
    console.error("Toggle admin status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== ORDER MANAGEMENT =====

// Get orders based on admin role
router.get("/orders", adminAuth, async (req, res) => {
  try {
    let filter = {};
    
    if (req.adminRole === "org_admin" && req.organizationId) {
      filter = { sourceType: "organization", sourceId: req.organizationId };
    } else if (req.adminRole === "hospital_admin" && req.hospitalId) {
      filter = { sourceType: "hospital", sourceId: req.hospitalId };
    }
    
    const orders = await BloodPurchase.find(filter)
      .populate("purchasedBy", "fullName email phone")
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve/Reject order
router.patch("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const order = await BloodPurchase.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify admin has permission to manage this order
    if (req.adminRole === "org_admin") {
      if (order.sourceType !== "organization" || order.sourceId.toString() !== req.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.adminRole === "hospital_admin") {
      if (order.sourceType !== "hospital" || order.sourceId.toString() !== req.hospitalId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    
    order.statusHistory.push({
      status,
      note: adminNotes || `Status updated to ${status}`,
      date: new Date(),
    });
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update shipping status
router.patch("/orders/:id/shipping", adminAuth, async (req, res) => {
  try {
    const { shippingStatus, shippingDetails } = req.body;
    
    const order = await BloodPurchase.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify admin has permission
    if (req.adminRole === "org_admin") {
      if (order.sourceType !== "organization" || order.sourceId.toString() !== req.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.adminRole === "hospital_admin") {
      if (order.sourceType !== "hospital" || order.sourceId.toString() !== req.hospitalId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    if (shippingStatus) order.shippingStatus = shippingStatus;
    if (shippingDetails) order.shippingDetails = { ...order.shippingDetails, ...shippingDetails };
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error("Update shipping status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update inventory
router.patch("/inventory/:type/:id", adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { bloodInventory } = req.body;
    
    // Verify admin has permission to update this entity
    if (req.adminRole === "org_admin") {
      if (type !== "organization" || id !== req.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.adminRole === "hospital_admin") {
      if (type !== "hospital" || id !== req.hospitalId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    let entity;
    if (type === "organization") {
      entity = await Organization.findByIdAndUpdate(
        id,
        { bloodInventory },
        { new: true }
      );
    } else if (type === "hospital") {
      entity = await Hospital.findByIdAndUpdate(
        id,
        { bloodInventory },
        { new: true }
      );
    }
    
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }
    
    res.json(entity);
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
