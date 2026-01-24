# BloodBridge Foundation - Practicum Analysis Report
## System Design and Architecture Documentation

---

## Table of Contents
1. [Actors & Stakeholders](#actors--stakeholders)
2. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
3. [Use Case Diagram](#use-case-diagram)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Activity Diagrams](#activity-diagrams)
6. [Swimlane Diagram](#swimlane-diagram)
7. [Class Diagram](#class-diagram)
8. [Data Flow Diagram (DFD)](#data-flow-diagram-dfd)
9. [CRC (Class Responsibility Collaborator)](#crc-class-responsibility-collaborator)

---

## Actors & Stakeholders

### Primary Actors
1. **Donor** - Registered blood donor who can request blood and donate
2. **Patient/Requester** - Person requesting blood units
3. **Hospital/Organization** - Medical facility managing blood inventory and sales
4. **Buyer/Customer** - Person/entity purchasing blood units
5. **Administrator (Super Admin)** - Platform-level system manager
6. **Administrator (Org/Hospital Admin)** - Organization-specific manager

### Secondary Actors
- **Payment Gateway (SSLCommerz)** - External payment processor
- **Database System** - MongoDB storage
- **Email System** - Notification service
- **Authentication System** - User authentication provider

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────┤

                              [USER]
                    ┌─────────────────────┐
                    │  • userId (PK)      │
                    │  • fullName         │
                    │  • email (UNIQUE)   │
                    │  • phone            │
                    │  • password         │
                    │  • dateOfBirth      │
                    │  • gender           │
                    │  • address          │
                    │  • city             │
                    │  • state            │
                    │  • zipCode          │
                    │  • bloodType        │
                    │  • rhFactor         │
                    │  • role             │
                    │  • createdAt        │
                    │  • updatedAt        │
                    └─────────────────────┘
                            │  │
                ┌───────────┘  └──────────────┐
                │                              │
        1:N     │                              │     1:N
         ┌──────┴──────┐            ┌─────────┴──────┐
         │             │            │                │
   [BLOOD REQUEST]  [BLOOD PURCHASE]           [PROFILE_DATA]
   ┌─────────────┐  ┌──────────────┐     (Optional extension)
   │ • requestId │  │• purchaseId  │
   │ • patientName│ │• purchasedBy→│
   │ • bloodType │  │• sourceType  │
   │ • units     │  │• sourceName  │
   │ • hospital  │  │• bloodType   │
   │ • reason    │  │• units       │
   │ • urgency   │  │• expiryDate  │
   │ • status    │  │• price       │
   │ • requestedBy→ │• totalAmount │
   │ • createdAt │  │• paymentStatus
   └─────────────┘  │• trackingNo  │
                    │• receipt     │
                    │• createdAt   │
                    └──────────────┘

                         [HOSPITAL]
                    ┌─────────────────────┐
                    │ • hospitalId (PK)   │
                    │ • name (UNIQUE)     │
                    │ • emergencyHotline  │
                    │ • ambulance         │
                    │ • phone             │
                    │ • email (UNIQUE)    │
                    │ • address           │
                    │ • website           │
                    │ • status            │
                    │ • bloodInventory[]  │
                    │ • pricing[]         │
                    │ • createdAt         │
                    └─────────────────────┘
                            │
                    1:N     │
                            │
                    ┌───────┴─────────┐
                    │ [BLOOD INVENTORY]
                    │ ┌─────────────┐
                    │ │ • bloodType │
                    │ │ • units     │
                    │ │ • expiryDate│
                    │ │ • price     │
                    │ │ • status    │
                    │ └─────────────┘
                    └───────────────────┘

                      [ORGANIZATION]
                    ┌─────────────────────┐
                    │ • orgId (PK)        │
                    │ • name (UNIQUE)     │
                    │ • status            │
                    │ • category          │
                    │ • description       │
                    │ • contact           │
                    │ • phone             │
                    │ • email (UNIQUE)    │
                    │ • website           │
                    │ • address           │
                    │ • bloodInventory[]  │
                    │ • pricing[]         │
                    │ • createdAt         │
                    └─────────────────────┘

                         [ADMIN]
                    ┌─────────────────────┐
                    │ • adminId (PK)      │
                    │ • username (UNIQUE) │
                    │ • password          │
                    │ • name              │
                    │ • email (UNIQUE)    │
                    │ • role              │
                    │ • permissions       │
                    │ • organizationId    │→ ORGANIZATION
                    │ • createdAt         │
                    └─────────────────────┘

Relationships:
- USER 1:N BLOOD_REQUEST
- USER 1:N BLOOD_PURCHASE
- HOSPITAL 1:N BLOOD_INVENTORY
- ORGANIZATION 1:N BLOOD_INVENTORY
- ADMIN N:1 ORGANIZATION
```

---

## Use Case Diagram

```
                                    ┌────────────────────────┐
                                    │   BLOODBRIDGE SYSTEM   │
                                    └────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
            ┌───────┴──────────┐   ┌────────┴────────┐   ┌────────┴────────┐
            │                  │   │                 │   │                 │
       [DONOR]            [PATIENT/REQUESTER]   [BUYER]          [ADMIN]
            │                  │   │                 │   │                 │
            │                  │   │                 │   │                 │
            │   ┌──────────────┼───┼────────────┐    │   │                 │
            │   │              │   │            │    │   │                 │
            │   │              ▼   ▼            ▼    ▼   ▼                 ▼
            │   │         ┌──────────────────────────────────┐       ┌──────────────┐
            │   │         │   Public System Features         │       │ Admin Panel  │
            │   │         ├──────────────────────────────────┤       ├──────────────┤
            │   │         │  • View Home Page                │       │ • Dashboard  │
            │   │         │  • Search Hospitals              │       │ • Analytics  │
            │   │         │  • Browse Organizations          │       │ • Inventory  │
            │   │         │  • View Blood Requests           │       │ • Pricing    │
            │   │         │  • View Price Comparison         │       │ • Users Mgmt │
            │   │         └──────────────────────────────────┘       │ • Request Mgmt
            │   │                                                    │ • Purchase Mgmt
            │   │         ┌──────────────────────────┐             │ • Donor Mgmt │
            │   │         │   User Authentication    │             └──────────────┘
            │   │         ├──────────────────────────┤
            │   │         │ • Register Donor         │
            │   │         │ • Register Hospital      │
            │   │         │ • Register Organization  │
            │   │         │ • Login                  │
            │   │         │ • View Profile           │
            │   │         └──────────────────────────┘
            │   │
            │   │         ┌──────────────────────────┐
            └───┤─────────│  Donor Features          │
                │         ├──────────────────────────┤
                │         │ • Request Blood          │
                │         │ • View Donor List        │
                │         └──────────────────────────┘
                │
                │         ┌──────────────────────────┐
                └─────────│  Purchase Features       │
                          ├──────────────────────────┤
                          │ • Browse Blood Prices    │
                          │ • Purchase Blood         │
                          │ • Process Payment        │
                          │ • Generate Receipt       │
                          │ • Track Purchase         │
                          └──────────────────────────┘

Extension Points:
  ◇ ----→ (uses)
  ◇ <----│ (extends)
```

---

## Sequence Diagrams

### 1. Blood Request Flow

```
Donor          System         Database         Email Service
  │              │              │                │
  ├─ Register ──→ │              │                │
  │              ├─────────────→ │ Save User      │
  │              │ ◄─────────────┤ (created)      │
  │              │              │                │
  │              │ ◄─────────────────────────────┤
  │              │    Welcome Email               │
  │              │              │                │
  ├─ Request ───→ │              │                │
  │  Blood        │──────────────→ │ Check        │
  │              │  Verify Donor │ Donor Status  │
  │              │ ◄─────────────┤              │
  │              │              │                │
  │              ├──────────────→ │ Create Request│
  │              │ ◄─────────────┤ (pending)     │
  │              │              │                │
  │              │ ◄─────────────────────────────┤
  │              │  Request Confirmation Email    │
  │              │              │                │
  │ ◄────────────┤ Success      │                │
  │              │              │                │

Steps:
1. Donor fills blood request form with patient details
2. System validates donor is registered
3. System validates blood type and units
4. System creates request with "pending" status
5. Email notification sent to requester
6. Success message displayed to donor
```

### 2. Blood Purchase Flow

```
Buyer          System         Hospital DB       Payment       Email Service
  │              │              │              Gateway         │
  │              │              │                │              │
  ├─ Browse ────→ │              │                │              │
  │  Available    │──────────────→ │ Get Inventory│              │
  │  Blood        │              ◄──────────────┤              │
  │              │ Display Options               │              │
  │ ◄─────────────┤              │                │              │
  │              │              │                │              │
  ├─ Select ────→ │              │                │              │
  │  Blood        ├──────────────→ │ Reserve Units│              │
  │              │ ◄─────────────┤ (reserved)    │              │
  │              │              │                │              │
  │ ◄─────────────┤ Display Price │              │              │
  │              │ & Calculate   │              │              │
  │              │ Total         │              │              │
  │              │              │                │              │
  ├─ Checkout ───→ │              │                │              │
  │              ├─────────────────────────────→ │ Process      │
  │              │              │    Payment    │              │
  │              │              │ ◄─────────────┤ Confirmation │
  │              │ ◄─────────────────────────────┤              │
  │              │              │                │              │
  │              ├──────────────→ │ Deduct Units │              │
  │              │ ◄─────────────┤ (inventory   │              │
  │              │              │  updated)    │              │
  │              │              │                │              │
  │              │ ◄──────────────────────────────────────────→│
  │              │              │    Receipt Email              │
  │ ◄─────────────┤ Success      │                │              │
  │  + Receipt    │              │                │              │

Steps:
1. Buyer searches and filters blood inventory
2. System displays available blood units with prices
3. Buyer selects blood type and quantity
4. System calculates total price
5. Buyer initiates checkout
6. Payment gateway processes payment
7. On successful payment, blood inventory is updated
8. Digital receipt generated and emailed
9. Purchase confirmation shown to buyer
```

### 3. Admin Management Flow

```
Admin          Admin Panel     System         Database       Hospital/Org
  │              │              │              │              │
  ├─ Login ─────→ │              │              │              │
  │              │──────────────→ │ Authenticate│              │
  │              │ ◄─────────────┤ User (Admin) │              │
  │              │              │              │              │
  │ ◄─────────────┤ Dashboard    │              │              │
  │              │              │              │              │
  ├─ View ──────→ │              │              │              │
  │  Analytics   │──────────────→ │ Query Stats │              │
  │              │              ├──────────────→│ Request Data │
  │              │              │ ◄─────────────┤              │
  │              │ ◄─────────────┤              │              │
  │ ◄─────────────┤ Display      │              │              │
  │              │  Charts       │              │              │
  │              │              │              │              │
  ├─ Manage ────→ │              │              │              │
  │  Inventory   │──────────────→ │ Update Stock│              │
  │              │              ├──────────────→│ Notify       │
  │              │ ◄─────────────┤ (confirmed) │ ◄────────────┤
  │              │              │              │              │
  ├─ Set ──────→ │              │              │              │
  │  Pricing    │──────────────→ │ Update Price│              │
  │              │              ├──────────────→│ Notify       │
  │              │ ◄─────────────┤ (confirmed) │ ◄────────────┤
  │              │              │              │              │

Steps:
1. Admin enters credentials and logs into admin panel
2. System authenticates admin credentials
3. Admin views various analytics dashboards
4. System aggregates and displays data
5. Admin manages blood inventory levels
6. System updates inventory in database
7. Hospital/Organization receives inventory notifications
8. Admin updates blood unit prices
9. Price updates are recorded and propagated
```

---

## Activity Diagrams

### 1. Blood Request Activity Diagram

```
                            ┌──────────────────┐
                            │   User Initiates │
                            │ Blood Request    │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Fill Request    │
                            │  Form with:      │
                            │  - Patient Name  │
                            │  - Blood Type    │
                            │  - Units Needed  │
                            │  - Hospital      │
                            │  - Reason        │
                            │  - Urgency       │
                            └────────┬─────────┘
                                     │
                            ┌────────▼──────────────┐
                            │  System Validates:    │
                            │  - User is Registered │
                            │  - Form Fields Valid  │
                            │  - Blood Type Valid   │
                            └────────┬──────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                    ◇──────▼─── Valid?      No │
                   /                            │
             Yes /                         ┌────▼───────────┐
               /                           │  Display Error │
              /                            │  Message       │
      ┌──────▼──────────┐            ┌─────▼───┐ ◇ ────┐
      │ Create Request  │            │  Prompt │      Return to
      │ with Status:    │            │  to Fix │      Form
      │ "pending"       │            └────┬────┘
      │                 │                 │
      │ Save to DB      │                 └──────┬────┐
      └────────┬────────┘                        │    │
               │                                 │    │
      ┌────────▼────────┐                        │    │
      │  Send Email     │                        │    │
      │  Notification   │ ◇ ─────────────────────┘    │
      │  to Requester   │                             │
      └────────┬────────┘                             │
               │                                      │
      ┌────────▼──────────────┐                       │
      │  Display Success      │                       │
      │  Message with         │◇ ──────────────────────┘
      │  Request ID           │
      │  Track Request Status │
      └────────┬──────────────┘
               │
      ┌────────▼─────────────┐
      │ Update Request Status │
      │ by Admin (optional)   │
      └────────┬─────────────┘
               │
      ┌────────▼─────────────┐
      │  Request Completed   │
      │  (fulfilled/rejected) │
      └──────────────────────┘
```

### 2. Blood Purchase Activity Diagram

```
                         ┌──────────────────────┐
                         │  User Searches for   │
                         │  Blood               │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ System Queries:      │
                         │ - Hospitals          │
                         │ - Organizations      │
                         │ - Blood Inventory    │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  Filter by:          │
                         │  - Blood Type        │
                         │  - Price Range       │
                         │  - Location          │
                         │  - Availability      │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  Display Results &   │
                         │  Price Comparison    │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  User Selects Blood  │
                         │  Unit & Quantity     │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  Calculate Total     │
                         │  Price with Tax      │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  User Reviews:       │
                         │  - Unit Price        │
                         │  - Quantity          │
                         │  - Total Amount      │
                         │  - Expiry Date       │
                         └──────────┬───────────┘
                                    │
                    ◇───────────────┴──────────────┐
                   /                               │
            Confirm?                            Cancel
               /                                   │
             Yes                          ┌────────▼─────────┐
            /                             │  Return to Browse │
      ┌────▼─────────────────────────┐  └──────────────────┘
      │  Initiate Checkout            │
      │  - Review Cart                │
      │  - Enter Billing Info         │
      └────────┬────────────────────┘
               │
      ┌────────▼──────────────────┐
      │  Redirect to Payment       │
      │  Gateway (SSLCommerz)      │
      └────────┬──────────────────┘
               │
      ┌────────▼──────────────────┐
      │  SSLCommerz:              │
      │  - Validate Card/Account  │
      │  - Process Transaction    │
      └────────┬──────────────────┘
               │
          ◇────┴────────────┐
         /                   \
    Success              Failed
      /                       \
┌────▼────────────────┐  ┌────▼──────────────┐
│ Update Inventory    │  │ Payment Failed    │
│ - Deduct Units      │  │ Display Error     │
│ Create BloodPurchase│  │ Suggest Retry     │
│ Record             │  └───┬────────────────┘
│ - Generate Receipt │      │
│ - Store Payment ID │      └──────┬─────────┐
└────────┬───────────┘             │ Retry?  │
         │                       Yes├────┬    │No
         │                         │    │    │
         │                         │    └────┴─────┐
         │                                         │
┌────────▼──────────────────┐        ┌────────────▼─┐
│  Send Receipt Email        │        │  Transaction │
│  - Tracking Number         │        │  Cancelled   │
│  - Purchase Details        │        └──────────────┘
│  - Download Link           │
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  Display Success Page      │
│  - Thank You Message       │
│  - Tracking Number         │
│  - Next Steps              │
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  Purchase Complete         │
│  Blood Ready for Pickup    │
└────────────────────────────┘
```

### 3. User Registration Activity Diagram

```
                     ┌──────────────────────┐
                     │  User Accesses       │
                     │  Registration Page   │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │  Select User Type    │
                     │  - Donor             │
                     │  - Hospital          │
                     │  - Organization      │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │  Fill Registration   │
                     │  Form:               │
                     │  - Personal Info     │
                     │  - Contact Details   │
                     │  - Address           │
                     │  - Credentials       │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────────┐
                     │  System Validates:       │
                     │  - Email Format          │
                     │  - Email Uniqueness      │
                     │  - Password Strength     │
                     │  - Phone Format          │
                     │  - Required Fields       │
                     └──────────┬───────────────┘
                                │
                 ◇──────────────┴──────────────┐
                /                               │
          Valid?                             No │
            /                                   │
         Yes                         ┌──────────▼──────┐
          /                          │ Show Validation │
     ┌────▼──────────────────┐      │ Errors          │
     │ Hash Password         │      └──────┬───────────┘
     │ Create User Record    │             │
     └────────┬──────────────┘             │
              │                            │
     ┌────────▼──────────────┐             │
     │ Save to Database      │             │
     │ Status: "pending"     │             │
     └────────┬──────────────┘             │
              │                            │
     ┌────────▼──────────────┐      ┌──────▼───────┐
     │ Generate JWT Token    │      │ Return to    │
     │ Send Welcome Email    │  ◇ ──┤ Form (Filled)
     │ + Email Verification  │      └──────────────┘
     └────────┬──────────────┘
              │
     ┌────────▼──────────────────┐
     │ Display Success Message    │
     │ Redirect to Login or Home  │
     └────────┬──────────────────┘
              │
     ┌────────▼──────────────────┐
     │ User Email Verification   │
     │ (if applicable)            │
     └────────┬──────────────────┘
              │
     ┌────────▼──────────────────┐
     │ Account Active            │
     │ Ready to Use              │
     └────────────────────────────┘
```

---

## Swimlane Diagram

### Blood Purchase Process Swimlane Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      BLOOD PURCHASE PROCESS SWIMLANE DIAGRAM                        │
├─────────────┬──────────────┬─────────────┬──────────────┬─────────────┬────────────┤
│   BUYER     │    SYSTEM    │   DATABASE  │   HOSPITAL/  │   PAYMENT   │   EMAIL    │
│             │              │             │ ORGANIZATION │   GATEWAY   │   SERVICE  │
├─────────────┼──────────────┼─────────────┼──────────────┼─────────────┼────────────┤
│             │              │             │              │             │            │
│ 1. Browse   │              │             │              │             │            │
│    Blood ──→│ 2. Query     │             │              │             │            │
│             │    Inventory│→│ Fetch      │              │             │            │
│             │    Data      │←│ Inventory │              │             │            │
│             │              │             │              │             │            │
│             │ 3. Display   │             │              │             │            │
│←─ Options ─┤    Available  │             │              │             │            │
│             │    Blood     │             │              │             │            │
│             │              │             │              │             │            │
│ 4. Select   │              │             │              │             │            │
│    Units ──→│ 5. Reserve   │→│ Update    │              │             │            │
│             │    Blood     │ │ Status    │              │             │            │
│             │              │←│ (reserved)│              │             │            │
│             │              │             │              │             │            │
│ 6. View     │ 7. Calculate │             │              │             │            │
│    Total ──→│    Total Price             │              │             │            │
│ Price       │←─ Display    │             │              │             │            │
│             │              │             │              │             │            │
│ 8.Checkout→│ 9. Process   │             │              │             │            │
│             │    Checkout  │            │              │             │            │
│             │─────────────────────────────────────────→│ 10. Validate│            │
│             │              │             │              │    & Process│            │
│             │              │             │              │    Payment  │            │
│             │              │             │              │←─ Response ┤            │
│             │ 11. Confirm  │→│ Deduct   │              │             │            │
│             │    Payment   │ │ Units    │              │             │            │
│             │              │←│ (updated)│              │             │            │
│             │              │             │              │             │            │
│             │ 12. Generate │             │              │             │            │
│             │    Receipt  │→│ Create    │              │             │            │
│             │              │ │ Record    │              │             │            │
│             │              │←│ (saved)   │              │             │            │
│             │              │             │              │             │            │
│             │ 13. Email    │             │              │             │←─ Receipt│
│             │    Receipt  ─┼─────────────┼──────────────┼─────────────┼──→ Sent  │
│             │              │             │              │             │            │
│←─ Success ┬┤ 14. Display   │             │              │             │            │
│ Message    │    Confirmation             │              │             │            │
│ + Receipt  │                             │              │             │            │
└─────────────┴──────────────┴─────────────┴──────────────┴─────────────┴────────────┘

Timeline: ─────→ (Sequential Flow)
```

---

## Class Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          BLOODBRIDGE CLASS DIAGRAM                         │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│          <<User>>            │
├──────────────────────────────┤
│ - userId: ObjectId           │
│ - fullName: String           │
│ - email: String              │
│ - phone: String              │
│ - password: String           │
│ - dateOfBirth: Date          │
│ - gender: String             │
│ - address: String            │
│ - city: String               │
│ - state: String              │
│ - zipCode: String            │
│ - bloodType: String          │
│ - rhFactor: String           │
│ - role: String               │
│ - createdAt: DateTime        │
│ - updatedAt: DateTime        │
├──────────────────────────────┤
│ + register(): void           │
│ + login(): boolean           │
│ + updateProfile(): void      │
│ + getProfile(): User         │
│ + validateEmail(): boolean   │
│ + hashPassword(): String     │
│ + comparePassword(): boolean │
└──────────┬───────────────────┘
           │
      ◇────┼────◇
      │    │    │
      │    │    └─────────────────────────────────┐
      │    └──────────────────────────┐           │
      │                                │           │
      ▼                                ▼           ▼
┌──────────────────────┐  ┌─────────────────────────┐
│   <<BloodRequest>>   │  │  <<BloodPurchase>>      │
├──────────────────────┤  ├─────────────────────────┤
│ - requestId: ObjectId│  │ - purchaseId: ObjectId  │
│ - patientName: String│  │ - trackingNumber: String│
│ - bloodType: String  │  │ - purchasedBy: User*    │
│ - units: Number      │  │ - sourceType: String    │
│ - hospital: String   │  │ - sourceName: String    │
│ - reason: String     │  │ - bloodType: String     │
│ - urgency: String    │  │ - units: Number         │
│ - contactName: String│  │ - expiryDate: Date      │
│ - contactPhone: Str. │  │ - pricePerUnit: Number  │
│ - requiredDate: Date │  │ - totalAmount: Number   │
│ - requestedBy: User* │  │ - paymentStatus: String │
│ - status: String     │  │ - paymentMethod: String │
│ - createdAt: DateTime│  │ - receiptUrl: String    │
│ - updatedAt: DateTime│  │ - createdAt: DateTime   │
├──────────────────────┤  │ - updatedAt: DateTime   │
│ + submitRequest()   │  ├─────────────────────────┤
│ + updateStatus()    │  │ + createPurchase(): void│
│ + getRequest()      │  │ + updatePaymentStatus() │
│ + validateRequest() │  │ + generateReceipt()     │
│ + cancel()          │  │ + getPurchase()         │
└──────────────────────┘  │ + refundPurchase()      │
                          └─────────────────────────┘

┌────────────────────────────────────┐
│        <<Hospital>>                │
├────────────────────────────────────┤
│ - hospitalId: ObjectId             │
│ - name: String                     │
│ - emergencyHotline: String         │
│ - ambulance: String                │
│ - phone: String                    │
│ - email: String                    │
│ - address: String                  │
│ - website: String                  │
│ - status: String                   │
│ - bloodInventory: [BloodUnit]      │
│ - pricing: [PricingInfo]           │
│ - createdAt: DateTime              │
│ - updatedAt: DateTime              │
├────────────────────────────────────┤
│ + registerHospital(): void         │
│ + updateInventory(): void          │
│ + setPricing(): void               │
│ + getInventory(): [BloodUnit]      │
│ + getPricing(): [PricingInfo]      │
│ + searchNearby(): [Hospital]       │
└────────┬────────────────────────────┘
         │
         │ 1:N
         │
         ▼
┌────────────────────────────────────┐
│     <<BloodInventory>>             │
├────────────────────────────────────┤
│ - inventoryId: ObjectId            │
│ - bloodType: String                │
│ - units: Number                    │
│ - expiryDate: Date                 │
│ - pricePerUnit: Number             │
│ - status: String                   │
├────────────────────────────────────┤
│ + addUnits(): void                 │
│ + removeUnits(): void              │
│ + checkAvailability(): boolean     │
│ + getInventoryDetails(): Object    │
│ + updatePrice(): void              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│    <<Organization>>                │
├────────────────────────────────────┤
│ - orgId: ObjectId                  │
│ - name: String                     │
│ - status: String                   │
│ - category: String                 │
│ - description: String              │
│ - contact: String                  │
│ - phone: String                    │
│ - email: String                    │
│ - website: String                  │
│ - address: String                  │
│ - bloodInventory: [BloodUnit]      │
│ - pricing: [PricingInfo]           │
│ - createdAt: DateTime              │
├────────────────────────────────────┤
│ + registerOrganization(): void     │
│ + updateDetails(): void            │
│ + updateInventory(): void          │
│ + getDetails(): Object             │
│ + getPricing(): [PricingInfo]      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│        <<Admin>>                   │
├────────────────────────────────────┤
│ - adminId: ObjectId                │
│ - username: String                 │
│ - password: String                 │
│ - name: String                     │
│ - email: String                    │
│ - role: String                     │
│ - permissions: String              │
│ - organizationId: Organization*    │
│ - createdAt: DateTime              │
├────────────────────────────────────┤
│ + login(): boolean                 │
│ + viewDashboard(): Object          │
│ + managePricing(): void            │
│ + manageInventory(): void          │
│ + viewAnalytics(): Object          │
│ + manageRequests(): void           │
│ + managePurchases(): void          │
│ + manageDonors(): void             │
│ + getPermissions(): [String]       │
└────────────────────────────────────┘

Relationships Legend:
──→ Association
◇──→ Aggregation (weak)
◆──→ Composition (strong)
──▶ Inheritance
1:N  Cardinality (One to Many)
*    Multiplicity (One or Many)
```

---

## Data Flow Diagram (DFD)

### Level 0: Context Diagram

```
                                    ┌──────────────────────┐
                                    │   BLOODBRIDGE        │
                                    │   PLATFORM SYSTEM    │
                                    │                      │
                                    │ - Manage Blood       │
                                    │ - Process Requests   │
                                    │ - Process Purchases  │
                                    │ - Manage Users       │
                                    │ - Manage Inventory   │
                                    └──────────┬───────────┘
                    ┌───────────────────────────┼────────────────────────┐
                    │                           │                        │
         ┌──────────▼──────────┐      ┌────────▼─────────┐    ┌─────────▼──────────┐
         │   USERS/DONORS      │      │   HOSPITALS &    │    │   PAYMENT GATEWAY  │
         │                     │      │   ORGANIZATIONS  │    │   (SSLCommerz)     │
         │ - Register/Login    │      │                  │    │                    │
         │ - Submit Requests   │      │ - Inventory      │    │ - Validate Payment │
         │ - Make Purchases    │      │ - Pricing        │    │ - Process Payment  │
         │ - View Requests     │      │ - Blood Levels   │    │ - Return Status    │
         │ - View Donors       │      │ - Register       │    │                    │
         │ - View Hospitals    │      │                  │    │                    │
         └────────┬────────────┘      └────────┬─────────┘    └─────────┬──────────┘
                  │                           │                        │
                  │                           │                        │
            ◇─────┴───────────────────────────┴────────────────────────┴─────◇
```

### Level 1: Main Processes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEVEL 1: MAIN PROCESSES                             │
└─────────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────────┐
                          │   EXTERNAL ENTITIES  │
                          │                      │
         ┌────────────────┤ E1: Users/Donors     │
         │                │ E2: Hospitals/Orgs   │
         │                │ E3: Payment Gateway  │
         │                └──────────────────────┘
         │
         │
    ┌────▼────────────────────────────────────────────────────────────┐
    │                                                                  │
    │  1.0 User Management                                           │
    │  ├─ Register User                                              │
    │  ├─ Authenticate User                                          │
    │  └─ Manage User Profile                                        │
    │                                                                  │
    │  2.0 Blood Request Processing                                  │
    │  ├─ Submit Blood Request                                       │
    │  ├─ Validate Request                                           │
    │  ├─ Store Request                                              │
    │  └─ Update Request Status                                      │
    │                                                                  │
    │  3.0 Blood Purchase Processing                                 │
    │  ├─ Search Blood Inventory                                     │
    │  ├─ Calculate Total Price                                      │
    │  ├─ Process Payment                                            │
    │  ├─ Update Inventory                                           │
    │  ├─ Generate Receipt                                           │
    │  └─ Send Confirmation                                          │
    │                                                                  │
    │  4.0 Inventory Management                                      │
    │  ├─ Update Blood Stock                                         │
    │  ├─ Track Expiry Dates                                         │
    │  ├─ Monitor Availability                                       │
    │  └─ Alert on Low Stock                                         │
    │                                                                  │
    │  5.0 Admin Functions                                           │
    │  ├─ View Analytics                                             │
    │  ├─ Manage Pricing                                             │
    │  ├─ Approve/Reject Registrations                               │
    │  ├─ Manage Requests                                            │
    │  ├─ Manage Purchases                                           │
    │  └─ Generate Reports                                           │
    │                                                                  │
    └────┬─────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                    DATA STORES (D)                           │
    │                                                              │
    │ D1: User Database                                           │
    │ D2: Blood Request Database                                  │
    │ D3: Blood Purchase Database                                 │
    │ D4: Blood Inventory Database                                │
    │ D5: Hospital/Organization Database                          │
    │ D6: Admin Database                                          │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

### Level 2: Blood Purchase Process Detail

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   LEVEL 2: BLOOD PURCHASE DETAILED FLOW                      │
└──────────────────────────────────────────────────────────────────────────────┘


┌─────────────┐                                              ┌─────────────┐
│   BUYER     │                                              │  HOSPITALS/ │
│             │                                              │ ORGANIZATION│
└────┬────────┘                                              └─────────────┘
     │                                                               │
     │ 1. Search Request                                           │
     │──────────────────────┬──────────────────────────────────────│
     │                      │                                       │
     │                ┌─────▼──────┐                              │
     │                │ 3.1 Query  │                              │
     │                │ Inventory  │                              │
     │                └─────┬──────┘                              │
     │                      │                                       │
     │            ┌─────────┴────────┐                            │
     │            │                  │                            │
     │      ┌─────▼────┐        ┌────▼──────┐                   │
     │      │   D4:    │        │  3.2 Get  │                   │
     │      │Inventory │◄───────│ Available │───────────────────┤
     │      │          │        │  Units    │                    │
     │      └──────────┘        └───────────┘                   │
     │                                │                           │
     │                          ┌─────▼───────┐                 │
     │                          │ 3.3 Display│                  │
     │                          │   Options   │                  │
     │                          └─────┬───────┘                 │
     │                                │                          │
     │ 2. Select & Add to Cart        │                          │
     │◄───────────────────────────────┤                          │
     │                                │                          │
     │          ┌────────────────────┐│                          │
     │          │   3.4 Calculate    ││                          │
     │          │   Total Price      ││                          │
     │          └────────┬───────────┘│                          │
     │                   │            │                          │
     │ 3. Checkout       │            │                          │
     │──────────────────┬┘            │                          │
     │                  │             │                          │
     │            ┌─────▼──────────────────┐                    │
     │            │   3.5 Reserve Units    │                    │
     │            └──────┬────────────────┘                     │
     │                   │                                       │
     │                   └──────────────────────────────────────┤
     │                                                           │
     │ 4. Process Payment                                        │
     │─────────────────────┬──────────────────────────────────┐ │
     │                     │                                   │ │
     │              ┌──────▼──────┐                            │ │
     │              │ 3.6 Create  │         ┌──────────────┐  │ │
     │              │ Payment     │────────→│  PAYMENT     │  │ │
     │              │ Transaction │         │  GATEWAY     │  │ │
     │              └─────┬───────┘         └──────┬───────┘  │ │
     │                    │                       │           │ │
     │                    │ (Success/Fail)        │           │ │
     │                    │◄──────────────────────┘           │ │
     │                    │                                    │ │
     │           ◇────────┴──────────┐                        │ │
     │          /                     \                        │ │
     │      Success                  Failed                   │ │
     │        /                         \                      │ │
     │   ┌────▼─────────┐        ┌───────▼────┐             │ │
     │   │ 3.7 Confirm  │        │ 3.8 Reject │             │ │
     │   │ Payment      │        │ Payment    │             │ │
     │   └──────┬───────┘        └────────────┘             │ │
     │          │                                            │ │
     │    ┌─────▼──────────────┐                           │ │
     │    │ 3.9 Deduct Units  │───────────────────────────┤ │
     │    │ from Inventory    │                            │ │
     │    └─────┬──────────────┘                           │ │
     │          │                                           │ │
     │    ┌─────▼──────────────┐                           │ │
     │    │ 3.10 Update D4:    │                           │ │
     │    │ Inventory          │                           │ │
     │    └─────┬──────────────┘                           │ │
     │          │                                           │ │
     │    ┌─────▼──────────────┐                           │ │
     │    │ 3.11 Create        │                           │ │
     │    │ Purchase Record    │                           │ │
     │    │ in D3              │                           │ │
     │    └─────┬──────────────┘                           │ │
     │          │                                           │ │
     │    ┌─────▼──────────────┐                           │ │
     │    │ 3.12 Generate      │                           │ │
     │    │ Receipt (PDF)      │                           │ │
     │    └─────┬──────────────┘                           │ │
     │          │                                           │ │
     │ 5.Success│                                           │ │
     │◄──────────┘                                           │ │
     │                                                       │ │
     │                                          (Notify)     │ │
     │                                           ◇──────────┴─┘
     │                                                      
```

---

## CRC (Class Responsibility Collaborator)

### CRC Card Format

```
╔════════════════════════════════════════════════════════════════════════════╗
║                             CRC CARDS                                      ║
╚════════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────┬────────────────────────────────────┐
│ CLASS: User                        │ CLASS: BloodRequest               │
├────────────────────────────────────┼────────────────────────────────────┤
│ RESPONSIBILITIES:                  │ RESPONSIBILITIES:                  │
│ - Store user information           │ - Store request details            │
│ - Validate user data               │ - Validate request data            │
│ - Authenticate credentials         │ - Track request status             │
│ - Manage user profile              │ - Calculate urgency level          │
│ - Hash and compare passwords       │ - Generate request reports         │
│ - Track blood type and RH factor   │                                    │
│ - Store address and location       │ COLLABORATORS:                     │
│ - Maintain registration status     │ - User (requestedBy)               │
│                                    │ - BloodPurchase                    │
│ COLLABORATORS:                     │ - Hospital                         │
│ - BloodRequest                     │ - NotificationService              │
│ - BloodPurchase                    │                                    │
│ - Admin                            │                                    │
│ - Hospital                         │                                    │
│ - Organization                     │                                    │
└────────────────────────────────────┴────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────────────────┐
│ CLASS: BloodPurchase               │ CLASS: Hospital                    │
├────────────────────────────────────┼────────────────────────────────────┤
│ RESPONSIBILITIES:                  │ RESPONSIBILITIES:                  │
│ - Store purchase transaction       │ - Store hospital information       │
│ - Calculate total amount           │ - Manage blood inventory           │
│ - Track payment status             │ - Set and manage pricing           │
│ - Generate and store receipt       │ - Track emergency hotline          │
│ - Maintain tracking number         │ - Store contact information        │
│ - Store payment method details     │ - Manage emergency services        │
│ - Track expiry dates               │ - Validate hospital status         │
│ - Support refund operations        │                                    │
│                                    │ COLLABORATORS:                     │
│ COLLABORATORS:                     │ - BloodInventory                   │
│ - User (purchasedBy)               │ - BloodPurchase                    │
│ - PaymentGateway                   │ - BloodRequest                     │
│ - NotificationService              │ - Admin                            │
│ - Hospital/Organization            │                                    │
│ - Receipt                          │                                    │
└────────────────────────────────────┴────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────────────────┐
│ CLASS: BloodInventory              │ CLASS: Admin                       │
├────────────────────────────────────┼────────────────────────────────────┤
│ RESPONSIBILITIES:                  │ RESPONSIBILITIES:                  │
│ - Store blood unit details         │ - Authenticate admin credentials   │
│ - Track units available            │ - View dashboard analytics         │
│ - Track expiry dates               │ - Manage user registrations        │
│ - Manage unit pricing              │ - Manage request statuses          │
│ - Alert on low stock               │ - Set and update pricing           │
│ - Support inventory updates        │ - Manage blood inventory           │
│ - Track unit reservations          │ - Approve/reject entities          │
│ - Generate inventory reports       │ - Generate system reports          │
│                                    │ - Manage admin accounts            │
│ COLLABORATORS:                     │ - Assign user roles/permissions    │
│ - Hospital                         │                                    │
│ - Organization                     │ COLLABORATORS:                     │
│ - BloodPurchase                    │ - User                             │
│ - BloodRequest                     │ - Hospital                         │
│                                    │ - Organization                     │
│                                    │ - BloodRequest                     │
│                                    │ - BloodPurchase                    │
│                                    │ - BloodInventory                   │
└────────────────────────────────────┴────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────────────────┐
│ CLASS: Organization                │ CLASS: PaymentGateway              │
├────────────────────────────────────┼────────────────────────────────────┤
│ RESPONSIBILITIES:                  │ RESPONSIBILITIES:                  │
│ - Store organization information   │ - Validate payment details         │
│ - Manage blood inventory           │ - Process payment transactions     │
│ - Set and manage pricing           │ - Return payment status            │
│ - Store contact information        │ - Support refunds                  │
│ - Track approval status            │ - Maintain transaction security    │
│ - Store website and description    │ - Generate transaction records     │
│ - Manage category classification   │                                    │
│ - Validate organization details    │ COLLABORATORS:                     │
│                                    │ - BloodPurchase                    │
│ COLLABORATORS:                     │ - NotificationService              │
│ - BloodInventory                   │                                    │
│ - BloodPurchase                    │                                    │
│ - Admin                            │                                    │
│ - BloodRequest                     │                                    │
└────────────────────────────────────┴────────────────────────────────────┘

┌────────────────────────────────────┬────────────────────────────────────┐
│ CLASS: NotificationService         │ CLASS: Receipt                     │
├────────────────────────────────────┼────────────────────────────────────┤
│ RESPONSIBILITIES:                  │ RESPONSIBILITIES:                  │
│ - Send welcome emails              │ - Store receipt data               │
│ - Send request confirmations       │ - Generate PDF format              │
│ - Send purchase confirmations      │ - Calculate itemized amounts       │
│ - Send status update emails        │ - Include transaction details      │
│ - Send verification emails         │ - Generate download link           │
│ - Send price change notifications  │ - Track receipt generation date    │
│ - Send inventory alerts            │ - Support receipt reprints         │
│                                    │                                    │
│ COLLABORATORS:                     │ COLLABORATORS:                     │
│ - User                             │ - BloodPurchase                    │
│ - BloodRequest                     │ - User                             │
│ - BloodPurchase                    │ - NotificationService              │
│ - Hospital                         │                                    │
│ - Organization                     │                                    │
└────────────────────────────────────┴────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════╗
║                    CRC SUMMARY TABLE                                       ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Class                │ Responsibility Count │ Collaborator Count │ Type    ║
╠════════════════════════════════════════════════════════════════════════════╣
║ User                 │ 7                    │ 5                  │ Entity  ║
║ BloodRequest         │ 6                    │ 4                  │ Entity  ║
║ BloodPurchase        │ 8                    │ 4                  │ Entity  ║
║ Hospital             │ 7                    │ 4                  │ Entity  ║
║ Organization         │ 7                    │ 4                  │ Entity  ║
║ BloodInventory       │ 8                    │ 4                  │ Entity  ║
║ Admin                │ 8                    │ 6                  │ Control ║
║ PaymentGateway       │ 6                    │ 2                  │ Service ║
║ NotificationService  │ 7                    │ 5                  │ Service ║
║ Receipt              │ 7                    │ 2                  │ Entity  ║
╚════════════════════════════════════════════════════════════════════════════╝

Key Insights:
→ Admin class has the most collaborators (6), indicating it's a central controller
→ PaymentGateway is a service with fewer collaborators (external system)
→ NotificationService is a utility service used across multiple classes
→ Entity classes (User, Hospital, Organization) have 7+ responsibilities
```

---

## Summary: System Actors

| Actor | Role | Key Activities |
|-------|------|-----------------|
| **Donor/User** | Primary | Register, Request Blood, View Hospitals/Organizations, Make Purchases, Track Transactions |
| **Patient/Requester** | Primary | Submit Blood Request via donor registration, Track Request Status, Receive Notifications |
| **Hospital** | Primary | Register on Platform, Manage Blood Inventory, Set Pricing, Fulfill Requests, Process Sales |
| **Organization** | Primary | Register on Platform, Manage Blood Inventory, Set Pricing, Collaborate with Hospitals |
| **Buyer/Customer** | Primary | Search Blood Availability, Compare Prices, Purchase Blood, Make Payments, Download Receipts |
| **Super Admin** | Secondary | Manage All Users, View Analytics, Approve Registrations, Set System Pricing, Manage All Entities |
| **Organization Admin** | Secondary | Manage Organization-specific Users, View Organization Analytics, Update Organization Inventory |
| **Hospital Admin** | Secondary | Manage Hospital Blood Stock, Update Pricing, View Hospital Analytics, Process Orders |
| **Payment Gateway** | Secondary (External) | Validate Payments, Process Transactions, Return Status, Issue Refunds |
| **Email Service** | Secondary (External) | Send Notifications, Confirmations, Receipts, Alerts |

---

## Architecture Components Overview

### Frontend (React + Vite)
- User authentication and profile management
- Blood request submission interface
- Hospital and organization browsing
- Blood purchase interface with price comparison
- Admin dashboard
- Payment integration
- Receipt generation and display

### Backend (Node.js + Express)
- User authentication (JWT)
- Blood request management
- Blood inventory tracking
- Blood purchase processing
- Payment gateway integration (SSLCommerz)
- Admin functions
- Email notifications
- Data validation and business logic

### Database (MongoDB)
- User collection
- Blood request collection
- Blood purchase collection
- Hospital collection
- Organization collection
- Admin collection
- Blood inventory tracking

### External Services
- **SSLCommerz**: Payment processing
- **Email Service**: Notifications and receipts
- **Firebase**: Authentication and storage (optional)

---

## System Flow Summary

1. **User Registration** → User provides details → System validates → Account created
2. **Blood Request** → Registered donor submits request → System validates → Request stored → Notifications sent
3. **Blood Search** → User searches inventory → System queries hospitals/orgs → Results displayed with prices
4. **Blood Purchase** → User selects blood → Checkout → Payment processing → Inventory updated → Receipt generated
5. **Admin Management** → Admin logs in → Views analytics → Manages inventory/pricing → Updates broadcast

---

**End of Practicum Analysis Report**

All diagrams and documentation have been created based on your BloodBridge Foundation project structure.
