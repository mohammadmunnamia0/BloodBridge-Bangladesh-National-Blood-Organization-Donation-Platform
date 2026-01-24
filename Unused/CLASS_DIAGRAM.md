# BloodBridge Foundation - Class Diagram

## Architecture Overview
This document provides a comprehensive class diagram for the BloodBridge-Foundation project, including the backend models, routes (controllers), and their relationships.

---

## Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Backend Controllers                               │
│─────────────────────────────────────────────────────────────────────────────│
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │  AuthController  │  │ AdminController  │  │  UserController  │            │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤            │
│  │+register(req)    │  │+login(req)       │  │+getUser(id)      │            │
│  │+login(req)       │  │+getOrgs(req)     │  │+updateProfile()  │            │
│  │+refreshToken()   │  │+approveOrg()     │  │+getDonors()      │            │
│  │+logout()         │  │+rejectOrg()      │  │+getDonorById()   │            │
│  │                  │  │+getHospitals()   │  │+searchDonors()   │            │
│  │                  │  │+approveHospital()│  │                  │            │
│  │                  │  │+rejectHospital() │  │                  │            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
│           │                      │                      │                    │
│           └──────────┬───────────┴──────────┬───────────┘                    │
│                      │                      │                               │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │          DonorApplicationController                      │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │+submitApplication(req)                                   │                │
│  │+getApplications(userId)                                  │                │
│  │+getApplicationStatus(id)                                 │                │
│  │+updateApplicationStatus(id, status)                      │                │
│  └──────────────────────────────────────────────────────────┘                │
│                      │                                                        │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │          BloodRequestController                          │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │+createRequest(req)                                       │                │
│  │+getRequests(filters)                                     │                │
│  │+getRequestById(id)                                       │                │
│  │+updateRequestStatus(id, status)                          │                │
│  │+deleteRequest(id)                                        │                │
│  └──────────────────────────────────────────────────────────┘                │
│                      │                                                        │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │          BloodPurchaseController                         │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │+createPurchase(req)                                      │                │
│  │+getPurchases(userId)                                     │                │
│  │+getPurchaseById(id)                                      │                │
│  │+updatePurchaseStatus(id, status)                         │                │
│  └──────────────────────────────────────────────────────────┘                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ uses
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Backend Services                                    │
│─────────────────────────────────────────────────────────────────────────────│
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │  AuthService     │  │  AdminService    │  │  UserService     │            │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤            │
│  │+registerUser()   │  │+verifyAdmin()    │  │+createUser()     │            │
│  │+loginUser()      │  │+approveOrg()     │  │+getUserById()    │            │
│  │+verifyToken()    │  │+rejectOrg()      │  │+updateUser()     │            │
│  │+refreshToken()   │  │+getStats()       │  │+deleteUser()     │            │
│  │+logout()         │  │+getDashboard()   │  │+searchUsers()    │            │
│  │                  │  │                  │  │+getUserBloodType()           │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
│           │                      │                      │                    │
│           └──────────┬───────────┴──────────┬───────────┘                    │
│                      │                      │                               │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │        DonorApplicationService                           │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │+submitApplication(appData)                               │                │
│  │+getApplicationsByUser(userId)                            │                │
│  │+getApplicationById(id)                                   │                │
│  │+updateStatus(id, status)                                 │                │
│  │+validateDonorEligibility(userData)                       │                │
│  └──────────────────────────────────────────────────────────┘                │
│                      │                                                        │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │         BloodRequestService                              │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │+createRequest(requestData)                               │                │
│  │+getRequests(filters)                                     │                │
│  │+getRequestById(id)                                       │                │
│  │+updateStatus(id, status)                                 │                │
│  │+findAvailableDonors(bloodType)                           │                │
│  └──────────────────────────────────────────────────────────┘                │
│                      │                                                        │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │         BloodPurchaseService                             │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │+createPurchase(purchaseData)                             │                │
│  │+getPurchases(userId)                                     │                │
│  │+getPurchaseById(id)                                      │                │
│  │+updateStatus(id, status)                                 │                │
│  │+calculateTotal(units, bloodType)                         │                │
│  └──────────────────────────────────────────────────────────┘                │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ manages
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Backend Models                                      │
│─────────────────────────────────────────────────────────────────────────────│
│                                                                               │
│  ┌──────────────────────────┐         ┌──────────────────────────┐           │
│  │        User              │         │        Admin             │           │
│  ├──────────────────────────┤         ├──────────────────────────┤           │
│  │_id: ObjectId             │         │_id: ObjectId             │           │
│  │fullName: string          │         │username: string          │           │
│  │email: string (unique)    │         │password: string          │           │
│  │phone: string             │         │name: string              │           │
│  │dateOfBirth: Date         │         │email: string (unique)    │           │
│  │gender: string            │         │role: enum                │           │
│  │address: string           │         │  [super_admin,           │           │
│  │city: string              │         │   org_admin,             │           │
│  │state: string             │         │   hospital_admin]        │           │
│  │zipCode: string           │         │permissions: enum         │           │
│  │bloodType: string         │         │  [all, limited]          │           │
│  │weight: number            │         │organizationId: ObjectId  │           │
│  │medicalConditions: string │         │hospitalId: ObjectId      │           │
│  │lastDonation: Date        │         │isActive: boolean         │           │
│  │refreshToken: string      │         │lastLogin: Date           │           │
│  │+login(email, pass)       │         │+comparePassword(pass)    │           │
│  │+register(userData)       │         │+hashPassword()           │           │
│  │+updateProfile(data)      │         │                          │           │
│  │                          │         │                          │           │
│  └──────────────────────────┘         └──────────────────────────┘           │
│           │                                    │                             │
│           │ has_many                           │ manages                     │
│           │                                    │                             │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │         DonorApplication                                 │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │_id: ObjectId                                             │                │
│  │userId: ObjectId (ref: User)                              │                │
│  │fullName: string                                          │                │
│  │email: string                                             │                │
│  │phone: string                                             │                │
│  │bloodType: string                                         │                │
│  │age: number                                               │                │
│  │dateOfBirth: Date                                         │                │
│  │address: string                                           │                │
│  │weight: number                                            │                │
│  │city: string                                              │                │
│  │state: string                                             │                │
│  │zipCode: string                                           │                │
│  │gender: string                                            │                │
│  │medicalConditions: string                                 │                │
│  │lastBloodDonationDate: Date                               │                │
│  │status: enum [pending, approved, rejected]                │                │
│  │approvedBy: ObjectId (ref: Admin)                         │                │
│  │approvedAt: Date                                          │                │
│  │createdAt: Date                                           │                │
│  │updatedAt: Date                                           │                │
│  └──────────────────────────────────────────────────────────┘                │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────┐                │
│  │         BloodRequest                                     │                │
│  ├──────────────────────────────────────────────────────────┤                │
│  │_id: ObjectId                                             │                │
│  │patientName: string                                       │                │
│  │bloodType: string                                         │                │
│  │units: number                                             │                │
│  │hospital: string                                          │                │
│  │reason: string                                            │                │
│  │urgency: enum [emergency, urgent, normal]                 │                │
│  │contactName: string                                       │                │
│  │contactPhone: string                                      │                │
│  │requiredDate: Date                                        │                │
│  │requestedBy: ObjectId (ref: User)                         │                │
│  │status: enum [pending, approved, fulfilled, rejected]     │                │
│  │createdAt: Date                                           │                │
│  │updatedAt: Date                                           │                │
│  │+updateQuantity(units)                                    │                │
│  │+calculateFulfillment()                                   │                │
│  └──────────────────────────────────────────────────────────┘                │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │         BloodPurchase                                                  │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │_id: ObjectId                                                           │  │
│  │trackingNumber: string (unique)                                         │  │
│  │purchasedBy: ObjectId (ref: User)                                       │  │
│  │sourceType: enum [organization, hospital]                              │  │
│  │sourceName: string                                                      │  │
│  │sourceId: string                                                        │  │
│  │bloodType: string                                                       │  │
│  │units: number                                                           │  │
│  │expiryDate: Date                                                        │  │
│  │price: number                                                           │  │
│  │totalPrice: number                                                      │  │
│  │paymentMethod: string                                                   │  │
│  │paymentStatus: enum [pending, completed, refunded]                     │  │
│  │status: enum [pending, approved, shipped, delivered]                   │  │
│  │shippingAddress: string                                                 │  │
│  │estimatedDelivery: Date                                                 │  │
│  │createdAt: Date                                                         │  │
│  │updatedAt: Date                                                         │  │
│  │+calculateTotal()                                                       │  │
│  │+updatePaymentStatus(status)                                            │  │
│  │+generateTrackingNumber()                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────┐         ┌──────────────────────────┐           │
│  │     Organization         │         │      Hospital            │           │
│  ├──────────────────────────┤         ├──────────────────────────┤           │
│  │_id: ObjectId             │         │_id: ObjectId             │           │
│  │name: string (unique)     │         │name: string (unique)     │           │
│  │status: enum              │         │emergencyHotline: string  │           │
│  │  [pending, approved,     │         │ambulance: string         │           │
│  │   rejected]              │         │phone: string             │           │
│  │rejectionReason: string   │         │email: string (unique)    │           │
│  │description: string       │         │address: string           │           │
│  │category: string          │         │website: string           │           │
│  │contact: string           │         │status: enum              │           │
│  │phone: string             │         │  [pending, approved,     │           │
│  │email: string (unique)    │         │   rejected]              │           │
│  │website: string           │         │rejectionReason: string   │           │
│  │address: string           │         │approvedBy: ObjectId      │           │
│  │isActive: boolean         │         │approvedAt: Date          │           │
│  │createdAt: Date           │         │category: string          │           │
│  │updatedAt: Date           │         │description: string       │           │
│  │+approve(adminId)         │         │bloodInventory: object    │           │
│  │+reject(reason)           │         │  {bloodType: quantity}   │           │
│  │                          │         │createdAt: Date           │           │
│  │                          │         │updatedAt: Date           │           │
│  │                          │         │+getInventory()           │           │
│  │                          │         │+updateInventory(type)    │           │
│  │                          │         │                          │           │
│  └──────────────────────────┘         └──────────────────────────┘           │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Frontend Components                                   │
│─────────────────────────────────────────────────────────────────────────────│
│                                                                               │
│  ┌────────────────────────────────────────────────────────────┐              │
│  │                      Root Layout                           │              │
│  │  ┌──────────────────────────────────────────────────────┐  │              │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │              │
│  │  │ │           Public Pages                          │  │  │              │
│  │  │ ├─────────────────────────────────────────────────┤  │  │              │
│  │  │ │• Hero.jsx                                       │  │  │              │
│  │  │ │• WhyDonate.jsx                                  │  │  │              │
│  │  │ │• DonationProcess.jsx                            │  │  │              │
│  │  │ │• BloodTypes.jsx                                 │  │  │              │
│  │  │ │• RhFactor.jsx                                   │  │  │              │
│  │  │ │• DonorApplication.jsx                           │  │  │              │
│  │  │ │• DonorApplicationRequest.jsx                    │  │  │              │
│  │  │ │• DonorApplicationStatus.jsx                     │  │  │              │
│  │  │ └─────────────────────────────────────────────────┘  │  │              │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │              │
│  │  │ │           Modal Components                      │  │  │              │
│  │  │ ├─────────────────────────────────────────────────┤  │  │              │
│  │  │ │• Modal.jsx - Reusable modal component          │  │  │              │
│  │  │ └─────────────────────────────────────────────────┘  │  │              │
│  │  │                                                      │  │              │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │              │
│  │  │ │       Shared Components (Shared/)               │  │  │              │
│  │  │ ├─────────────────────────────────────────────────┤  │  │              │
│  │  │ │• Navigation components                          │  │  │              │
│  │  │ │• Header/Footer components                       │  │  │              │
│  │  │ │• Common UI components                           │  │  │              │
│  │  │ └─────────────────────────────────────────────────┘  │  │              │
│  │  └──────────────────────────────────────────────────────┘  │              │
│  │                                                           │              │
│  │  ┌──────────────────────────────────────────────────────┐  │              │
│  │  │         Admin Layout (Protected Routes)             │  │              │
│  │  ├──────────────────────────────────────────────────────┤  │              │
│  │  │ ┌──────────────────────────────────────────────────┐ │  │              │
│  │  │ │     Authentication Pages                         │ │  │              │
│  │  │ ├──────────────────────────────────────────────────┤ │  │              │
│  │  │ │• AdminLogin.jsx                                  │ │  │              │
│  │  │ │• HospitalLogin.jsx (if exists)                   │ │  │              │
│  │  │ └──────────────────────────────────────────────────┘ │  │              │
│  │  │ ┌──────────────────────────────────────────────────┐ │  │              │
│  │  │ │  Admin Dashboard Pages                           │ │  │              │
│  │  │ ├──────────────────────────────────────────────────┤ │  │              │
│  │  │ │• AdminDashboard.jsx - Main dashboard             │ │  │              │
│  │  │ │• AdminDashboardMain.jsx - Dashboard content      │ │  │              │
│  │  │ │• AdminAnalytics.jsx - Analytics and stats        │ │  │              │
│  │  │ └──────────────────────────────────────────────────┘ │  │              │
│  │  │ ┌──────────────────────────────────────────────────┐ │  │              │
│  │  │ │  Admin Management Pages                          │ │  │              │
│  │  │ ├──────────────────────────────────────────────────┤ │  │              │
│  │  │ │• AdminDonors.jsx - Donor list management         │ │  │              │
│  │  │ │• AdminDonorManagement.jsx - Detailed management  │ │  │              │
│  │  │ │• AdminHospitals.jsx - Hospital list              │ │  │              │
│  │  │ │• AdminBloodRequests.jsx - Blood request mgmt     │ │  │              │
│  │  │ │• AdminInventory.jsx - Blood inventory tracking   │ │  │              │
│  │  │ └──────────────────────────────────────────────────┘ │  │              │
│  │  │                                                      │  │              │
│  │  └──────────────────────────────────────────────────────┘  │              │
│  │                                                           │              │
│  └────────────────────────────────────────────────────────────┘              │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Relationships

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Data Flow Relationships                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Registration/Authentication Flow:                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ User (Frontend) → AuthController → AuthService → User Model (DB)    │   │
│  │     ↑                                                              │   │
│  │     └──────────────── Tokens & Response ─────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Donor Application Flow:                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ User → DonorApplicationController → DonorApplicationService         │   │
│  │         ↓                                                             │   │
│  │    DonorApplication Model ← Validated Data                           │   │
│  │         ↓                                                             │   │
│  │    Admin Review → AdminController → Update Status                   │   │
│  │         ↓                                                             │   │
│  │    Approved/Rejected Response back to User                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Blood Request Flow:                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Hospital/User → BloodRequestController → BloodRequestService        │   │
│  │         ↓                                                             │   │
│  │    BloodRequest Model (Created with pending status)                  │   │
│  │         ↓                                                             │   │
│  │    Find Available Donors (Search DonorApplication by bloodType)      │   │
│  │         ↓                                                             │   │
│  │    Admin Approval & Status Update                                    │   │
│  │         ↓                                                             │   │
│  │    BloodPurchase or Direct Fulfillment                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Blood Purchase Flow:                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ User → BloodPurchaseController → BloodPurchaseService               │   │
│  │         ↓                                                             │   │
│  │    BloodPurchase Model (From Hospital or Organization)              │   │
│  │         ↓                                                             │   │
│  │    Payment Processing (External Service)                             │   │
│  │         ↓                                                             │   │
│  │    Update BloodPurchase Status & Inventory                           │   │
│  │         ↓                                                             │   │
│  │    Shipping & Delivery Tracking                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Admin Operations Flow:                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Admin → AdminController (with authentication middleware)             │   │
│  │         ↓                                                             │   │
│  │    ├─→ Approve/Reject Organizations                                 │   │
│  │    ├─→ Manage Hospitals                                              │   │
│  │    ├─→ Review Donor Applications                                     │   │
│  │    ├─→ Process Blood Requests                                        │   │
│  │    └─→ Generate Reports & Analytics                                  │   │
│  │         ↓                                                             │   │
│  │    Update respective Models in Database                              │   │
│  │         ↓                                                             │   │
│  │    Return Dashboard Data & Statistics                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoint Mapping to Controllers

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    API Routes & Controller Mapping                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AUTH ROUTES (/api/auth)                                                    │
│  ├─ POST /register          → AuthController.register()                     │
│  ├─ POST /login             → AuthController.login()                        │
│  ├─ POST /refresh-token     → AuthController.refreshToken()                │
│  └─ POST /logout            → AuthController.logout()                       │
│                                                                              │
│  ADMIN ROUTES (/api/admin)                                                  │
│  ├─ POST /login             → AdminController.login()                       │
│  ├─ GET /organizations      → AdminController.getOrganizations()            │
│  ├─ POST /approve-org/:id   → AdminController.approveOrganization()         │
│  ├─ POST /reject-org/:id    → AdminController.rejectOrganization()          │
│  ├─ GET /hospitals          → AdminController.getHospitals()                │
│  ├─ POST /approve-hospital  → AdminController.approveHospital()             │
│  ├─ POST /reject-hospital   → AdminController.rejectHospital()              │
│  └─ GET /dashboard          → AdminController.getDashboardStats()           │
│                                                                              │
│  USER/DONOR ROUTES (/api/donors)                                            │
│  ├─ GET /                   → UserController.getDonors()                    │
│  ├─ GET /:id                → UserController.getDonorById()                 │
│  └─ GET /search             → UserController.searchDonors()                 │
│                                                                              │
│  BLOOD REQUESTS ROUTES (/api/blood-requests)                               │
│  ├─ POST /                  → BloodRequestController.createRequest()        │
│  ├─ GET /                   → BloodRequestController.getRequests()          │
│  ├─ GET /:id                → BloodRequestController.getRequestById()       │
│  ├─ PUT /:id/status         → BloodRequestController.updateStatus()         │
│  └─ DELETE /:id             → BloodRequestController.deleteRequest()        │
│                                                                              │
│  BLOOD PURCHASES ROUTES (/api/blood-purchases)                             │
│  ├─ POST /                  → BloodPurchaseController.createPurchase()      │
│  ├─ GET /                   → BloodPurchaseController.getPurchases()        │
│  ├─ GET /:id                → BloodPurchaseController.getPurchaseById()     │
│  └─ PUT /:id/status         → BloodPurchaseController.updateStatus()        │
│                                                                              │
│  DONOR APPLICATIONS ROUTES (/api/donor-applications)                       │
│  ├─ POST /                  → DonorAppController.submitApplication()        │
│  ├─ GET /user/:userId       → DonorAppController.getApplications()          │
│  ├─ GET /:id                → DonorAppController.getApplicationById()       │
│  └─ PUT /:id/status         → DonorAppController.updateStatus()             │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Relationships & Associations

### One-to-Many Relationships
- **User has many** DonorApplications
- **User has many** BloodRequests (as requester)
- **User has many** BloodPurchases (as purchaser)
- **Admin manages many** Organizations
- **Admin manages many** Hospitals
- **Admin reviews many** DonorApplications

### Referenced Relationships
- **DonorApplication references** User (via userId)
- **DonorApplication references** Admin (via approvedBy)
- **BloodRequest references** User (via requestedBy)
- **BloodRequest references** Hospital (via hospital name)
- **BloodPurchase references** User (via purchasedBy)
- **BloodPurchase references** Organization/Hospital (via sourceId)
- **Hospital references** Admin (via approvedBy)
- **Organization references** Admin (via management)

### Status Workflows
- **Organization**: pending → approved/rejected
- **Hospital**: pending → approved/rejected
- **DonorApplication**: pending → approved/rejected
- **BloodRequest**: pending → approved → fulfilled/rejected
- **BloodPurchase**: pending → approved → shipped → delivered (completed/refunded)

---

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Validation**: Custom middleware & schema validation

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Context API
- **HTTP Client**: Axios (implied from structure)

### Infrastructure
- **Deployment**: Vercel (indicated by vercel.json files)
- **Backend Deployment**: Vercel Functions/Node.js

---

## Authentication & Authorization Middleware

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   Middleware Architecture                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  auth.js (User Authentication)                                              │
│  ├─ Validates JWT tokens                                                    │
│  ├─ Extracts userId from token                                              │
│  └─ Protects user routes                                                    │
│                                                                              │
│  adminAuth.js (Admin Authentication)                                        │
│  ├─ Validates admin JWT tokens                                              │
│  ├─ Extracts adminId, role, organizationId, hospitalId                      │
│  ├─ Checks admin status (isActive)                                          │
│  └─ Protects admin routes                                                   │
│                                                                              │
│  superAdminOnly.js (Authorization)                                          │
│  ├─ Verifies admin role is 'super_admin'                                    │
│  └─ Restricts super admin only operations                                   │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

The BloodBridge-Foundation project follows a **3-tier MVC architecture**:

1. **Presentation Layer** (Frontend)
   - React components
   - Public pages and protected admin pages
   - Modal dialogs and shared components

2. **Business Logic Layer** (Services)
   - Authentication & User management
   - Donor application processing
   - Blood request & purchase handling
   - Admin operations

3. **Data Layer** (Models)
   - User & Admin accounts
   - DonorApplications
   - BloodRequests & BloodPurchases
   - Hospital & Organization management

The system manages **blood donation workflows**, including **donor registration**, **blood requests**, **blood purchasing**, and **admin oversight** with role-based access control.
