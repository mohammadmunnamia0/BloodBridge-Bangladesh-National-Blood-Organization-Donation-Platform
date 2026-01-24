# Blood Bank Stock Update Flow - Complete Guide

## Overview
This document explains how blood inventory stock automatically updates when an admin completes a blood purchase order in the BloodBridge system.

---

## Flow Diagram

```
1. User purchases blood
   ↓
2. Purchase saved to database with sourceType & sourceId
   ↓
3. Admin marks purchase as "COMPLETED"
   ↓
4. Backend inventory reduction triggered
   ↓
5. Database Hospital/Organization stock updated
   ↓
6. Frontend auto-refreshes and displays new stock
```

---

## Step-by-Step Process

### Step 1: User Makes a Purchase (Frontend)

**File:** `client/src/pages/BuyBlood.jsx` (Lines 360-380)

**Function:** Inside the `handleSubmit` event handler

**What happens:**
- User selects a hospital or organization from the list
- User selects blood type and quantity
- User clicks "Purchase Now"
- The app prepares purchase data with:
  - `sourceType`: "hospital" or "organization" ✅ (Fixed on Line 368)
  - `sourceId`: The database ID from the selected source
  - `sourceName`: The name of the hospital/organization
  - `bloodType`: Selected blood type
  - `units`: Quantity purchased

**Code snippet (Lines 368-377):**
```javascript
const purchaseData = {
  sourceType: selectedSource.sourceType || "organization",  // Gets from database
  sourceName: selectedSource.name,
  sourceId: selectedSource._id || selectedSource.id,  // Database ID
  bloodType: selectedBloodType,
  units: Number(units),
  // ... other fields
};
```

**Auto-refresh setting (Lines 62-68):**
- BuyBlood page auto-refreshes **every 30 seconds** to show updated inventory

---

### Step 2: Purchase Saved to Database

**File:** `server/routes/bloodPurchases.js` (Lines 15-150)

**Endpoint:** `POST /blood-purchases`

**Function:** Creates a new BloodPurchase document with:
- `sourceType`: "hospital" or "organization"
- `sourceId`: Database ID (MongoDB ObjectId)
- `sourceName`: Name from purchase data
- `bloodType`: Blood type purchased
- `units`: Number of units
- `status`: "pending" (initial status)

---

### Step 3: Admin Completes Purchase

**File:** `server/routes/adminRoutes.js` (Lines 1265-1420)

**Endpoint:** `PATCH /admin/purchases/:id/status`

**Process:**

1. **Check if status is changing to "completed"** (Line 1388)
```javascript
if (status === "completed" && previousStatus !== "completed") {
```

2. **Log the purchase details** (Lines 1389-1395)
```javascript
console.log(`\n📋 REDUCING INVENTORY FOR PURCHASE ${id}`);
console.log(`Source Type: ${purchase.sourceType}`);
console.log(`Source ID: ${purchase.sourceId}`);
console.log(`Source Name: ${purchase.sourceName}`);
```

3. **Call `reduceInventory()` function** (Line 1399)

---

### Step 4: Backend Reduces Inventory - Core Logic

**File:** `server/routes/adminRoutes.js` (Lines 1312-1380)

**Function Name:** `reduceInventory(purchase)`

**What it does:**

1. **Extracts purchase details** (Line 1314)
```javascript
const { sourceType, sourceId, sourceName, bloodType, units } = purchase;
```

2. **For Hospital type** (Lines 1351-1373):

   a. **First attempt:** Try to find hospital by ID (Lines 1355-1362)
   ```javascript
   if (mongoose.Types.ObjectId.isValid(sourceId)) {
     result = await Hospital.findByIdAndUpdate(
       sourceId,
       { $inc: { [`bloodInventory.${bloodType}`]: -units } },
       { new: true }
     );
   }
   ```

   b. **Fallback:** If ID fails, find by name (Lines 1365-1372)
   ```javascript
   if (!result && sourceName) {
     result = await Hospital.findOneAndUpdate(
       { name: sourceName },
       { $inc: { [`bloodInventory.${bloodType}`]: -units } },
       { new: true }
     );
   }
   ```

3. **For Organization type** (Lines 1326-1349): Same logic as hospital

4. **Success/Failure logging** (Lines 1374-1379)
```javascript
if (result) {
  console.log(`✅ Hospital inventory reduced: ${bloodType} by ${units} units`);
} else {
  console.warn(`⚠️  Hospital "${sourceName || sourceId}" not found in database`);
}
```

---

### Step 5: Database Updated

**Collections affected:**
- `hospitals` collection (if sourceType is "hospital")
- `organizations` collection (if sourceType is "organization")

**Update operation:**
```javascript
// MongoDB Increment operation
{ $inc: { "bloodInventory.O+": -5 } }
// This reduces O+ stock by 5 units atomically
```

**Example:**
- Before: `O+: 40`
- Purchase: 5 units
- After: `O+: 35` ✅

---

### Step 6: Frontend Auto-Refresh Shows Updated Stock

**Admin Inventory Page:** `client/src/pages/AdminInventory.jsx`

**Auto-refresh interval:** **Every 10 seconds** (Line 26-28)

**What it does:**
1. Fetches all organizations from `/admin/organizations`
2. Fetches all hospitals from `/admin/hospitals`
3. Merges both lists
4. Displays current inventory with updated stocks

---

**Buy Blood Page:** `client/src/pages/BuyBlood.jsx`

**Auto-refresh interval:** **Every 30 seconds** (Line 62-68)

**What it does:**
1. Fetches organizations from `/public/organizations`
2. Fetches hospitals from `/public/hospitals`
3. Updates displayed inventory
4. User sees new available units

---

## Files Summary Table

| File | Location | Purpose | Key Function |
|------|----------|---------|--------------|
| BuyBlood.jsx | `client/src/pages/BuyBlood.jsx` | User purchases blood | Lines 360-380: Prepares purchase data with correct sourceType |
| bloodPurchases.js | `server/routes/bloodPurchases.js` | Saves purchase to DB | Lines 15-150: POST /blood-purchases endpoint |
| adminRoutes.js (Main) | `server/routes/adminRoutes.js` | Update purchase status | Lines 1265-1420: PATCH /admin/purchases/:id/status |
| adminRoutes.js (Inventory) | `server/routes/adminRoutes.js` | Reduce stock | Lines 1312-1380: reduceInventory() function |
| AdminInventory.jsx | `client/src/pages/AdminInventory.jsx` | Show admin inventory | Lines 26-28: Auto-refresh every 10 seconds |
| AdminOrganizations.jsx | `client/src/pages/AdminOrganizations.jsx` | Show org inventory | Fetches from /admin/organizations |
| AdminHospitals.jsx | `client/src/pages/AdminHospitals.jsx` | Show hospital inventory | Fetches from /admin/hospitals |

---

## Critical Functions by Location

### 1. Purchase Data Preparation
- **File:** `client/src/pages/BuyBlood.jsx`
- **Lines:** 360-380
- **Purpose:** Set correct sourceType and sourceId

### 2. Inventory Reduction
- **File:** `server/routes/adminRoutes.js`
- **Lines:** 1312-1380
- **Function:** `reduceInventory(purchase)`
- **Does:** Finds hospital/org by ID or name, reduces stock

### 3. Trigger Inventory Reduction
- **File:** `server/routes/adminRoutes.js`
- **Lines:** 1388-1407
- **Condition:** When status changes to "completed"

### 4. Auto-Refresh Setup
- **Admin Inventory:** `client/src/pages/AdminInventory.jsx` Lines 26-28 (10 sec)
- **Buy Blood:** `client/src/pages/BuyBlood.jsx` Lines 62-68 (30 sec)

---

## Important Notes

### ✅ What's Working Now:
1. **Database has all sources** - 13 organizations + 14 hospitals
2. **sourceType detection fixed** - Uses `selectedSource.sourceType` (not `.type`)
3. **Inventory reduction logic** - Tries by ID first, then by name as fallback
4. **Auto-refresh enabled** - Both frontend pages refresh to show updates
5. **Atomic operations** - MongoDB $inc ensures no race conditions

### ⚠️ Important Requirements:
1. **Must use database ID** - Only works with MongoDB ObjectIds
2. **Name must match exactly** - For fallback lookup
3. **Status must be "completed"** - Only then inventory reduces
4. **Both pages must load from database** - Not from static JS files

---

## How to Test

1. Go to **Buy Blood** page
2. Select any **hospital** or **organization**
3. Purchase blood (e.g., 5 units of O+)
4. Go to **Admin Panel → Manage Purchases**
5. Find your purchase, click **"Update Status"**
6. Change to **"COMPLETED"**
7. Check server logs - should see:
   ```
   📋 REDUCING INVENTORY FOR PURCHASE [id]
   Source Type: hospital
   🔍 Reducing inventory: ...
   ✅ Hospital inventory reduced: O+ by 5 units
   ```
8. Wait **10 seconds** (Admin Inventory auto-refresh)
9. See stock **decreased by 5** ✅

---

## Database Collections Used

- **bloodpurchases** - Stores all purchase records
- **hospitals** - Contains hospital data with `bloodInventory` field
- **organizations** - Contains organization data with `bloodInventory` field

---

## Summary

The stock update is **fully automatic**:
1. User purchases → Purchase saved with correct sourceId/sourceType
2. Admin marks as "completed" → Inventory reduction triggered
3. Backend reduces stock in MongoDB
4. Frontend auto-refreshes → Shows new stock

**No manual intervention needed!** ✅
