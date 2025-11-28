import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import PendingOrganizations from "../Components/PendingOrganizations";
import PendingHospitals from "../Components/PendingHospitals";

const UnifiedAdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const storedAdminUser = localStorage.getItem("adminUser");

    if (!isAdminLoggedIn || !storedAdminUser) {
      navigate("/admin");
      return;
    }

    const admin = JSON.parse(storedAdminUser);
    setAdminUser(admin);

    // Load todos from localStorage
    const storedTodos = localStorage.getItem(`adminTodos_${admin.username}`);
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      // Default todos based on role
      const defaultTodos = getDefaultTodosByRole(admin.role);
      setTodos(defaultTodos);
      localStorage.setItem(`adminTodos_${admin.username}`, JSON.stringify(defaultTodos));
    }

    // Load stats from API
    loadStatsFromAPI(admin.token);
  }, [navigate]);

  const getDefaultTodosByRole = (role) => {
    const commonTodos = {
      super_admin: [
        { id: 1, text: "Review all pending blood purchase requests", completed: false, priority: "high", category: "Purchases" },
        { id: 2, text: "Manage organization and hospital admins", completed: false, priority: "high", category: "Admin Management" },
        { id: 3, text: "Update global blood pricing", completed: false, priority: "medium", category: "Pricing" },
        { id: 4, text: "Review platform-wide analytics", completed: false, priority: "medium", category: "Analytics" },
        { id: 5, text: "Create new organization entry", completed: false, priority: "low", category: "Organizations" },
      ],
      org_admin: [
        { id: 1, text: "Approve pending orders for my organization", completed: false, priority: "high", category: "Orders" },
        { id: 2, text: "Update organization blood inventory", completed: false, priority: "high", category: "Inventory" },
        { id: 3, text: "Update shipping status for processed orders", completed: false, priority: "medium", category: "Shipping" },
        { id: 4, text: "Review organization customer feedback", completed: false, priority: "low", category: "Customers" },
      ],
      hospital_admin: [
        { id: 1, text: "Confirm blood requests for hospital", completed: false, priority: "high", category: "Requests" },
        { id: 2, text: "Update hospital blood stock levels", completed: false, priority: "high", category: "Inventory" },
        { id: 3, text: "Process delivery for confirmed orders", completed: false, priority: "medium", category: "Delivery" },
        { id: 4, text: "Update hospital contact information", completed: false, priority: "low", category: "Hospital Info" },
      ]
    };
    return commonTodos[role] || [];
  };

  const loadStatsFromAPI = async (token) => {
    try {
      const response = await axios.get("/api/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load stats:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      priority: "medium",
      category: "General",
      createdAt: new Date().toISOString(),
    };

    const updatedTodos = [...todos, todo];
    setTodos(updatedTodos);
    localStorage.setItem(`adminTodos_${adminUser.username}`, JSON.stringify(updatedTodos));
    setNewTodo("");
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem(`adminTodos_${adminUser.username}`, JSON.stringify(updatedTodos));
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem(`adminTodos_${adminUser.username}`, JSON.stringify(updatedTodos));
  };

  const updatePriority = (id, priority) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, priority } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem(`adminTodos_${adminUser.username}`, JSON.stringify(updatedTodos));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "org_admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "hospital_admin":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "org_admin":
        return "Organization Admin";
      case "hospital_admin":
        return "Hospital Admin";
      default:
        return "Admin";
    }
  };

  const getTaskMenuByRole = (role) => {
    const superAdminTasks = [
      { title: "Manage All Blood Requests", icon: "📋", link: "/blood-requests", color: "from-blue-500 to-blue-600" },
      { title: "Manage Organizations", icon: "🏢", link: "/admin/organizations", color: "from-indigo-500 to-indigo-600" },
      { title: "Manage Hospitals", icon: "🏥", link: "/admin/hospitals", color: "from-green-500 to-green-600" },
      { title: "Manage Admins", icon: "👥", link: "/admin/admins", color: "from-purple-500 to-purple-600" },
      { title: "Global Pricing", icon: "💵", link: "/admin/pricing", color: "from-orange-500 to-orange-600" },
      { title: "All Orders", icon: "📦", link: "/admin/orders", color: "from-red-500 to-red-600" },
      { title: "Platform Analytics", icon: "📊", link: "/admin/analytics", color: "from-pink-500 to-pink-600" },
      { title: "Override Management", icon: "🔧", link: "/admin/override", color: "from-yellow-500 to-yellow-600" },
    ];

    const orgAdminTasks = [
      { title: "My Organization Orders", icon: "📦", link: "/admin/org-orders", color: "from-blue-500 to-blue-600" },
      { title: "Approve/Reject Orders", icon: "✅", link: "/admin/approve-orders", color: "from-green-500 to-green-600" },
      { title: "Update Shipping Status", icon: "🚚", link: "/admin/shipping", color: "from-purple-500 to-purple-600" },
      { title: "Organization Inventory", icon: "🩸", link: "/admin/org-inventory", color: "from-red-500 to-red-600" },
      { title: "Edit Organization Info", icon: "✏️", link: "/admin/org-info", color: "from-indigo-500 to-indigo-600" },
      { title: "Customer History", icon: "👥", link: "/admin/customers", color: "from-orange-500 to-orange-600" },
    ];

    const hospitalAdminTasks = [
      { title: "Hospital Orders", icon: "📦", link: "/admin/hospital-orders", color: "from-blue-500 to-blue-600" },
      { title: "Confirm/Reject Orders", icon: "✅", link: "/admin/confirm-orders", color: "from-green-500 to-green-600" },
      { title: "Delivery Management", icon: "🚚", link: "/admin/delivery", color: "from-purple-500 to-purple-600" },
      { title: "Hospital Blood Stock", icon: "🩸", link: "/admin/hospital-inventory", color: "from-red-500 to-red-600" },
      { title: "Edit Hospital Details", icon: "✏️", link: "/admin/hospital-info", color: "from-indigo-500 to-indigo-600" },
      { title: "Order History", icon: "📋", link: "/admin/order-history", color: "from-orange-500 to-orange-600" },
    ];

    switch (role) {
      case "super_admin":
        return superAdminTasks;
      case "org_admin":
        return orgAdminTasks;
      case "hospital_admin":
        return hospitalAdminTasks;
      default:
        return [];
    }
  };

  const renderStats = () => {
    if (adminUser.role === "super_admin") {
      return (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalOrganizations}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hospitals</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalHospitals}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Admins</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </>
      );
    } else if (adminUser.role === "org_admin") {
      return (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Organization Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.organizationOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
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
                <p className="text-sm text-gray-600 mb-1">Completed Orders</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">{stats.monthlyRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </>
      );
    } else if (adminUser.role === "hospital_admin") {
      return (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hospital Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.hospitalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
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
                <p className="text-sm text-gray-600 mb-1">Blood Units Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.bloodUnitsStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🩸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Deliveries</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">{stats.monthlyRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const adminTasks = getTaskMenuByRole(adminUser.role);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {getRoleLabel(adminUser.role)} Dashboard
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(adminUser.role)}`}>
                  {getRoleLabel(adminUser.role)}
                </span>
              </div>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold">{adminUser.name}</span>
              </p>
              {(adminUser.organizationName || adminUser.hospitalName) && (
                <p className="text-sm text-gray-500 mt-1">
                  Managing: <span className="font-medium text-gray-700">{adminUser.organizationName || adminUser.hospitalName}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {renderStats()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminTasks.map((task, index) => (
                <button
                  key={index}
                  onClick={() => navigate(task.link)}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 text-left group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${task.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{task.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {task.title}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          {/* Todo List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">To-Do List</h2>

              {/* Add Todo */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTodo}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Todo Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todos.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No tasks yet</p>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`border rounded-lg p-3 ${
                        todo.completed ? "bg-gray-50 opacity-60" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <select
                              value={todo.priority}
                              onChange={(e) => updatePriority(todo.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border ${getPriorityColor(
                                todo.priority
                              )}`}
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                            <span className="text-xs text-gray-500">
                              {todo.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Todo Stats */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Completed: {todos.filter((t) => t.completed).length}
                  </span>
                  <span>
                    Pending: {todos.filter((t) => !t.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Organizations Section (Super Admin Only) */}
        {adminUser.role === "super_admin" && (
          <div className="mt-8">
            <PendingOrganizations />
          </div>
        )}

        {/* Pending Hospitals Section (Super Admin Only) */}
        {adminUser.role === "super_admin" && (
          <div className="mt-8">
            <PendingHospitals />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedAdminDashboard;
