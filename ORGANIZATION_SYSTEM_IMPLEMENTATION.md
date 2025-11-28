# Organization Registration & Approval System - Implementation Summary

## Overview
Implemented a complete organization registration and approval workflow where organizations must register first, get approved by Super Admin, and then gain access with organization-specific credentials.

## Key Features

### 1. Organization Registration System
- **Public Registration Page**: `/register-organization`
- Organizations register with:
  - Basic info (name, email, phone, address)
  - Unique password (encrypted with bcrypt)
  - Category selection
  - Optional description and website
- Status starts as "pending" upon registration
- Success page shows "waiting for approval" message

### 2. Super Admin Approval System
- **Pending Organizations Dashboard**: Available in Super Admin's UnifiedAdminDashboard
- Super Admin can:
  - View all pending organization registrations
  - Approve organizations (sets status to "approved", isActive to true)
  - Reject organizations with reason
- Approved organizations can then log in

### 3. Organization-Specific Login
- All organization admins use username: `orgadmin`
- Each organization has its own unique password
- Login flow:
  1. Enter username (`orgadmin`) and password
  2. Select organization from dropdown (shows only approved organizations)
  3. System verifies password matches selected organization
  4. JWT token includes `organizationId` for data isolation

### 4. Data Isolation
- All backend routes updated to filter by `organizationId` from JWT token
- Organization admins can only access their own:
  - Orders
  - Inventory
  - Pricing
  - Statistics
- Permission checks on all CRUD operations

## Backend Changes

### Routes Updated (`server/routes/adminRoutes.js`)
1. **POST `/api/admin/organizations/register`** - Public registration endpoint
2. **GET `/api/admin/organizations/list`** - Returns approved organizations for login selection
3. **GET `/api/admin/organizations/pending`** - Super admin only, returns pending registrations
4. **PATCH `/api/admin/organizations/:id/approve`** - Super admin approves organization
5. **PATCH `/api/admin/organizations/:id/reject`** - Super admin rejects organization
6. **GET `/api/admin/dashboard/stats`** - Updated to use `req.organizationId` from token
7. **GET `/api/admin/orders`** - Filters orders by `req.organizationId`
8. **PATCH `/api/admin/orders/:id/status`** - Verifies admin has permission to update order
9. **PATCH `/api/admin/orders/:id/shipping`** - Verifies admin has permission to update shipping
10. **PATCH `/api/admin/inventory/:type/:id`** - Verifies admin has permission to update inventory

### Middleware Updates (`adminAuth`)
- Extracts `organizationId` and `hospitalId` from JWT token
- Adds to `req` object for use in routes: `req.organizationId`, `req.hospitalId`, `req.adminRole`

### Model Updates (`server/models/Organization.js`)
- Added `password` field (String, required, hashed with bcrypt)
- Added `status` enum: "pending", "approved", "rejected" (default: "pending")
- Added `rejectionReason` (String)
- Added `approvedBy` (Admin reference)
- Added `approvedAt` (Date)
- Added `comparePassword()` method for login verification
- Added pre-save hook for password hashing
- Added unique constraints on `name` and `email`
- `isActive` defaults to false until approved

## Frontend Changes

### New Pages
1. **`client/src/pages/RegisterOrganization.jsx`**
   - Registration form with validation
   - Success screen with approval pending message
   - Includes navbar and footer

### New Components
1. **`client/src/Components/PendingOrganizations.jsx`**
   - Displays pending organization cards
   - Approve/Reject buttons for Super Admin
   - Rejection modal with reason input
   - Auto-refreshes after action

### Updated Pages
1. **`client/src/pages/AdminLogin.jsx`**
   - Two-step login for org admins
   - Organization selection dropdown
   - Password verification per organization

2. **`client/src/pages/UnifiedAdminDashboard.jsx`**
   - Added PendingOrganizations component for Super Admin
   - Shows below statistics and quick actions

3. **`client/src/pages/Organizations.jsx`**
   - Added "Register Your Organization" button in header
   - Navigates to registration page

### Routes Updated
- Added `/register-organization` route in `client/src/routes/Routes.jsx`

## Security Features
- Passwords are hashed with bcrypt (minimum 8 characters)
- JWT tokens contain organizationId for secure data filtering
- All routes verify permissions before allowing operations
- Organization-specific data isolation
- Super Admin-only approval endpoints

## Database Collections

### Organizations Collection
```javascript
{
  name: String (unique),
  email: String (unique),
  phone: String,
  address: String,
  password: String (hashed),
  status: "pending" | "approved" | "rejected",
  rejectionReason: String,
  approvedBy: ObjectId (Admin),
  approvedAt: Date,
  category: String,
  description: String,
  website: String,
  isActive: Boolean (false until approved),
  bloodInventory: Object,
  bloodPrices: Object
}
```

## User Flow

### Organization Registration
1. Visit `/organizations` page
2. Click "Register Your Organization" button
3. Fill registration form with password
4. Submit registration
5. See success message: "Waiting for Super Admin approval"

### Super Admin Approval
1. Login as Super Admin
2. View UnifiedAdminDashboard
3. Scroll to "Pending Organizations" section
4. Review organization details
5. Click "Approve" or "Reject" (with reason)
6. Organization status updated in database

### Organization Login
1. Visit `/admin` login page
2. Select "Organization Admin" role
3. Enter username: `orgadmin`
4. Enter organization's unique password
5. Select organization from dropdown (only approved orgs shown)
6. System verifies password matches selected organization
7. Redirected to UnifiedAdminDashboard with organization-specific data

## Testing Checklist
- [ ] Register new organization
- [ ] Verify registration shows "pending" status
- [ ] Login as Super Admin
- [ ] See pending organization in dashboard
- [ ] Approve organization
- [ ] Verify organization can now login with password
- [ ] Test organization selection during login
- [ ] Verify organization only sees their own data
- [ ] Test rejection flow with reason
- [ ] Verify rejected organization cannot login
- [ ] Test permission checks on order operations
- [ ] Test inventory update permissions

## Next Steps (Optional Enhancements)
1. Email notifications for approval/rejection
2. Organization profile editing
3. Password reset functionality
4. Audit log for admin actions
5. Organization dashboard analytics
6. Real-time updates for pending approvals
7. Bulk organization approval
8. Organization verification documents upload

## Notes
- All organization admins share username `orgadmin` but have unique passwords
- Organizations are isolated - can only access their own data
- Super Admin has full access to all organizations
- JWT tokens include organizationId for secure data filtering
- Database enforces unique organization names and emails
