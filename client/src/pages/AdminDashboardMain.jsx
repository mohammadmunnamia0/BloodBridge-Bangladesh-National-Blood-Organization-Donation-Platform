import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminDashboardMain = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalDonors: 0,
    pendingRequests: 0,
    bloodUnitsAvailable: 0,
    recentPurchases: 0,
  });
  const [notifications, setNotifications] = useState({
    newRequests: 0,
    newDonors: 0,
    newPurchases: 0,
    newUsers: 0,
  });

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const storedAdminUser = localStorage.getItem("adminUser");

    if (!isAdminLoggedIn || !storedAdminUser) {
      navigate("/admin");
      return;
    }

    setAdminUser(JSON.parse(storedAdminUser));
    fetchNotifications();

    // Simulate loading stats
    setStats({
      totalDonors: 1247,
      pendingRequests: 23,
      bloodUnitsAvailable: 456,
      recentPurchases: 89,
    });
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      
      // Fetch new items counts
      const [requestsRes, donorsRes, purchasesRes] = await Promise.all([
        axios.get("/api/admin/blood-requests?status=pending", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get("/api/admin/donors?page=1&limit=100", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get("/api/admin/blood-purchases?status=pending", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      // Calculate new items since last login
      const lastLogin = localStorage.getItem("adminLastLogin") || new Date().toISOString();
      const lastLoginDate = new Date(lastLogin);

      const newRequests = requestsRes.data.requests?.filter(
        (r) => new Date(r.createdAt) > lastLoginDate
      ).length || 0;

      const newDonors = donorsRes.data.donors?.filter(
        (d) => !d.isDemoUser && new Date(d.createdAt) > lastLoginDate
      ).length || 0;

      const newPurchases = purchasesRes.data.purchases?.filter(
        (p) => new Date(p.createdAt) > lastLoginDate
      ).length || 0;

      setNotifications({
        newRequests,
        newDonors,
        newPurchases,
        newUsers: newDonors, // Same as new donors
      });

      // Update last login time
      localStorage.setItem("adminLastLogin", new Date().toISOString());
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLastLogin");
    navigate("/admin");
  };

  const adminTasks = [
    {
      title: "Manage Blood Requests",
      description: "Review and approve pending blood requests from patients",
      icon: "📋",
      link: "/blood-requests",
      color: "from-blue-500 to-blue-600",
      hasNew: notifications.newRequests > 0,
      newCount: notifications.newRequests,
    },
    {
      title: "Manage Donors",
      description: "View and manage registered blood donors",
      icon: "👥",
      link: "/admin/donors",
      color: "from-green-500 to-green-600",
      hasNew: notifications.newDonors > 0,
      newCount: notifications.newDonors,
    },
    {
      title: "Blood Inventory",
      description: "Monitor and update blood stock levels",
      icon: "🩸",
      link: "/admin/inventory",
      color: "from-red-500 to-red-600",
      hasNew: false,
    },
    {
      title: "Purchase Management",
      description: "Track and manage blood purchases",
      icon: "💰",
      link: "/admin/purchases",
      color: "from-purple-500 to-purple-600",
      hasNew: notifications.newPurchases > 0,
      newCount: notifications.newPurchases,
    },
    {
      title: "Hospitals",
      description: "Manage hospital accounts and details",
      icon: "🏥",
      link: "/admin/hospitals",
      color: "from-teal-500 to-teal-600",
      hasNew: false,
    },
    {
      title: "Organizations",
      description: "Manage blood donation organizations",
      icon: "🏢",
      link: "/admin/organizations",
      color: "from-cyan-500 to-cyan-600",
      hasNew: false,
    },
    {
      title: "Analytics & Reports",
      description: "View statistics and generate reports",
      icon: "📊",
      link: "/admin/analytics",
      color: "from-indigo-500 to-indigo-600",
      hasNew: false,
    },
    {
      title: "Price Management",
      description: "Update blood pricing and fees",
      icon: "💵",
      link: "/admin/pricing",
      color: "from-orange-500 to-orange-600",
      hasNew: false,
    },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold">{adminUser.name}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDonors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Blood Units Available</p>
                <p className="text-3xl font-bold text-red-600">{stats.bloodUnitsAvailable}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🩸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Purchases</p>
                <p className="text-3xl font-bold text-blue-600">{stats.recentPurchases}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tasks Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminTasks.map((task, index) => (
              <button
                key={index}
                onClick={() => navigate(task.link)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 text-left group relative"
              >
                {/* Notification Dot */}
                {task.hasNew && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    {task.newCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {task.newCount}
                      </span>
                    )}
                  </div>
                )}
                
                <div className={`w-12 h-12 bg-gradient-to-r ${task.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{task.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600">{task.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
