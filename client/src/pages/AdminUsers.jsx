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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
      
      // Map filter role values to backend expectations
      if (filter.role === "donor") {
        params.append("isDonor", "true");
      } else if (filter.role === "user") {
        params.append("isDonor", "false");
      }
      // If "all", don't append any role filter

      console.log("Fetching users with params:", params.toString());
      const response = await axios.get(`/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      console.log("Users response:", response.data);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || { page: 1, total: 0, pages: 0 });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
      setUsers([]);
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
        `/admin/users/${selectedUser._id}/ban`,
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
              {users.filter((u) => u.isDonor === true).length}
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
                <option value="all">All Users</option>
                <option value="user">Regular Users</option>
                <option value="donor">Donors</option>
              </select>
            </div>
            {/* Status filter hidden */}
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
                        {user.role === "admin" 
                          ? "🔐 Admin" 
                          : user.isDonor === true 
                          ? "🩸 Donor" 
                          : "👤 User"} | Joined:{" "}
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
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailsModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                    {/* Ban functionality hidden - ban feature disabled */}
                    {/* {user.role !== "admin" && (
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
                    )} */}
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

      {/* Ban Modal - Hidden */}
      {/* {showBanModal && selectedUser && (
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
      )} */}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl">
                    {selectedUser.bloodType || "👤"}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedUser.fullName}</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedUser.role === "admin" 
                        ? "🔐 Admin" 
                        : selectedUser.isDonor === true 
                        ? "🩸 Donor" 
                        : "👤 User"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Account Status */}
              <div className={`rounded-lg p-4 mb-6 ${selectedUser.isBanned ? "bg-red-50 border border-red-300" : "bg-green-50 border border-green-300"}`}>
                <p className="text-sm font-medium text-gray-700">Account Status</p>
                <p className={`text-lg font-bold ${selectedUser.isBanned ? "text-red-600" : "text-green-600"}`}>
                  {selectedUser.isBanned ? "🚫 BANNED" : "✓ ACTIVE"}
                </p>
                {selectedUser.isBanned && selectedUser.banReason && (
                  <p className="text-sm text-red-700 mt-2"><strong>Ban Reason:</strong> {selectedUser.banReason}</p>
                )}
              </div>

              {/* Personal Information */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">👤 Personal Information</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Email</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Phone</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Date of Birth</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">
                    {selectedUser.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Gender</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.gender || "N/A"}</p>
                </div>
              </div>

              {/* Address Information */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">📍 Address</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Street Address</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.address || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">City</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.city || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">State</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.state || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Zip Code</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.zipCode || "N/A"}</p>
                </div>
              </div>

              {/* Health Information */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">🩸 Health Information</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Blood Type</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{selectedUser.bloodType || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Weight (kg)</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.weight || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Medical Conditions</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedUser.medicalConditions || "None"}</p>
                </div>
              </div>

              {/* Account Information */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">🔐 Account Information</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Role</p>
                  <p className="text-lg font-medium text-gray-800 mt-1 capitalize">{selectedUser.role || "User"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Donor Status</p>
                  <p className={`text-lg font-bold mt-1 ${selectedUser.isDonor ? "text-green-600" : "text-gray-600"}`}>
                    {selectedUser.isDonor ? "✓ Verified Donor" : "Not a Donor"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">Account Created</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">User ID</p>
                  <p className="text-sm font-mono text-gray-800 mt-1 break-all">{selectedUser._id}</p>
                </div>
              </div>

              {/* Password Section - Highlighted */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-red-600 pb-2">🔑 Password (Hashed)</h3>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔐</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-3">Hashed Password Hash:</p>
                    <div className="bg-white border border-red-300 rounded p-4 font-mono text-xs text-gray-700 break-all">
                      {selectedUser.password}
                    </div>
                    <p className="text-xs text-red-700 mt-3 italic">
                      ⚠️ This is the hashed version. The actual password cannot be retrieved.
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Donation (if applicable) */}
              {selectedUser.lastDonation && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-8">
                  <p className="text-xs text-blue-700 uppercase font-semibold">Last Donation</p>
                  <p className="text-lg font-medium text-blue-900 mt-1">{formatDate(selectedUser.lastDonation)}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 border-t p-6 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
