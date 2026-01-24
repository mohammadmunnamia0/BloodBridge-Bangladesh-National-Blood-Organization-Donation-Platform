# Donor Feature - Quick Reference Guide

## 🎯 Key Concepts

### User Roles & Status
```
Registration → Normal User (isDonor: false)
         ↓
    Apply for Donor
         ↓
Admin Reviews ← Approve → Verified Donor (isDonor: true)
         ↓
       Reject → Can Reapply
```

## 📱 User Actions

### 1. Apply for Donor Status
**Path:** Profile → Donor Application → Apply Now
- Fills out donor application form
- Required fields: Blood Type, Date of Birth, Address
- Optional fields: Weight, City, State, Zip, Gender, Medical Conditions
- Success message: "Thank you for applying to become a Donor..."

### 2. Check Application Status
**Path:** Profile → Donor Application
- Pending: Waiting for admin review
- Approved: Now a verified donor (can access donor list)
- Rejected: Shows rejection reason, can reapply

### 3. Access Donor List
**Path:** Donor List (top navigation)
- Only verified donors can access
- Search by blood type, city
- View other verified donors' info
- See last donation date & eligibility

## 🛠️ Admin Actions

### 1. View Statistics
**Path:** Admin → Donor Management
- Total Users
- Verified Donors
- Pending Applications (with badge count)
- Approved Applications
- Rejected Applications

### 2. Review Applications
**Tab:** Donor Requests
- View pending applications
- See applicant details (name, email, phone, blood type, age)
- Actions:
  - **Approve**: User becomes verified donor immediately
  - **Reject**: Provide rejection reason

### 3. Manage Users
**Tab:** Manage Users
- View all registered users
- See donor status (Verified Donor / Regular User)
- Filter by blood type, city
- Pagination support

### 4. Manage Verified Donors
**Tab:** Verified Donors
- View all verified donors
- Actions:
  - **Block**: Prevent donor from accessing donor list
  - **Unblock**: Re-enable blocked donor
- Edit donor information if needed

## 🔗 API Endpoints

### User APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/donors/apply` | Submit donor application |
| GET | `/api/donors/application-status` | Check application status |
| GET | `/api/donors/list` | Get verified donors (protected) |

### Admin APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/donors/stats` | Get statistics |
| GET | `/api/admin/donors/requests` | Get pending applications |
| PATCH | `/api/admin/donors/requests/{id}/approve` | Approve application |
| PATCH | `/api/admin/donors/requests/{id}/reject` | Reject application |
| GET | `/api/admin/donors/users` | Get all users |
| GET | `/api/admin/donors/verified` | Get verified donors |
| PATCH | `/api/admin/donors/{id}` | Update donor info |
| PATCH | `/api/admin/donors/{id}/block` | Block/unblock donor |

## 🗄️ Database Models

### User Model (Updated)
```javascript
{
  ...existing fields...
  isDonor: Boolean (default: false),
  donorVerifiedAt: Date (null if not donor)
}
```

### DonorApplication Model (New)
```javascript
{
  userId: ObjectId,
  fullName: String,
  email: String,
  phone: String,
  bloodType: String,
  age: Number,
  dateOfBirth: Date,
  address: String,
  weight: Number,
  city: String,
  state: String,
  zipCode: String,
  gender: String,
  medicalConditions: String,
  status: "pending" | "approved" | "rejected",
  rejectionReason: String,
  reviewedBy: ObjectId,
  reviewedAt: Date,
  appliedAt: Date,
  updatedAt: Date
}
```

## 📁 File Structure

### Backend
```
server/
├── models/
│   ├── User.js (modified)
│   └── DonorApplication.js (new)
├── routes/
│   ├── donors.js (modified)
│   └── adminRoutes.js (modified)
└── index.js (routes already mounted)
```

### Frontend
```
client/src/
├── Components/
│   └── DonorApplication.jsx (new)
├── pages/
│   ├── Profile.jsx (modified)
│   ├── DonorList.jsx (new)
│   └── AdminDonorManagement.jsx (new)
└── routes/
    └── Routes.jsx (modified)
```

## ✅ Verification Checklist

- [ ] Database models created/updated
- [ ] API endpoints implemented and tested
- [ ] Frontend components created
- [ ] Routes added to routing system
- [ ] Access control working (permissions)
- [ ] Error messages display correctly
- [ ] Pagination working
- [ ] Filters working
- [ ] Admin operations (approve/reject/block)
- [ ] Statistics displaying correctly
- [ ] Success/confirmation messages showing

## 🚀 Deployment Steps

1. Migrate database (DonorApplication collection will be created automatically)
2. Deploy backend with new routes
3. Deploy frontend with new components and routes
4. Test user flow (register → apply → admin approval)
5. Test admin operations
6. Verify access control on donor list

## 🔐 Security Notes

- All user endpoints require bearer token
- All admin endpoints require admin bearer token
- User cannot access other users' applications
- Admin-only operations are protected
- Password is never returned in responses
- Input validation on all endpoints

## 📝 Error Messages

### User Errors
```
"Blood type, age, and address are required"
"You already have a pending donor application"
"You are already a verified donor"
"You do not have permission to view the Donor List..."
```

### Admin Errors
```
"Application not found"
"Application is not pending"
"Provide a rejection reason"
```

## 💡 Common Workflows

### User Becoming a Donor (3 Steps)
1. Go to Profile → Donor Application
2. Click "Apply Now" and fill form
3. Wait for admin approval (shown in status)

### Admin Approving Donor (2 Steps)
1. Go to Admin → Donor Management → Donor Requests
2. Click "Approve" on pending application

### User Accessing Donor List (1 Step)
1. Navigate to Donor List (only if verified donor)

## 🎨 UI Elements

### DonorApplication Component
- Status badge (Pending/Approved/Rejected)
- Application form with validation
- Success message modal
- Rejection reason display
- Reapply button

### DonorList Page
- Filter controls (blood type, city)
- Donor cards with info
- Eligibility badge (Can Donate / Waiting Period)
- Pagination controls
- Error message for unauthorized access

### AdminDonorManagement Page
- Statistics dashboard (5 cards)
- 3 tabs: Requests, Users, Verified Donors
- Pending count badge on Requests tab
- Approve/Reject buttons with modal
- Block/Unblock buttons
- Rejection reason form

## 🔄 Data Flow Example

```
User Registration
    ↓
setUser({ isDonor: false, donorVerifiedAt: null })
    ↓
Navigate to Profile → Donor Application
    ↓
Submit DonorApplication (status: "pending")
    ↓
Admin views in Donor Requests
    ↓
Admin clicks Approve
    ↓
User.isDonor = true, User.donorVerifiedAt = now
DonorApplication.status = "approved"
    ↓
User can now access Donor List
```

## 📞 Support & Documentation

For detailed API documentation, see: `DONOR_FEATURE_IMPLEMENTATION.md`

