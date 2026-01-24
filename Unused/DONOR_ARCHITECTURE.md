# Donor Feature System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BLOODBRIDGE PLATFORM                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USER ROUTES                          ADMIN ROUTES                      │
│  ┌──────────────────┐               ┌──────────────────┐               │
│  │ /donor-list      │               │ /admin/donor-    │               │
│  │ (DonorList.jsx)  │               │ management       │               │
│  │                  │               │ (AdminDonor      │               │
│  │ • View donors    │               │ Management.jsx)  │               │
│  │ • Filter search  │               │                  │               │
│  │ • Check access   │               │ • View stats     │               │
│  └──────────────────┘               │ • Approve/reject │               │
│                                     │ • Manage users   │               │
│  /profile                           │ • Block donors   │               │
│  ┌──────────────────┐               │ • Update info    │               │
│  │ Donor            │               └──────────────────┘               │
│  │ Application Tab  │                                                  │
│  │ (DonorApp.jsx)   │                                                  │
│  │                  │                                                  │
│  │ • Apply form     │                                                  │
│  │ • Check status   │                                                  │
│  │ • View rejection │                                                  │
│  │ • Reapply btn    │                                                  │
│  └──────────────────┘                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                              ↓ API CALLS ↓

┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express/Node.js)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USER ENDPOINTS (/api/donors)      ADMIN ENDPOINTS (/api/admin/donors) │
│  ┌────────────────────────┐        ┌───────────────────────────────┐  │
│  │ POST /apply            │        │ GET /stats                    │  │
│  │ GET /application-      │        │ GET /requests (pending)       │  │
│  │      status            │        │ PATCH /requests/{id}/approve  │  │
│  │ GET /list (protected)  │        │ PATCH /requests/{id}/reject   │  │
│  │                        │        │ GET /users                    │  │
│  │ Middleware:            │        │ GET /verified                 │  │
│  │ • Auth (user token)    │        │ PATCH /{id}                   │  │
│  │ • Verify verified      │        │ PATCH /{id}/block             │  │
│  │   donor (for /list)    │        │                               │  │
│  │                        │        │ Middleware:                   │  │
│  │                        │        │ • Auth (admin token)          │  │
│  │                        │        │ • Super admin only            │  │
│  └────────────────────────┘        └───────────────────────────────┘  │
│                                                                          │
│                         ROUTE HANDLERS                                  │
│              (Validation, Auth, Business Logic)                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                         ↓ DATABASE QUERIES ↓

┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  COLLECTIONS                                                            │
│  ┌──────────────────────┐        ┌──────────────────────────────────┐ │
│  │ Users                │        │ DonorApplications                │ │
│  │ ──────────────────   │        │ ──────────────────────────────   │ │
│  │ • _id (PK)          │        │ • _id (PK)                      │ │
│  │ • fullName          │        │ • userId (FK→Users)             │ │
│  │ • email             │        │ • fullName                      │ │
│  │ • phone             │        │ • email                         │ │
│  │ • bloodType         │        │ • phone                         │ │
│  │ • address           │        │ • bloodType                     │ │
│  │ • dateOfBirth       │        │ • age                           │ │
│  │ • weight            │        │ • dateOfBirth                   │ │
│  │ • lastDonation      │        │ • address                       │ │
│  │ • city              │        │ • weight                        │ │
│  │ • state             │        │ • city/state/zipCode           │ │
│  │ • zipCode           │        │ • gender                        │ │
│  │ • gender            │        │ • medicalConditions             │ │
│  │ • medicalConditions │        │ • status (pending/approved/...) │ │
│  │ • role              │        │ • rejectionReason               │ │
│  │ • isBanned          │        │ • reviewedBy (FK→Admins)        │ │
│  │ • bannedAt          │        │ • reviewedAt                    │ │
│  │ • createdAt         │        │ • appliedAt                     │ │
│  │                     │        │ • updatedAt                     │ │
│  │ [NEW FIELDS]        │        └──────────────────────────────────┘ │
│  │ • isDonor           │                                              │
│  │ • donorVerifiedAt   │        OTHER COLLECTIONS                    │
│  │                     │        (Already existing - unchanged)        │
│  │                     │        • Organizations                       │
│  │                     │        • Hospitals                           │
│  │                     │        • Admins                              │
│  │                     │        • BloodPurchases                      │
│  │                     │        • BloodRequests                       │
│  └──────────────────────┘        • etc.                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER DONOR APPLICATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

USER REGISTRATION
└──> User.create({ isDonor: false, donorVerifiedAt: null })

       ↓

DONOR APPLICATION
└──> User navigates to Profile → Donor Application tab
└──> Clicks "Apply Now"
└──> Fills form (blood type, age, address, etc.)
└──> POST /api/donors/apply

       ↓

DATABASE: DonorApplication.create({
  userId: user._id,
  fullName: user.fullName,
  email: user.email,
  bloodType: formData.bloodType,
  age: formData.age,
  address: formData.address,
  status: "pending",
  appliedAt: Date.now()
})

       ↓

SUCCESS MESSAGE
└──> "Thank you for applying to become a Donor..."

       ↓

ADMIN REVIEW
└──> Admin navigates to /admin/donor-management
└──> Views Donor Requests tab
└──> Sees pending application (GET /api/admin/donors/requests)

       ↓

ADMIN ACTION (Approve)
└──> Clicks "Approve" button
└──> PATCH /api/admin/donors/requests/{appId}/approve

       ↓

DATABASE UPDATE:
├──> DonorApplication.updateOne({
│    status: "approved",
│    reviewedBy: admin._id,
│    reviewedAt: Date.now()
│  })
└──> User.updateOne({
     isDonor: true,
     donorVerifiedAt: Date.now()
   })

       ↓

USER GAINS ACCESS
└──> User navigates to /donor-list
└──> GET /api/donors/list (now ALLOWED)
└──> Sees all verified donors with filters
└──> Can filter by blood type, city
└──> Can see last donation date & eligibility status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADMIN ACTION (Reject)
└──> Clicks "Reject" button
└──> Modal appears for rejection reason
└──> PATCH /api/admin/donors/requests/{appId}/reject
└──> { rejectionReason: "..." }

       ↓

DATABASE UPDATE:
└──> DonorApplication.updateOne({
     status: "rejected",
     rejectionReason: "Medical condition found",
     reviewedBy: admin._id,
     reviewedAt: Date.now()
   })

       ↓

USER SEES REJECTION
└──> User views Profile → Donor Application
└──> Sees status: "Rejected"
└──> Sees rejection reason
└──> Can click "Reapply" button

       ↓

REAPPLY
└──> User clicks "Reapply"
└──> Form appears again
└──> Submits new application
└──> Goes back to ADMIN REVIEW step
```

## Component Hierarchy

```
Root
├── Public Routes
│   ├── Home
│   ├── Login
│   ├── Register
│   └── ...other routes...
│
├── Protected Routes (Logged-in Users)
│   ├── Profile
│   │   └── Tabs:
│   │       ├── Personal Information
│   │       ├── Purchase History
│   │       ├── Blood Requests
│   │       ├── Shipping Status
│   │       └── Donor Application ← NEW
│   │           └── DonorApplication Component ← NEW
│   │
│   └── DonorList ← NEW (Verified Donors Only)
│
└── Protected Routes (Admin)
    └── Admin Dashboard
        └── Admin Layout
            ├── Main Dashboard
            ├── Purchases
            ├── Analytics
            ├── Inventory
            ├── Pricing
            ├── Donors ← OLD
            │   └── AdminDonors (backward compat)
            │
            ├── Donor Management ← NEW
            │   └── AdminDonorManagement ← NEW
            │       └── Tabs:
            │           ├── Donor Requests
            │           ├── Manage Users
            │           └── Verified Donors
            │
            ├── Blood Requests
            ├── Users
            ├── Hospitals
            └── Organizations
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                  DonorApplication Component                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ State:                                                            │
│ • applicationStatus: null | { id, status, appliedAt, ... }      │
│ • loading: boolean                                               │
│ • submitting: boolean                                            │
│ • showForm: boolean                                              │
│ • successMessage: string                                         │
│ • formData: { bloodType, age, address, ... }                   │
│                                                                   │
│ Effects:                                                          │
│ • useEffect: fetchApplicationStatus (on mount)                  │
│ • useEffect: fetchUserData (on mount)                           │
│                                                                   │
│ Handlers:                                                         │
│ • handleSubmitApplication: POST /api/donors/apply               │
│ • handleInputChange: Update formData                            │
│ • handleReapply: Show form again                                │
│                                                                   │
│ Render:                                                           │
│ • If applicationStatus exists → Show status card                │
│ • If no application → Show "Become a Donor" button              │
│ • If showForm → Show application form                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    AdminDonorManagement Component                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ State:                                                            │
│ • activeTab: "requests" | "users" | "verified"                  │
│ • donorRequests: [ DonorApplication ]                           │
│ • allUsers: [ User ]                                            │
│ • verifiedDonors: [ User ]                                      │
│ • stats: { totalUsers, totalDonors, ... }                       │
│ • pagination: { page, total, pages }                            │
│ • selectedApplication: DonorApplication                         │
│ • showRejectModal: boolean                                      │
│ • rejectionReason: string                                       │
│                                                                   │
│ Effects:                                                          │
│ • useEffect: fetchContent (on activeTab/filter/page change)    │
│ • useEffect: fetchStats (on mount)                              │
│                                                                   │
│ Handlers:                                                         │
│ • handleApproveDonor: PATCH /api/admin/donors/requests/.../app  │
│ • handleRejectDonor: PATCH /api/admin/donors/requests/.../rej   │
│ • handleBlockDonor: PATCH /api/admin/donors/{id}/block          │
│ • setActiveTab: Switch tabs                                      │
│                                                                   │
│ Render:                                                           │
│ • Statistics cards (5 cards)                                     │
│ • Tab navigation (Requests, Users, Verified)                    │
│ • Tab content based on activeTab                                │
│ • Pagination controls                                            │
│ • Modal for rejection reason                                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      DonorList Component                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ State:                                                            │
│ • donors: [ { fullName, age, bloodType, ... } ]                │
│ • loading: boolean                                               │
│ • error: string | null                                          │
│ • filter: { bloodType, city }                                   │
│ • pagination: { page, total, pages }                            │
│ • searchCity: string                                             │
│                                                                   │
│ Effects:                                                          │
│ • useEffect: fetchDonors (on filter/page change)                │
│ • useEffect: Check if verified donor (on mount)                 │
│                                                                   │
│ Handlers:                                                         │
│ • handleSearch: Update filter and reset pagination              │
│ • handleFilterChange: Update filter                              │
│                                                                   │
│ Render:                                                           │
│ • If error → Show permission error with action button           │
│ • If loading → Show spinner                                      │
│ • Filter controls (blood type, city search)                     │
│ • Donor cards grid (blood type badge, eligibility)              │
│ • Pagination controls                                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## API Communication Sequence

```
APPROVE APPLICATION FLOW:
                                                                    
┌─────────┐                    ┌──────────┐                 ┌──────────┐
│Frontend │                    │Backend   │                 │Database  │
└────┬────┘                    └────┬─────┘                 └────┬─────┘
     │                              │                             │
     │ Click "Approve" button       │                             │
     │ handleApproveDonor()         │                             │
     │                              │                             │
     │ PATCH /api/admin/donors/     │                             │
     │ requests/{id}/approve        │                             │
     ├─────────────────────────────>│                             │
     │                              │                             │
     │                              │ adminAuth middleware        │
     │                              │ superAdminOnly check        │
     │                              │                             │
     │                              │ findById(applicationId)     │
     │                              ├────────────────────────────>│
     │                              │                             │
     │                              │        DonorApplication     │
     │                              │<────────────────────────────┤
     │                              │                             │
     │                              │ Check if status === pending │
     │                              │                             │
     │                              │ Update DonorApplication     │
     │                              ├────────────────────────────>│
     │                              │ {status: "approved",        │
     │                              │  reviewedBy, reviewedAt}    │
     │                              │                             │
     │                              │        Updated record       │
     │                              │<────────────────────────────┤
     │                              │                             │
     │                              │ Get userId from application │
     │                              │ findById(userId)            │
     │                              ├────────────────────────────>│
     │                              │                             │
     │                              │        User record          │
     │                              │<────────────────────────────┤
     │                              │                             │
     │                              │ Update User                 │
     │                              ├────────────────────────────>│
     │                              │ {isDonor: true,             │
     │                              │  donorVerifiedAt: now}      │
     │                              │                             │
     │                              │        Updated User         │
     │                              │<────────────────────────────┤
     │                              │                             │
     │ Return success response      │                             │
     │<─────────────────────────────┤                             │
     │                              │                             │
     │ alert(message)               │                             │
     │ fetchContent() (refresh)     │                             │
     │ fetchStats() (update count)  │                             │
     │                              │                             │
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: Authentication
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│ User Routes (/api/donors):                                     │
│  └─ Require: Bearer token (user JWT)                           │
│  └─ Verify: Token signature and expiration                     │
│  └─ Extract: userId from token                                 │
│                                                                  │
│ Admin Routes (/api/admin/donors):                              │
│  └─ Require: Bearer token (admin JWT)                          │
│  └─ Verify: Token signature and expiration                     │
│  └─ Verify: adminRole === "super_admin"                        │
│  └─ Extract: adminId from token                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

LAYER 2: Authorization
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│ GET /api/donors/list:                                          │
│  └─ Check: User has isDonor === true                           │
│  └─ Deny: 403 if not verified donor                            │
│                                                                  │
│ PATCH /api/admin/donors/requests/{id}/approve:                │
│  └─ Check: Admin role === "super_admin"                        │
│  └─ Deny: 403 if not super admin                               │
│                                                                  │
│ POST /api/donors/apply:                                        │
│  └─ Check: No existing pending/approved application            │
│  └─ Deny: 400 if already applied or verified                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

LAYER 3: Input Validation
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│ POST /api/donors/apply:                                        │
│  ├─ bloodType: Must be one of 8 valid types                   │
│  ├─ age: Must be 16-120                                        │
│  ├─ address: Required, non-empty                               │
│  ├─ dateOfBirth: Valid date format                             │
│  ├─ weight: >= 45 kg                                           │
│  └─ All fields: Trim, sanitize                                 │
│                                                                  │
│ Server-side validation:                                         │
│  ├─ Validate all inputs before database insert                 │
│  ├─ Return 400 for validation errors                           │
│  └─ Never trust client data                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

LAYER 4: Data Protection
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│ Password Handling:                                              │
│  └─ NEVER return password in responses                          │
│  └─ Password field: .select("-password")                        │
│                                                                  │
│ Sensitive Data:                                                 │
│  └─ Filter sensitive fields from responses                      │
│  └─ Only return necessary information                           │
│                                                                  │
│ User Isolation:                                                 │
│  └─ Users can only see their own data                           │
│  └─ Filter results by userId automatically                      │
│                                                                  │
│ Admin Audit Trail:                                              │
│  └─ Record: reviewedBy, reviewedAt                              │
│  └─ Maintain: Full history of changes                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
CURRENT ARCHITECTURE:
- Single MongoDB database
- RESTful API (stateless)
- Frontend: React SPA

READY FOR SCALING:
✓ Pagination built-in (prevents large data transfers)
✓ Indexes on frequently queried fields (userId, status)
✓ Stateless API design (horizontal scaling)
✓ JWT authentication (no session storage needed)
✓ Separate collections (easy to shard)

FUTURE ENHANCEMENTS:
• Database indexing strategy
  - userId: Better performance for user lookups
  - status: Filter pending applications quickly
  - createdAt/appliedAt: Time-based queries
  
• Caching layer (Redis)
  - Cache donor lists
  - Cache statistics
  - Reduce database hits
  
• Queue system (Bull/RabbitMQ)
  - Email notifications for approvals
  - Async operations
  - Better performance
  
• Microservices
  - Donor service (separate)
  - Admin service (separate)
  - Shared auth service
  
• Database replication
  - Master-slave setup
  - Read replicas for analytics
```

