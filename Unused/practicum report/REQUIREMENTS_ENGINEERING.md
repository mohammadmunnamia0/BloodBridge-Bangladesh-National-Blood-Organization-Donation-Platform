

## 3.2 Requirement Engineering

Requirement Engineering involves defining the user, system, functional, and non-functional requirements to ensure the system is user-friendly, secure, and performs as expected. These requirements guided the development of BloodBridge-Foundation.



### 3.2.1 User Requirements
The system serves three main user types: unregistered users (who can browse and compare but not transact), registered users (who can request and purchase blood, apply to become verified donors, and manage their profile and activity), and administrators (who manage users, donor applications, content, and platform operations). The user requirements define the expectations and permissions for each group when interacting with the system.

The system serves three main user types:

I. Unregistered User:
• Can browse the homepage, view all listed hospitals and organizations, and see the public dashboard of blood requests.
• Can access the buy blood page to compare prices by blood type and filter by organization or hospital, but cannot purchase blood or view donor details.

II. Registered User:
• Can access all pages: homepage, hospital and organization listings (with categories), public blood request dashboard, and buy blood page.
• Can register by completing the registration form; after registration, gains access to a personal profile page.
• Can update profile, view purchase history, track blood request status, and see shipping status for purchased blood.
• Can submit blood requests and purchase blood from any source listed.
• Can compare prices and filter sources before buying.
• Can apply to become a verified donor by submitting a donor application form.
• Can view the status of their donor application and, if approved, access the verified donor list and related features.

III. Admin:
• Can log in to the admin dashboard.
• Can manage users (ban users), blood requests (update status: Pending, Approved, Fulfilled, Rejected), and purchases (update status: Pending, Verified, Confirm, Ready, Complete, Cancelled).
• Can manage hospitals and organizations (add, edit, delete; editing requires completing the full form).
• Can manage inventory (update stock for hospitals and organizations).
• Can update prices for hospitals and organizations.
• Can view, approve, or reject donor applications, manage verified donors, and see donor statistics in a dedicated donor management panel.
• Has access to a to-do list section to track and remind pending admin tasks.

### 3.2.2 System Requirements
The system requirements describe the necessary infrastructure and technical specifications:

I. Platform and Infrastructure:
• Web-based SPA (React) frontend and Node.js/Express backend.
• Accessible via modern browsers (Chrome, Firefox, Edge, Safari).
• Hosted on a secure cloud platform (e.g., Vercel), with HTTPS enforced.
• Responsive design for desktops, tablets, and smartphones (Tailwind CSS).

II. Database and Data Management:
• MongoDB database for storing users, hospitals, organizations, requests, and purchases.
• Mongoose ODM for schema validation and data modeling.
• Secure JWT-based authentication and session management.

III. Payment Integration:
• SSLCommerz payment gateway for secure transactions, with callbacks for payment status.

IV. Hosting and Deployment:
• CI/CD support, regular backups, and scaling for future growth.
• Environment variables for sensitive configuration.


### 3.2.3 Functional Requirements
The functional requirements describe the specific actions and features the system should support to meet user needs.

I. Donor Management
• Registered users can apply to become verified donors by submitting a donor application form with required health and contact details.
• Users can view the status of their donor application (pending, approved, rejected) and see rejection reasons if applicable.
• Only verified donors can access the full donor list and related features.
• Admins can view, approve, or reject donor applications, manage verified donors, and see donor statistics in a dedicated donor management panel.
• Admins can edit donor information and filter/search donors by blood type or city.

II. User Management
• Users can register an account, log in, and update their profile details (personal, contact, health info).
• Admins can view user details, ban users, and manage user accounts.

III. Blood Request Management
• Registered users can submit blood requests specifying patient details, blood type, urgency, and hospital.
• Users can view and track the status of their blood requests (pending, approved, fulfilled, rejected).
• Admins can view all blood requests and update their status.
• Public dashboard displays all verified blood requests for transparency.

IV. Hospital and Organization Management
• Admins can add, edit (full form), and delete hospitals and organizations.
• Admins can approve or reject new hospital/organization registrations.
• Hospitals and organizations can manage their own inventory and pricing after approval.

V. Blood Inventory and Pricing Management
• Admins can update blood stock and prices for all hospitals and organizations.
• Real-time updates and low stock alerts are provided for inventory management.

VI. Blood Purchase and Payment
• Registered users can search, compare, and purchase blood units from hospitals or organizations.
• The system provides a full pricing breakdown, expiry date, and order tracking for each purchase.
• Payment is processed securely via SSLCommerz, with digital receipt (PDF) generation.
• Users can view their purchase history and shipping status.
• Admins can update purchase status (Pending, Verified, Confirm, Ready, Complete, Cancelled), which is reflected in the user panel.

VII. Price Comparison
• All users can compare blood prices by blood type and filter by organization or hospital.
• Users can view available sources and initiate purchases directly from the comparison page.

VIII. Admin Dashboard and To-Do Management
• Admins have access to a dashboard with statistics, analytics, and management tools for users, donors, requests, purchases, hospitals, and organizations.
• Admins can maintain a personal to-do list to track and remind pending administrative tasks.

IX. Public Information Pages
• Unregistered users can browse hospital and organization directories, view public blood requests, and access educational content about blood donation and the process.

X. Data Seeding and Demo Content
• The system supports demo data and seeding scripts for development and testing purposes.

### 3.2.4 Use Case Diagram of the System

The BloodBridge-Foundation system involves two main user roles: Customers and Admins, each with distinct access and functionalities. The use case diagram illustrates the interaction of these users with various system features, focusing on actions like registering, logging in, browsing blood inventory, placing blood orders, managing shipping addresses, and administering the platform. Customers have access to all blood procurement and donation-related functions, while Admins have comprehensive control over the platform, from blood inventory and donor management to user and order oversight. This diagram highlights the clear delineation between the responsibilities of customers and admins, ensuring the platform operates smoothly and securely.

Customers can register for a new account and log in to access the platform. They can browse and search available blood products, view detailed blood information, and compare prices by blood type and organization. Customers can view blood details, manage their shipping addresses, select their preferred payment methods, and place blood orders. They can track order status in real-time, process payments securely through the payment gateway, and view their order history. Customers can also apply to become verified donors by submitting a donor application form, view the status of their application, and access donor-related features if approved. Customers can manage their profiles, update personal and health information, and log out at any time.

The Admin has full control over the system. Admins are responsible for managing the blood inventory, including updating stock levels and managing hospitals and organizations. They can manage user accounts, adjust roles or permissions, and ban users as needed. Admins view and manage donor applications, approve or reject applications, and oversee verified donors. Admins monitor the entire order and request lifecycle, from creation to fulfillment, and can update the status of each order and blood request. The admin also has access to reports and dashboards that display sales data, inventory performance, request statistics, and user behavior. Admins can log out of the system at any time. The Use Case Diagram of the System is shown below on Figure 3.1.

### 3.2.5 Non-Functional Requirements
These requirements ensure the system operates reliably and efficiently:

I. Performance and Scalability
• Key pages load within 2-3 seconds; supports 500+ concurrent users; scalable database and stateless sessions.

II. Security
• Passwords hashed with bcrypt; JWT tokens with strong secrets; HTTPS enforced; input validation; PCI DSS for payments; RBAC; session timeouts; ban enforcement.

III. Reliability and Availability
• 99.5% uptime; error logging; daily database backups; atomic transactions; graceful error handling.

IV. Usability and Accessibility
• Intuitive, responsive UI; accessible on all devices; meets WCAG 2.1 AA standards (keyboard navigation, semantic HTML, color contrast).
********