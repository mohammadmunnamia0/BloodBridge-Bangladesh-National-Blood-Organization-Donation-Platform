import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

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

    if (!isAdminLoggedIn || isAdminLoggedIn !== "true" || !storedAdminUser) {
      console.log("Admin not logged in, redirecting...");
      navigate("/admin");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error parsing admin user data:", error);
      navigate("/admin");
    }
  }, [navigate]);

  const getDefaultTodosByRole = (role) => {
    const defaultTodos = [
      { id: 1, text: "Review pending blood purchase requests", completed: false, priority: "high", category: "Purchases" },
      { id: 2, text: "Check and update blood inventory levels", completed: false, priority: "high", category: "Inventory" },
      { id: 3, text: "Review new blood donation requests", completed: false, priority: "medium", category: "Requests" },
      { id: 4, text: "Analyze platform analytics and trends", completed: false, priority: "medium", category: "Analytics" },
      { id: 5, text: "Update blood pricing if needed", completed: false, priority: "low", category: "Pricing" },
    ];
    return defaultTodos;
  };

  const loadStatsFromAPI = async (token) => {
    try {
      const response = await axios.get("/admin/dashboard/stats", {
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
      { title: "Manage Users", icon: "👤", link: "/admin/users", color: "from-indigo-500 to-indigo-600" },
      { title: "Manage Blood Requests", icon: "📋", link: "/admin/blood-requests", color: "from-blue-500 to-blue-600" },
      { title: "Manage Purchases", icon: "📦", link: "/admin/purchases", color: "from-red-500 to-red-600" },
      { title: "Donor Management", icon: "👥", link: "/admin/donor-management", color: "from-green-500 to-green-600" },
      { title: "Manage Hospitals", icon: "🏥", link: "/admin/hospitals", color: "from-cyan-500 to-cyan-600" },
      { title: "Manage Organizations", icon: "🏢", link: "/admin/organizations", color: "from-teal-500 to-teal-600" },
      { title: "Manage Inventory", icon: "🩸", link: "/admin/inventory", color: "from-purple-500 to-purple-600" },
    ];

    return superAdminTasks;
  };

  const renderStats = () => {
    return (
      <>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
              <p className="text-xs text-green-600 mt-0.5">+{stats.recentUsers || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">👥</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Verified Donors</p>
              <p className="text-2xl font-bold text-green-600">{stats.verifiedDonors || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Approved</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center ring-2 ring-green-500">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>
      </>
    );
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-100 text-purple-800 border-purple-300">
                  Administrator
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">{adminUser.name || adminUser.username}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminTasks.map((task, index) => (
                <button
                  key={index}
                  onClick={() => navigate(task.link)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 text-left group min-h-32 flex flex-col justify-center"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${task.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{task.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {task.title}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards & Todo List */}
          <div className="lg:col-span-1 flex flex-col">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {loading ? (
                <div className="col-span-2 text-center py-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : (
                renderStats()
              )}
            </div>

            {/* Todo List */}
            <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-3">To-Do List</h2>

              {/* Add Todo */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Add a new task..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={addTodo}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Todo Items */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {todos.length === 0 ? (
                  <p className="text-center text-gray-500 py-3 text-xs">No tasks yet</p>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`border rounded-lg p-2 text-xs ${
                        todo.completed ? "bg-gray-50 opacity-60" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="mt-0.5 w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.text}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <select
                              value={todo.priority}
                              onChange={(e) => updatePriority(todo.id, e.target.value)}
                              className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(
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
                          className="text-red-600 hover:text-red-700 flex-shrink-0"
                        >
                          <svg
                            className="w-4 h-4"
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
      </div>
    </div>
  );
};

export default UnifiedAdminDashboard;
