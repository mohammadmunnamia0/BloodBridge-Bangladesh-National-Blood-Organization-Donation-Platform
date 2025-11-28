import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboardMain = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [stats, setStats] = useState({
    totalDonors: 0,
    pendingRequests: 0,
    bloodUnitsAvailable: 0,
    recentPurchases: 0,
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

    // Load todos from localStorage
    const storedTodos = localStorage.getItem("adminTodos");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    } else {
      // Default todos
      const defaultTodos = [
        {
          id: 1,
          text: "Review pending blood purchase requests",
          completed: false,
          priority: "high",
          category: "Purchases",
        },
        {
          id: 2,
          text: "Update blood inventory levels",
          completed: false,
          priority: "medium",
          category: "Inventory",
        },
        {
          id: 3,
          text: "Contact donors for upcoming blood drive",
          completed: false,
          priority: "medium",
          category: "Donors",
        },
        {
          id: 4,
          text: "Generate monthly analytics report",
          completed: false,
          priority: "low",
          category: "Reports",
        },
      ];
      setTodos(defaultTodos);
      localStorage.setItem("adminTodos", JSON.stringify(defaultTodos));
    }

    // Simulate loading stats
    setStats({
      totalDonors: 1247,
      pendingRequests: 23,
      bloodUnitsAvailable: 456,
      recentPurchases: 89,
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUser");
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
    localStorage.setItem("adminTodos", JSON.stringify(updatedTodos));
    setNewTodo("");
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem("adminTodos", JSON.stringify(updatedTodos));
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem("adminTodos", JSON.stringify(updatedTodos));
  };

  const updatePriority = (id, priority) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, priority } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem("adminTodos", JSON.stringify(updatedTodos));
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

  const adminTasks = [
    {
      title: "Manage Blood Requests",
      description: "Review and approve pending blood requests from patients",
      icon: "📋",
      link: "/blood-requests",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Manage Donors",
      description: "View and manage registered blood donors",
      icon: "👥",
      link: "/register-donor",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Blood Inventory",
      description: "Monitor and update blood stock levels",
      icon: "🩸",
      link: "/admin/inventory",
      color: "from-red-500 to-red-600",
    },
    {
      title: "Purchase Management",
      description: "Track and manage blood purchases",
      icon: "💰",
      link: "/purchase-dashboard",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Analytics & Reports",
      description: "View statistics and generate reports",
      icon: "📊",
      link: "/admin/analytics",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Price Management",
      description: "Update blood pricing and fees",
      icon: "💵",
      link: "/price-comparison",
      color: "from-orange-500 to-orange-600",
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Tasks</h2>
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
                  <p className="text-sm text-gray-600">{task.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Todo List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin To-Do List</h2>

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
      </div>
    </div>
  );
};

export default AdminDashboardMain;
