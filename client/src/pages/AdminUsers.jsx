import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: "all", status: "all" });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchUsers();
  }, [navigate, filter, pagination.page]);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      params.append("page", pagination.page);
      if (filter.role !== "all") params.append("role", filter.role);
      if (filter.status !== "all") params.append("status", filter.status);

      const response = await axios.get(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setBanReason("");
    setShowBanModal(true);
  };

  const handleBanSubmit = async (isBanned) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.patch(
        `/api/admin/users/${selectedUser._id}/ban`,
        { isBanned, banReason: isBanned ? banReason : null },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setShowBanModal(false);
      fetchUsers();
      alert(isBanned ? "User banned successfully!" : "User unbanned successfully!");
    } catch (error) {
      console.error("Error updating user ban status:", error);
      alert("Failed to update user status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Users</h1>
            <p className="text-gray-600 mt-2">View and manage all platform users</p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">{pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Donors</p>
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.role === "donor").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => !u.isBanned).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Banned Users</p>
            <p className="text-2xl font-bold text-orange-600">
              {users.filter((u) => u.isBanned).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filter.role}
                onChange={(e) => {
                  setFilter({ ...filter, role: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Roles</option>
                <option value="donor">Donors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => {
                  setFilter({ ...filter, status: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No users found with the selected filters.</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  user.isBanned ? "border-2 border-red-300 bg-red-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                        user.isBanned
                          ? "bg-gray-400"
                          : user.role === "admin"
                          ? "bg-gradient-to-br from-purple-500 to-purple-700"
                          : "bg-gradient-to-br from-red-500 to-red-700"
                      }`}
                    >
                      {user.bloodType || "👤"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        {user.role === "admin" ? "🔐 Admin" : "🩸 Donor"} | Joined:{" "}
                        {formatDate(user.createdAt)}
                      </p>
                      {user.isBanned && (
                        <div className="mt-2">
                          <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                            🚫 BANNED
                          </span>
                          {user.bannedAt && (
                            <span className="text-xs text-red-600 ml-2">
                              on {formatDate(user.bannedAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleBanClick(user)}
                        className={`px-4 py-2 rounded-lg transition ${
                          user.isBanned
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {user.isBanned ? "Unban User" : "Ban User"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">{user.phone}</p>
                  </div>
                  {user.bloodType && (
                    <div>
                      <p className="text-sm text-gray-600">Blood Type</p>
                      <p className="font-medium text-red-600">{user.bloodType}</p>
                    </div>
                  )}
                  {user.city && (
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-800">
                        {user.city}, {user.state}
                      </p>
                    </div>
                  )}
                </div>

                {user.isBanned && user.banReason && (
                  <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800">Ban Reason:</p>
                    <p className="text-sm text-red-700 mt-1">{user.banReason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedUser.isBanned ? "Unban User" : "Ban User"}
            </h2>

            <div className="mb-4">
              <p className="text-gray-700">
                <strong>User:</strong> {selectedUser.fullName}
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>

            {!selectedUser.isBanned && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Ban *
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows="4"
                  placeholder="Enter the reason for banning this user..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong>{" "}
                {selectedUser.isBanned
                  ? "This will restore the user's access to the platform."
                  : "This will immediately block the user from accessing the platform."}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBanSubmit(!selectedUser.isBanned)}
                disabled={!selectedUser.isBanned && !banReason.trim()}
                className={`px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedUser.isBanned
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {selectedUser.isBanned ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
