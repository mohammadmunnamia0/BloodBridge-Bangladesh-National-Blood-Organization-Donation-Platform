# Donor Feature Implementation - Complete Guide

## Overview
A comprehensive donor access control and admin management system has been implemented. This system includes user registration with normal user role, separate donor applications, admin review and approval workflows, access control for the donor list, and a centralized donor management admin panel.

---

## Database Models

### 1. DonorApplication Model
**Location:** `server/models/DonorApplication.js`

**Key Fields:**
- `userId`: Reference to the User who applied
- `fullName`, `email`, `phone`: Applicant contact information
- `bloodType`, `age`, `dateOfBirth`: Donor medical information
- `address`, `city`, `state`, `zipCode`: Location details
- `weight`, `gender`, `medicalConditions`: Additional health info
- `status`: "pending" | "approved" | "rejected"
- `rejectionReason`: Reason if rejected
- `reviewedBy`, `reviewedAt`: Admin review information
- `appliedAt`, `updatedAt`: Timestamps

### 2. User Model Updates
**Location:** `server/models/User.js`

**New Fields Added:**
- `isDonor`: Boolean flag (default: false) - marks user as verified donor
- `donorVerifiedAt`: Date when donor was approved by admin

---

## Backend API Endpoints

### Donor Routes (`/api/donors`)

#### 1. Submit Donor Application
```
POST /api/donors/apply
Authorization: Bearer {token}

Request Body:
{
  "bloodType": "O+",
  "age": 28,
  "address": "123 Main St",
  "dateOfBirth": "1995-06-15",
  "weight": 70,
  "city": "Dhaka",
  "state": "Dhaka",
  "zipCode": "1000",
  "gender": "male",
  "medicalConditions": "None"
}

Response:
{
  "message": "Thank you for applying to become a Donor. You will be contacted very soon for verification.",
  "application": {
    "id": "...",
    "status": "pending",
    "appliedAt": "..."
  }
}
```

#### 2. Get Application Status
```
GET /api/donors/application-status
Authorization: Bearer {token}

Response:
{
  "hasApplication": true,
  "application": {
    "_id": "...",
    "status": "pending",
    "appliedAt": "...",
    ...
  }
}
```

#### 3. Get Verified Donors List
```
GET /api/donors/list?bloodType=O+&city=Dhaka&page=1&limit=10
Authorization: Bearer {token}

Response (Verified Donors Only):
{
  "donors": [
    {
      "fullName": "John Doe",
      "age": 28,
      "bloodType": "O+",
      "lastDonation": "2024-01-10",
      "address": "123 Main St",
      "city": "Dhaka",
      "state": "Dhaka"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Access Control:**
- Returns 403 error if user is not a verified donor
- Error message: "You do not have permission to view the Donor List. To access the Donor List, you must be a Verified Donor. Please become a Donor first to view other Donors' information."

### Admin Routes (`/api/admin/donors`)

#### 1. Get Pending Donor Applications
```
GET /api/admin/donors/requests?status=pending&page=1&limit=10
Authorization: Bearer {adminToken}

Response:
{
  "applications": [
    {
      "_id": "...",
      "userId": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "bloodType": "O+",
      "age": 28,
      "status": "pending",
      "appliedAt": "..."
    }
  ],
  "pagination": { ... }
}
```

#### 2. Approve Donor Application
```
PATCH /api/admin/donors/requests/{applicationId}/approve
Authorization: Bearer {adminToken}

Response:
{
  "message": "Donor application approved successfully",
  "application": { ... }
}

Side Effects:
- Sets application.status = "approved"
- Sets user.isDonor = true
- Sets user.donorVerifiedAt = current date
```

#### 3. Reject Donor Application
```
PATCH /api/admin/donors/requests/{applicationId}/reject
Authorization: Bearer {adminToken}

Request Body:
{
  "rejectionReason": "Medical condition found"
}

Response:
{
  "message": "Donor application rejected",
  "application": { ... }
}
```

#### 4. Get All Users (Manage Users)
```
GET /api/admin/donors/users?bloodType=all&city=all&page=1&limit=10
Authorization: Bearer {adminToken}

Response:
{
  "users": [
    {
      "_id": "...",
      "fullName": "...",
      "email": "...",
      "bloodType": "...",
      "isDonor": true/false,
      ...
    }
  ],
  "pagination": { ... }
}
```

#### 5. Get All Verified Donors
```
GET /api/admin/donors/verified?bloodType=all&city=all&page=1&limit=10
Authorization: Bearer {adminToken}

Response:
{
  "donors": [ ... ],
  "pagination": { ... }
}
```

#### 6. Update Donor Information
```
PATCH /api/admin/donors/{donorId}
Authorization: Bearer {adminToken}

Request Body:
{
  "fullName": "Jane Doe",
  "bloodType": "AB+",
  ...
}

Response:
{
  "message": "Donor information updated successfully",
  "donor": { ... }
}
```

#### 7. Block/Unblock Donor
```
PATCH /api/admin/donors/{donorId}/block
Authorization: Bearer {adminToken}

Request Body:
{
  "isBanned": true,
  "banReason": "Violating terms"
}

Response:
{
  "message": "Donor blocked successfully",
  "donor": { ... }
}
```

#### 8. Get Donor Statistics
```
GET /api/admin/donors/stats
Authorization: Bearer {adminToken}

Response:
{
  "totalUsers": 1500,
  "totalDonors": 350,
  "pendingApplications": 45,
  "approvedApplications": 305,
  "rejectedApplications": 5
}
```

---

## Frontend Components

### 1. DonorApplication Component
**Location:** `client/src/Components/DonorApplication.jsx`

**Features:**
- Display current donor application status
- Form to submit new donor application
- Show success message after submission
- Display rejection reason if rejected
- Option to reapply if rejected
- Pre-fills form with user data from profile

**UI Flow:**
1. Shows application status if exists
2. Shows "Become a Donor" button if no application
3. Shows form when "Apply Now" clicked
4. Form includes all required and optional fields
5. Displays confirmation message after submission

### 2. DonorList Page
**Location:** `client/src/pages/DonorList.jsx`

**Features:**
- Displays all verified donors
- Filter by blood type and city
- Pagination support
- Shows donor information:
  - Name
  - Age
  - Blood Type (highlighted badge)
  - Address
  - Last Donation Date
  - Donation Eligibility Status (can donate/waiting period)

**Access Control:**
- Accessible only to verified donors
- Shows permission error message for non-donors
- Redirects to profile if not logged in

**UI Elements:**
- Search filters (blood type, city)
- Donor cards with key information
- Eligibility status indicator
- Pagination controls

### 3. AdminDonorManagement Page
**Location:** `client/src/pages/AdminDonorManagement.jsx`

**Three Tabs:**

#### Tab 1: Donor Requests
- View pending donor applications
- Approve applications (marks user as verified donor)
- Reject applications (with rejection reason modal)
- Shows badge count of pending applications

#### Tab 2: Manage Users
- View all registered users
- Show user status (Verified Donor / Regular User)
- Filter by blood type and city

#### Tab 3: Verified Donors
- View all verified donors
- Show key information in table format
- Block/Unblock donors functionality

**Statistics Dashboard:**
- Total Users count
- Verified Donors count
- Pending Applications count
- Approved Applications count
- Rejected Applications count

---

## Frontend Routes

### User Routes
```javascript
GET  /donor-list                    // View verified donors (protected)
```

### Admin Routes
```javascript
GET  /admin/donor-management        // Donor Management Hub
```

### Profile Updates
- Added "Donor Application" tab in `/profile` page
- Accessible from Profile > Donor Application tab

---

## User Workflow

### Becoming a Donor

1. **User Registration**
   - User registers on platform
   - Automatically assigned "Normal User" role
   - `isDonor = false`

2. **Apply for Donor Status**
   - User navigates to Profile > Donor Application
   - Clicks "Apply Now"
   - Fills in donor application form
   - Submits application
   - Shows confirmation: "Thank you for applying to become a Donor. You will be contacted very soon for verification."

3. **Admin Review**
   - Admin navigates to Admin > Donor Management > Donor Requests
   - Reviews pending applications
   - Clicks "Approve" or "Reject"
   - If Approved:
     - User's `isDonor = true`
     - `donorVerifiedAt` is set
     - User can now access Donor List
   - If Rejected:
     - User sees rejection reason
     - Can reapply with "Reapply" button

4. **Access Donor List**
   - User navigates to Donor List
   - System verifies user is verified donor
   - If not verified, shows permission error
   - If verified, displays all verified donors with filters

---

## Admin Workflow

### Managing Donors

1. **View Dashboard Statistics**
   - See total users, verified donors, pending applications
   - Quick overview of donor system health

2. **Review Donor Requests**
   - View pending applications (sorted by newest first)
   - See applicant information and blood type
   - Approve (marks user as verified donor)
   - Reject (requires rejection reason)

3. **Manage Users**
   - View all registered users
   - See their donor status
   - Filter by blood type, city
   - Pagination support

4. **Manage Verified Donors**
   - View all verified donors in table format
   - See last donation date
   - Block/unblock donors as needed
   - Edit donor information if needed

---

## Key Features

### 1. Role-Based Access Control
- **Normal User**: Cannot access donor list
- **Verified Donor**: Can access donor list and filter donors
- **Admin**: Can manage applications, users, and donors

### 2. Application Status Tracking
- Pending: Awaiting admin review
- Approved: User is verified donor
- Rejected: User can see reason and reapply

### 3. Donor Eligibility
- Shows if donor can donate (90+ days since last donation)
- Shows if donor is in waiting period

### 4. Data Validation
- Age, weight, blood type validations
- Required field checks
- Email uniqueness check

### 5. Security
- Bearer token authentication required
- Admin-only operations protected
- User can only see their own application status

---

## Error Handling

### User Errors
- Incomplete form: "Blood type, age, and address are required"
- Already applied: "You already have a pending donor application"
- Already approved: "You are already a verified donor"
- Access denied: "You do not have permission to view the Donor List..."

### Admin Errors
- Application not found
- Application not pending
- Invalid rejection reason

---

## Database Relationships

```
User (1) <-- (1) DonorApplication
├── isDonor: Boolean
├── donorVerifiedAt: Date
└── ...

Admin (1) --- (Many) DonorApplication
└── reviewedBy: AdminId
```

---

## API Integration Points

### Frontend to Backend
1. **Register/Login**: POST `/api/auth/register`, POST `/api/auth/login`
2. **Get Profile**: GET `/api/auth/profile`
3. **Apply for Donor**: POST `/api/donors/apply`
4. **Check Application Status**: GET `/api/donors/application-status`
5. **Get Donor List**: GET `/api/donors/list`
6. **Admin Stats**: GET `/api/admin/donors/stats`
7. **Admin Operations**: PATCH/GET `/api/admin/donors/...`

---

## Files Created/Modified

### Created Files
- `server/models/DonorApplication.js`
- `client/src/Components/DonorApplication.jsx`
- `client/src/pages/DonorList.jsx`
- `client/src/pages/AdminDonorManagement.jsx`

### Modified Files
- `server/models/User.js` (added isDonor, donorVerifiedAt fields)
- `server/routes/donors.js` (replaced with new donor routes)
- `server/routes/adminRoutes.js` (added donor management endpoints)
- `client/src/pages/Profile.jsx` (added Donor Application tab)
- `client/src/routes/Routes.jsx` (added new routes)

---

## Testing Checklist

- [ ] User can register (default role: Normal User)
- [ ] User can apply for donor status
- [ ] Confirmation message shown after application
- [ ] Admin can view pending applications
- [ ] Admin can approve application
- [ ] Approved user sees verification status
- [ ] Approved user can access Donor List
- [ ] Non-approved user cannot access Donor List (shows error)
- [ ] Admin can reject application with reason
- [ ] Rejected user can reapply
- [ ] Admin can view all users and verified donors
- [ ] Admin can block/unblock donors
- [ ] Filters work on Donor List (blood type, city)
- [ ] Pagination works correctly
- [ ] Statistics display correct counts
- [ ] Donor eligibility status shows correctly

---

## Future Enhancements

1. Email notifications for application status
2. Donation history tracking
3. Donor badges/achievements
4. Automatic eligibility calculation
5. Donation center location mapping
6. Donation appointment scheduling
7. Blood compatibility checking
8. Donor feedback and ratings

---

## Configuration Notes

- All routes are protected with JWT authentication
- Admin routes require admin token
- User routes require user token
- Default pagination: 10 items per page
- Donation eligibility: 90+ days between donations

