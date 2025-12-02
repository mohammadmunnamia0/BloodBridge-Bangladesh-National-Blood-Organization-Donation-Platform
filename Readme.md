# 🩸 BloodBridge Bangladesh National Blood Organization Donation Platform

> **Mission:** A secure and scalable web platform built to support blood donation, help people in emergencies, and build a strong ecosystem around life-saving support.

🌐 **Live Site**: [blood-bridge-foundation.web.app](https://blood-bridge-foundation.vercel.app/)

---

## 🚀 Features at a Glance

- 🔍 Search hospitals by name or location
- 🌐 Discover local & international blood donation organizations
- 🩷 Register as a verified blood donor
- 📝 Submit blood requests (after donor registration)
- 🧑‍🤝‍🧑 **Donor List with Secure Access**
- 🗂️ Public dashboard for all verified blood requests
- 🔐 Secure registration & login with form validation
- ⚠️ Strong validation against fake or spam requests
- 🏥 **Blood Purchase System** - Buy blood units from hospitals with price comparison
- 💳 **Integrated Payment Processing** - Secure payments via SSLCommerz
- 🧾 **Digital Receipt Generation** - Automated PDF receipts for blood purchases
- 👨‍💼 **Admin Dashboard** - Comprehensive admin panel for platform management

---

## 🧠 Feature Breakdown

### 🏥 Hospital Directory

Easily search for hospitals based on name, city, or region.

### 🌐 Organization Listings

Categorized by **Local** and **International** to explore different blood donation organizations.

### 🩷 Become a Donor

Users can join as blood donors by registering with personal and location details.

### 📝 Request Blood

- Only verified donors can submit a blood request.
- Ensures accountability and reduces fake submissions.

### 📢 Public Blood Request Dashboard

- All verified requests are displayed on a dashboard.
- **Anyone** can view these — no login required.

### 🧑‍🤝‍🧑 Donor List

- Publicly lists available donors.
- **Donor details are protected** — only visible to logged-in users.
- Non-registered users see a modal asking them to register first.

> _"You need to be a registered user to view donor details."_

### 💳 Blood Purchase System

- Search and compare blood prices across different hospitals
- View real-time blood availability by blood type
- Secure online payment processing via SSLCommerz
- Automated digital receipt generation (PDF format)
- Track purchase history and transaction details

### 👨‍💼 Admin Dashboard

- **Blood Inventory Management**: Monitor and update blood stock levels across all hospitals
- **Purchase Analytics**: Track blood purchases, revenue, and trends
- **Request Management**: View and manage all blood requests submitted to the platform
- **Pricing Control**: Set and update blood prices per unit for different blood types
- **Platform Analytics**: View overall platform statistics and user activity
- **Secure Access**: Role-based authentication with secure admin credentials

> _Future implementations planned: Organization Admin and Hospital Admin roles for decentralized management_

---

## 🔒 Why These Restrictions?

Without verification, the platform could be misused by spam or fake requests.  
By requiring donor registration for sensitive actions (like requesting blood or viewing donor info), we ensure real, traceable activity that helps those truly in need.

---

## 🔮 Planned Enhancements

### Near-term Features

- ✅ Allow blood requests without registration, with additional identity verification:
  - 🆔 NID number  
  - 📍 Address  
  - 📞 Phone number  
  - 📋 Reason for blood request
- 🔔 Real-time notifications for blood requests
- 📊 Advanced analytics and reporting for donors and requests
- 📱 Mobile app development

### Future Implementations

- 🏢 **Organization Admin Role**: Allow blood donation organizations to manage their own profiles, events, and donor outreach programs
- 🏥 **Hospital Admin Role**: Enable hospitals to independently manage their blood inventory, pricing, and purchase requests
- 🌍 **Multi-language Support**: Expand accessibility with Bengali and other regional languages
- 🤖 **AI-powered Blood Matching**: Intelligent donor-patient matching based on location and blood type availability

---

## 🛠️ Tech Stack

### Frontend

- **React.js** - Modern UI library for building interactive user interfaces
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API requests
- **React Hook Form** - Efficient form handling and validation
- **jsPDF** - Client-side PDF generation for receipts

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security

### Authentication & Security

- **Firebase Auth** - User authentication and authorization
- **JWT Tokens** - Secure session management with separate admin/user tokens
- **bcryptjs** - Password encryption
- **Form Validation** - Multiple layers of input validation

### Payment Integration

- **SSLCommerz** - Bangladeshi payment gateway for secure transactions

### Deployment

- **Firebase Hosting** - Frontend hosting
- **Vercel** - Backend API deployment
- **MongoDB Atlas** - Cloud database hosting


## 🤝 Contributing

Contributions, suggestions, and feedback are always welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/yourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/yourFeature`
5. Open a pull request

---

## 📬 Contact

Feel free to reach out for feedback, collaboration, or technical discussions!

- **Developer**: Md Munna Mia  
- **LinkedIn**: [linkedin.com/in/mdmunnamia](https://www.linkedin.com/in/md-munna-mia-340225219/)  
- **Email**: <mohammadmunnamia0@gmail.com>

---

> _“Saving one life is as if saving all of humanity.”_  
> Let’s build technology that truly helps people.

