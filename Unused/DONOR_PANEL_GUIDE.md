# Donor Panel Implementation Guide

## What's New

### 1. **Demo Donors Seed Script**
- File: `server/seedDemoDonors.js`
- Creates 6 sample verified donors for testing
- Includes diverse blood types, locations, and medical conditions

### 2. **Donor Panel Page**
- File: `client/src/pages/DonorPanel.jsx`
- Admin-only page to manage all donors (both demo and verified)
- Features:
  - View all verified donors in a table
  - Search by donor name
  - Filter by blood type
  - Filter by city
  - Pagination (10 donors per page)
  - **Edit donor information** (name, email, phone, blood type, weight, gender, city, state, zip code, address, medical conditions)
  - Statistics dashboard (total donors, current page, total pages)

### 3. **Admin Dashboard Update**
- Added "Donor Panel" menu item to the admin dashboard
- Accessible from `/admin/donor-panel`
- Positioned after "Donor Management" in the menu

### 4. **Routes Configuration**
- New route: `/admin/donor-panel` → DonorPanel component
- Integrated into Routes.jsx

---

## How to Use

### Step 1: Seed Demo Donors

Run the seed script to create demo donors:

```bash
cd server
node seedDemoDonors.js
```

**Expected Output:**
```
Connected to MongoDB
Successfully seeded 6 demo donors

Seeded Demo Donors:
- Ahmed Hassan (O+) - Dhaka
- Fatima Begum (A+) - Dhaka
- Mohammad Ali (B+) - Dhaka
- Nadia Islam (AB-) - Dhaka
- Karim Khan (O-) - Dhaka
- Sophia Das (AB+) - Dhaka

Database connection closed
```

### Step 2: Access Donor Panel

1. Login as Admin
2. Click on "Donor Panel" in the admin dashboard
3. View all donors (demo + verified)

### Step 3: Manage Donors

**View Donors:**
- All donors display in a table with name, email, blood type, age, city, phone
- Use pagination to navigate through pages

**Search Donors:**
- Enter donor name in search box
- Click "Search" button

**Filter Donors:**
- Select blood type from dropdown
- Select city from dropdown
- Filters apply automatically on selection

**Edit Donor Information:**
1. Click "Edit" button on any donor row
2. Modal opens with all editable fields
3. Modify information as needed
4. Click "Save Changes" to update
5. Click "Cancel" to discard changes

### Editable Fields:
- Full Name
- Email
- Phone
- Blood Type
- Weight (kg)
- Gender
- City
- State
- Zip Code
- Address
- Medical Conditions

---

## Workflow

### For Clearing Previous Applications

If you want to clear existing applications before creating new ones:

```bash
cd server
# Option 1: Using MongoDB shell
mongo
use bloodbridge
db.donorapplications.deleteMany({})
exit

# Option 2: Using a simple delete script (optional to create)
```

### For Creating New Application

1. User registers as Normal User (default role)
2. User navigates to Profile → Donor Application tab
3. User submits donor application
4. Application appears in Admin → Donor Management → Donor Requests tab
5. Admin reviews and approves
6. Once approved, user becomes Verified Donor
7. User now appears in:
   - Admin → Donor Management → Verified Donors tab
   - Admin → Donor Panel (with edit capabilities)
   - User can access Donor List page (verified donors only)

---

## Database Structure

### Demo Donors (Pre-filled)
```javascript
{
  fullName: "Ahmed Hassan",
  email: "ahmed.hassan@demo.com",
  phone: "01700000001",
  password: "demo123456",
  bloodType: "O+",
  dateOfBirth: Date,
  weight: 75,
  city: "Dhaka",
  state: "Dhaka",
  zipCode: "1200",
  address: "Gulshan, Dhaka",
  gender: "male",
  medicalConditions: "None",
  isDonor: true,
  donorVerifiedAt: Date
}
```

---

## Admin Features

### Donor Management (Approval Workflow)
- Location: Admin Dashboard → Donor Management
- Features:
  - View pending applications (Donor Requests tab)
  - Approve applications
  - Reject applications with reasons
  - View all users
  - View verified donors with block/unblock option

### Donor Panel (All Donors Management)
- Location: Admin Dashboard → Donor Panel
- Features:
  - View ALL donors (demo + approved)
  - Search by name
  - Filter by blood type and city
  - Edit donor information
  - Pagination
  - Statistics

---

## API Endpoints Used

### Donor Panel Operations
```
GET /api/admin/donors/verified
  - Returns all verified donors
  - Query params: page, limit, bloodType, city, search

PATCH /api/admin/donors/:id
  - Updates donor information
  - Body: { fullName, email, phone, bloodType, weight, gender, city, state, zipCode, address, medicalConditions }
```

---

## File Structure

```
client/src/
├── pages/
│   ├── DonorPanel.jsx (NEW - Admin donor management page)
│   ├── AdminDonorManagement.jsx (Approval workflow)
│   └── ...
└── routes/
    └── Routes.jsx (UPDATED - Added DonorPanel route)

server/
├── seedDemoDonors.js (NEW - Demo data seeder)
└── ...
```

---

## Key Points

✅ **Separation of Concerns:**
- Donor Management: Handles application approval workflow
- Donor Panel: Handles all donor information management

✅ **Demo Data:**
- 6 pre-filled demo donors with realistic data
- Can be edited like any other donor

✅ **Edit Functionality:**
- All donor fields editable
- Form validation included
- Real-time updates to database

✅ **User Experience:**
- Clean table interface
- Search and filter capabilities
- Responsive design
- Easy pagination

✅ **Security:**
- Admin-only access
- Proper authentication required
- Role-based access control

---

## Next Steps

1. Run the seed script to create demo donors
2. Login as admin
3. Navigate to Donor Panel
4. Test search, filter, and edit functionality
5. Create a new user donor application through the normal flow
6. Approve the application
7. Verify the new donor appears in Donor Panel
8. Test editing all donor information

---

## Troubleshooting

**Issue:** Demo donors not appearing
- Solution: Run `node seedDemoDonors.js` from server directory

**Issue:** Edit button not working
- Solution: Ensure you're logged in as admin and have valid token

**Issue:** Changes not saving
- Solution: Check browser console for errors, verify API endpoint is accessible

**Issue:** Pagination not working
- Solution: Clear browser cache, refresh page

---

## Summary

You now have:
1. ✅ **Demo Donors** - 6 sample donors pre-loaded in the database
2. ✅ **Donor Panel** - Dedicated admin page to view and edit ALL donors
3. ✅ **Search & Filter** - Find donors by name, blood type, or city
4. ✅ **Edit Functionality** - Update any donor's information
5. ✅ **Integrated Workflow** - Seamless integration with existing donor application system

All approved users and demo donors appear in the Donor Panel and can be edited!
