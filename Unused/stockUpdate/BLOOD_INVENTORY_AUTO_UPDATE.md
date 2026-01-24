# Blood Inventory Auto-Update System

## 📋 Overview

This document summarizes the complete blood inventory auto-update system implemented in BloodBridge Foundation. The system automatically reduces blood stock when a purchase is completed and provides real-time updates across all user interfaces.

---

## 🔄 Complete Stock Update Flow

### 1. **User Places Purchase Order**
   - User fills in blood purchase form on "Buy Blood" page
   - **File:** `client/src/pages/BuyBlood.jsx` (Lines 787-830)
   - **Constraints Applied:**
     - Maximum 5 units per purchase (Line 807-809)
     - Payment method restricted to: Cash on Delivery, bKash, Nagad (Line 765-774)
     - Transaction ID mandatory for bKash/Nagad payments (Line 882-887)
   - Form validates all required fields
   - Purchase request submitted to backend

   **Endpoint:** `POST /blood-purchases`
   
   **Data Sent:**
   ```javascript
   {
     sourceType: "organization" | "hospital",
     sourceName: string,
     sourceId: string (MongoDB ID),
     bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
     units: number (1-5),
     pricing: { ... },
     patientName: string,
     contactPhone: string,
     paymentMethod: "cod" | "bkash" | "nagad",
     transactionId: string (only for bKash/Nagad),
     status: "pending" (default),
     // ... other fields
   }
   ```

### 2. **Backend Receives Purchase Request**
   - Backend route: `server/routes/bloodPurchases.js` (POST /)
   - **Extraction of fields:** Lines 20-40
   - **Validation:** Lines 43-99
   - **TransactionId extraction:** Line 38
   - Creates BloodPurchase document with **status: "pending"**
   - BloodPurchase creation: Lines 109-142
   - **Initial Inventory:** NOT reduced yet (only reduces on "completed" status)

   **Database Entry:**
   ```javascript
   // File: server/models/BloodPurchase.js (Lines 1-219)
   {
     _id: ObjectId,
     trackingNumber: "BL[timestamp]-[random]",
     purchasedBy: userId,
     sourceType: "organization" | "hospital",
     bloodType: "A+",
     units: 1,
     paymentMethod: "bkash",
     transactionId: "12345678", // Stored in DB (Line 169-171)
     status: "pending",
     inventoryReduced: false, // Flag for inventory tracking (Line 201-204)
     inventoryReducedAt: null,
     statusHistory: [{status: "pending", date: now, note: "..."}],
     createdAt: timestamp,
     // ... other fields
   }
   ```

### 3. **Admin Reviews Purchase in Admin Panel**
   - **File:** `client/src/pages/AdminPurchases.jsx` (Lines 1-406)
   - Route: `/admin/purchases` (Line 56-85)
   - Fetches purchases: Lines 56-85
   - Displays purchases: Lines 260-320
   - Transaction ID display: Lines 310-318
   - Auto-refreshes every 30 seconds: Lines 30-37

### 4. **Admin Changes Status to "Completed"**
   - **File:** `client/src/pages/AdminPurchases.jsx` (Lines 350-365)
   - Admin clicks "Update Status" button: Line 322
   - Modal opens: Lines 344-365
   - Admin selects status from dropdown: Lines 353-360
   - Available status options:
     - Pending
     - Verified
     - Confirmed
     - Ready
     - **Completed** ← Triggers inventory reduction
     - Cancelled

   **Endpoint:** `PATCH /admin/purchases/:id/status`

### 5. **Inventory Reduction Logic (Backend)**
   - **Trigger:** When status is changed to "completed" AND previous status was NOT "completed"
   - **File:** `server/routes/adminRoutes.js` (Lines 1264-1370)
   - Main inventory reduction function: Lines 1300-1385
   
   **Reduction Process:**
   ```javascript
   // File: server/routes/adminRoutes.js (Lines 1300-1340)
   if (status === "completed" && previousStatus !== "completed") {
     // Call reduceInventory function
     const { sourceType, sourceId, bloodType, units } = purchase;
     
     if (sourceType === "organization") {
       // Line 1318-1325
       await Organization.findByIdAndUpdate(
         sourceId,
         {
           $inc: { [`bloodInventory.${bloodType}`]: -units }
         },
         { new: true }
       );
     } 
     else if (sourceType === "hospital") {
       // Line 1326-1333
       await Hospital.findByIdAndUpdate(
         sourceId,
         {
           $inc: { [`bloodInventory.${bloodType}`]: -units }
         },
         { new: true }
       );
     }
     
     // Mark as reduced (Lines 1334-1335)
     purchase.inventoryReduced = true;
     purchase.inventoryReducedAt = new Date();
   }
   ```

   **Database Update:**
   ```javascript
   // Before:
   Organization {
     bloodInventory: { "A+": 10, "B+": 5, ... }
   }
   
   // After (when 1 unit of A+ purchased):
   Organization {
     bloodInventory: { "A+": 9, "B+": 5, ... }  // ← Reduced by 1
   }
   ```

### 6. **Real-Time Frontend Updates**

#### A. **Buy Blood Page (User-Facing)**
   - **File:** `client/src/pages/BuyBlood.jsx` (Lines 1-1330)
   - **Auto-Refresh Interval:** Every 10 seconds (Lines 47-75)
   - **Data fetch function:** Lines 47-70
   - **Auto-refresh hook setup:** Lines 72-75
   - **Search results auto-update:** Lines 221-258
   - **What Updates:**
     - Organization/Hospital inventory data
     - Search results with available units
     - Blood type availability
   
   ```javascript
   // File: client/src/pages/BuyBlood.jsx (Lines 47-75)
   useEffect(() => {
     const fetchData = async () => {
       // Lines 49-64
       const [orgsResponse, hospsResponse] = await Promise.all([
         axios.get("/public/organizations"),
         axios.get("/public/hospitals")
       ]);
       setDbOrganizations(orgsResponse.data);
       setDbHospitals(hospsResponse.data);
     };
     
     fetchData();
     // Lines 72-75: Auto-refresh every 10 seconds
     const refreshInterval = setInterval(() => {
       fetchData();
     }, 10000);
     return () => clearInterval(refreshInterval);
   }, []);
   
   // File: client/src/pages/BuyBlood.jsx (Lines 221-258)
   // Auto-refresh search results when data updates
   useEffect(() => {
     if (showSearchResults && searchBloodType) {
       // Re-calculate available sources based on updated inventory
       const availableSources = sources.filter(source =>
         source.bloodInventory[searchBloodType] > 0
       );
       setSearchResults(availableSources.sort((a,b) => a.totalPrice - b.totalPrice));
     }
   }, [sources, searchBloodType, showSearchResults]);
   ```

   **User Experience:**
   - Views search results showing available blood types
   - After admin completes purchase → stock reduces within 10 seconds
   - User sees updated availability in real-time
   - Sources with depleted stock disappear from results

#### B. **Admin Inventory Page**
   - **File:** `client/src/pages/AdminInventory.jsx` (Lines 1-315)
   - **Auto-Refresh Interval:** Every 10 seconds (Lines 18-37)
   - **Load inventory function:** Lines 39-92
   - **Auto-refresh setup:** Lines 32-37
   
   ```javascript
   useEffect(() => {
     loadInventory();
     const refreshInterval = setInterval(loadInventory, 10000); // Every 10 seconds
     return () => clearInterval(refreshInterval);
   }, [navigate, filter]);
   ```
   
   ```javascript
   useEffect(() => {
     loadInventory();
     const refreshInterval = setInterval(loadInventory, 10000); // Every 10 seconds
     return () => clearInterval(refreshInterval);
   }, [navigate, filter]);
   ```

#### C. **Admin Purchases Page (Purchase List)**
   - **File:** `client/src/pages/AdminPurchases.jsx` (Lines 1-406)
   - **Auto-Refresh Interval:** Every 30 seconds (Lines 30-37)
   - **Fetch purchases:** Lines 56-85

### 7. **Rollback Logic (Status Changed From Completed)**
   - **File:** `server/routes/adminRoutes.js` (Lines 1341-1363)
   - **Scenario:** Admin changes purchase status from "completed" back to another status
   - **Action:** Inventory is automatically restored (units added back)
   
   ```javascript
   // File: server/routes/adminRoutes.js (Lines 1341-1363)
   if (previousStatus === "completed" && status !== "completed") {
     // Lines 1346-1363: Restore inventory
     const { sourceType, sourceId, bloodType, units } = purchase;
     
     if (sourceType === "organization") {
       await Organization.findByIdAndUpdate(
         sourceId,
         { $inc: { [`bloodInventory.${bloodType}`]: units } }
       );
     }
     purchase.inventoryReduced = false;
   }
   ```

---

## 🗄️ Database Schema Changes

### BloodPurchase Model
**File:** `server/models/BloodPurchase.js` (Lines 1-219)

**New/Updated Fields:**
```javascript
// File: server/models/BloodPurchase.js (Lines 143-171)
{
  // Status enum updated to include "completed" (Lines 143-149)
  status: {
    enum: ["pending", "verified", "confirmed", "ready", "completed", "cancelled"]
  },
  
  // Inventory tracking fields (Lines 201-207)
  inventoryReduced: {
    type: Boolean,
    default: false
  },
  
  inventoryReducedAt: {
    type: Date
  },
  
  // Payment fields (Lines 162-167)
  paymentMethod: {
    enum: ["cash", "cod", "bkash", "nagad"] // Limited to 3 options
  },
  
  // NEW: Transaction ID for digital payments (Lines 169-171)
  transactionId: {
    type: String
  }
}
```

---

## 🎨 Frontend UI Changes

### 1. File:** `client/src/pages/BuyBlood.jsx` (Lines 1-1330)
   - **Payment Method:** Limited to 3 options (Lines 765-774)
     - Cash on Delivery
     - bKash
     - Nagad
   - **Units Input:** Maximum 5 units with visual constraint (Lines 807-830)
   - **Transaction ID Field:** (Lines 826-841)
     - Appears only when bKash/Nagad selected
     - Required for form submission
     - Helper text: "You must provide a transaction ID to proceed"
   - **Success Modal:** Shows customer service message (Lines 1200-1220)
     - "Our Customer Service Will Contact You Very Soon"
     - "Our dedicated team will reach out within 24 hours"

### 2. **Admin Purchases Panel**
   - **File:** `client/src/pages/AdminPurchases.jsx` (Lines 1-406)
   - **Payment Method Display:** (Lines 302-306)
     - Shows selected payment method (cod/bkash/nagad)
   - **Transaction ID Display:** (Lines 307-318)
     - Yellow highlighted box: `bg-yellow-100 border-2 border-yellow-400`
     - Large bold text showing transaction ID
     - Payment method label: "(BKASH)" or "(NAGAD)"
     - Only visible when transaction ID exists AND payment is bKash/Nagad
   - **Status Dropdown:** 6 options including "completed" (Lines 353-360)
   - **Admin Notes:** Optional notes field (Lines 363-369)

### 3. **Admin Inventory Page**
   - **File:** `client/src/pages/AdminInventory.jsx` (Lines 1-315)
   - Real-time inventory display (Lines 189-250)
   - Auto-refreshes every 10 seconds (Lines 32-37)
   - Auto-refreshes every 10 seconds
   - Shows total stock and low stock warnings

---

## 🔐 Validation & Constraints

### Purchase Constraints:
1. **Maximum Units:** 5 units per purchase
   - **File:** `client/src/pages/BuyBlood.jsx`
   - Frontend validation in input field (Line 809): `max="5"`
   - Frontend validation in form submission (Lines 348-352)
   - Backend validation: `server/routes/bloodPurchases.js` (Lines 82-94)
   - Error message: "Maximum 5 units allowed per purchase"

2. **Payment Methods:** Only 3 options
   - **File:** `client/src/pages/BuyBlood.jsx` (Lines 765-774)
   - Cash on Delivery (cod)
   - bKash (bkash)
   - Nagad (nagad)
   - Removed: SSL, Rocket, Bank Transfer

3. **Transaction ID Requirements:**
   - **File:** `client/src/pages/BuyBlood.jsx` (Lines 354-357, 826-841)
   - **For bKash/Nagad:** Mandatory field (Lines 354-357)
   - **For Cash on Delivery:** Optional
   - Frontend validation: Cannot submit form without transaction ID for digital payments
   - Backend stores transaction ID: `server/routes/bloodPurchases.js` (Line 38, 131)

4. **Required Fields:**
   - Patient name, contact name, contact phone
   - Required date, blood type, units
   - Delivery address (optional)

---

## 📊 Stock Update Timeline

```
Time    Event                               Inventory Status
----    -----                               -----------------
T+0     User submits purchase               No change (pending)
         Status: pending

T+1     Admin sees purchase in panel        No change (pending)
         Payment method & Transaction ID visible

T+5     Admin clicks "Update Status"        No change yet
         Modal opens

T+6     Admin selects "Completed"           ✅ INVENTORY REDUCED
         Status changes to: completed        Stock decreases by units
         inventoryReduced: true              

T+10    User refreshes page                 ✅ User sees updated stock
         Real-time update interval           Available units decreased

T+15    Admin refreshes inventory page      ✅ Admin sees updated total
         Real-time update interval           Total stock reduced
```

---

## 🔄 API Endpoints

### Creating Purchase:
```
POST /blood-purchases
Headers: Authorization: Bearer {token}
Body: {
  sourceType, sourceName, sourceId,
  bloodType, units, pricing,
  patientName, contactPhone,
  paymentMethod, transactionId,
  urgency, requiredDate
}
Response: { purchase, tracking number }

File: server/routes/bloodPurchases.js (Lines 17-150)
```

### Updating Purchase Status (Triggers Inventory Reduction):
```
PATCH /admin/purchases/:id/status
Headers: Authorization: Bearer {adminToken}
Body: {
  status: "completed",  // ← Triggers reduction
  adminNotes: "...",
  pickupDetails: { ... }
}
Response: { purchase (with inventoryReduced=true) }

File: server/routes/adminRoutes.js (Lines 1264-1370)
- Status validation: Lines 1286-1299
- Inventory reduction logic: Lines 1300-1340
- Rollback logic: Lines 1341-1363
```

### Fetching Admin Purchases:
```
GET /admin/purchases?status=all&sourceType=all&bloodType=all
Headers: Authorization: Bearer {adminToken}
Response: { purchases[], pagination }

File: server/routes/adminRoutes.js (Lines 1180-1250)
```

---

## 🛠️ Key Implementation Files

| File | Purpose | Key Logic |
|------|---------|-----------|
| `server/models/BloodPurchase.js` | Database schema | Added transactionId, inventoryReduced fields |
| `server/routes/bloodPurchases.js` | Purchase creation | Extracts transactionId, creates document |
| `server/routes/adminRoutes.js` | Status update & inventory reduction | Main inventory reduction logic |
| `client/src/pages/BuyBlood.jsx` | User purchase form | Payment method restriction, 5 unit limit, transaction ID validation, auto-refresh |
| `client/src/pages/AdminPurchases.jsx` | Admin purchase management | Displays transaction ID with highlighting, status update |
| `client/src/pages/AdminInventory.jsx` | Inventory overview | Real-time auto-refresh every 10 seconds |

---

## ✅ Feature Checklist

- [x] Blood inventory auto-reduces when purchase marked "completed"
- [x] Real-time updates on Buy Blood page (every 10 seconds)
- [x] Real-time updates on Admin panels (every 10-30 seconds)
- [x] Manual inventory management by admin
- [x] Transaction ID storage and display
- [x] Payment method limited to 3 options
- [x] Maximum 5 units per purchase
- [x] Transaction ID mandatory for digital payments
- [x] Admin panel displays transaction ID with highlighting
- [x] Inventory rollback if purchase reverted from "completed"
- [x] Color-coded inventory display
- [x] Low stock warnings

---

## 🚀 Testing Workflow

1. **Create Purchase:**
   - Go to "Buy Blood" page
   - Select organization/hospital
   - Select blood type
   - Enter 1-5 units
   - Select payment method (bKash/Nagad)
   - Enter transaction ID
   - Submit purchase

2. **Verify in Admin Panel:**
   - Go to Admin → Manage Purchases
   - Find the purchase (should be "pending")
   - Verify transaction ID is shown in yellow box
   - Click "Update Status"
   - Change to "Completed"

3. **Check Inventory Updates:**
   - Go to Admin → Manage Inventory
   - Stock should have decreased by the purchased units
   - Or refresh Buy Blood page - updated stock visible within 10 seconds

4. **Verify Real-Time Updates:**
   - Keep Buy Blood page open
   - Complete a purchase from admin panel
   - Within 10 seconds, stock updates on user page
   - Search results automatically refresh

---

## 📝 Notes

- **Inventory Reduction:** One-time operation when status changes to "completed"
- **Prevention of Double Reduction:** `inventoryReduced` flag prevents duplicate reductions
- **Rollback Support:** If admin reverts status from "completed", inventory is restored
- **Real-Time Sync:** Frontend refreshes every 10-30 seconds to show latest inventory
- **Transaction ID:** Required for digital payments, optional for Cash on Delivery
- **Status Enum:** Updated to match admin panel workflow (pending → verified → confirmed → ready → completed)

---

## 📞 Support

For questions about the inventory system, refer to the implementation files or contact the development team.

**Last Updated:** January 22, 2026
