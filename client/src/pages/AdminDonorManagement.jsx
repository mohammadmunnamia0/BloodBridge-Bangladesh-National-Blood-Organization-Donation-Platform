import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminDonorManagement = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [donorRequests, setDonorRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [verifiedDonors, setVerifiedDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ bloodType: "all", city: "all" });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [stats, setStats] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchDonorStats();
    fetchContent();
  }, [navigate, activeTab, filter, pagination.page]);

  const fetchDonorStats = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get("/admin/donors/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching donor stats:", error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      params.append("page", pagination.page);
      params.append("limit", "10");
      if (filter.bloodType !== "all") params.append("bloodType", filter.bloodType);
      if (filter.city !== "all") params.append("city", filter.city);

      if (activeTab === "requests") {
        params.append("status", "pending");
        console.log("🔍 Fetching donor requests...", `/admin/donors/requests?${params.toString()}`);
        const response = await axios.get(`/admin/donors/requests?${params.toString()}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        console.log("✅ Donor requests response:", response.data);
        setDonorRequests(response.data.applications || []);
        setPagination(response.data.pagination || { page: 1, total: 0, pages: 0 });
      } else if (activeTab === "users") {
        const response = await axios.get(`/admin/donors/users?${params.toString()}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setAllUsers(response.data.users || []);
        setPagination(response.data.pagination || { page: 1, total: 0, pages: 0 });
      } else if (activeTab === "verified") {
        const response = await axios.get(`/admin/donors/verified?${params.toString()}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setVerifiedDonors(response.data.donors || []);
        setPagination(response.data.pagination || { page: 1, total: 0, pages: 0 });
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching content:", error.response?.data || error.message);
      console.error("Full error:", error);
      setLoading(false);
    }
  };

  const handleApproveDonor = async (applicationId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `/admin/donors/requests/${applicationId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      alert(response.data.message);
      fetchContent();
      fetchDonorStats();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving application");
    }
  };

  const handleRejectClick = (application) => {
    setSelectedApplication(application);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectDonor = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `/admin/donors/requests/${selectedApplication._id}/reject`,
        { rejectionReason },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      alert(response.data.message);
      setShowRejectModal(false);
      setSelectedApplication(null);
      setRejectionReason("");
      fetchContent();
      fetchDonorStats();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting application");
    }
  };

  const handleBlockDonor = async (donorId, isCurrentlyBanned) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${isCurrentlyBanned ? "unblock" : "block"} this donor?`
    );
    if (!confirmAction) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `/admin/donors/${donorId}/block`,
        {
          isBanned: !isCurrentlyBanned,
          banReason: !isCurrentlyBanned ? "Admin decision" : null,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      alert(response.data.message);
      fetchContent();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating donor status");
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !stats) {
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
            <h1 className="text-3xl font-bold text-gray-800">Donor Management</h1>
            <p className="text-gray-600 mt-2">Manage donors and donor applications</p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">Verified Donors</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalDonors}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">Pending Applications</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApplications}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedApplications}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium">Rejected</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejectedApplications}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px flex-wrap">
              <button
                onClick={() => {
                  setActiveTab("requests");
                  setPagination({ page: 1, total: 0, pages: 0 });
                }}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === "requests"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Donor Requests
                {stats && stats.pendingApplications > 0 && (
                  <span className="ml-2 inline-block bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                    {stats.pendingApplications}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("users");
                  setPagination({ page: 1, total: 0, pages: 0 });
                }}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === "users"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Manage Donors
              </button>
              <button
                onClick={() => {
                  setActiveTab("verified");
                  setPagination({ page: 1, total: 0, pages: 0 });
                }}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === "verified"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Verified Donors
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Donor Requests Tab */}
            {activeTab === "requests" && (
              <div>
                {donorRequests.length > 0 ? (
                  <div className="space-y-4">
                    {donorRequests.map((application) => (
                      <div key={application._id} className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-yellow-500 to-yellow-700">
                              {application.bloodType || "📋"}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {application.fullName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                📋 Pending Application | Applied:{" "}
                                {formatDate(application.appliedAt)}
                              </p>
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mt-2 inline-block">
                                ⏳ Awaiting Review
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-col">
                            <button
                              onClick={() => handleApproveDonor(application._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(application)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-800 break-all">{application.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-800">{application.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Blood Type</p>
                            <p className="font-medium text-red-600 text-lg">{application.bloodType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Age</p>
                            <p className="font-medium text-gray-800">{application.age} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium text-gray-800">{application.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">City</p>
                            <p className="font-medium text-gray-800">{application.city}, {application.state}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Zip Code</p>
                            <p className="font-medium text-gray-800">{application.zipCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium text-gray-800">{application.gender}</p>
                          </div>
                          <div className="lg:col-span-2">
                            <p className="text-sm text-gray-600">Medical Conditions</p>
                            <p className="font-medium text-gray-800">{application.medicalConditions || "None reported"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Last Blood Donation</p>
                            <p className="font-medium text-gray-800">
                              {application.lastBloodDonationDate 
                                ? formatDate(application.lastBloodDonationDate)
                                : "Never donated"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No pending donor applications</p>
                )}
              </div>
            )}

            {/* Manage Users Tab */}
            {activeTab === "users" && (
              <div>
                {allUsers.length > 0 ? (
                  <div className="space-y-4">
                    {allUsers.map((user) => (
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
                                  : "bg-gradient-to-br from-blue-500 to-blue-700"
                              }`}
                            >
                              {user.bloodType || "👤"}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
                              <p className="text-sm text-gray-600">
                                👥 Joined:{" "}
                                {formatDate(user.createdAt)}
                              </p>
                              <div className="mt-2 flex gap-2 flex-wrap">
                                {user.isDonor && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                    ✓ Verified Donor
                                  </span>
                                )}
                                {!user.isDonor && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                                    Regular User
                                  </span>
                                )}
                                {user.isBanned && (
                                  <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                                    🚫 BANNED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-800 break-all">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-800">{user.phone || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Blood Type</p>
                            <p className="font-medium text-red-600 text-lg">{user.bloodType || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium text-gray-800">{user.city}, {user.state}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No users found</p>
                )}
              </div>
            )}

            {/* Verified Donors Tab */}
            {activeTab === "verified" && (
              <div>
                {verifiedDonors.length > 0 ? (
                  <div className="space-y-4">
                    {verifiedDonors.map((donor) => (
                      <div
                        key={donor._id}
                        className={`bg-white rounded-lg shadow-md p-6 ${
                          donor.isBanned ? "border-2 border-red-300 bg-red-50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                                donor.isBanned
                                  ? "bg-gray-400"
                                  : "bg-gradient-to-br from-red-500 to-red-700"
                              }`}
                            >
                              {donor.bloodType || "🩸"}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{donor.fullName}</h3>
                              <p className="text-sm text-gray-600">
                                🩸 Verified Donor | Joined:{" "}
                                {formatDate(donor.createdAt)}
                              </p>
                              {donor.isBanned && (
                                <div className="mt-2">
                                  <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                                    🚫 BANNED
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-800">{donor.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-800">{donor.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Blood Type</p>
                            <p className="font-medium text-red-600 text-lg">{donor.bloodType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Age</p>
                            <p className="font-medium text-gray-800">{calculateAge(donor.dateOfBirth)} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">City</p>
                            <p className="font-medium text-gray-800">{donor.city}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Last Donation</p>
                            <p className="font-medium text-gray-800">
                              {donor.lastDonation ? formatDate(donor.lastDonation) : "Never"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Weight (kg)</p>
                            <p className="font-medium text-gray-800">{donor.weight || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className={`font-medium ${donor.isBanned ? "text-red-600" : "text-green-600"}`}>
                              {donor.isBanned ? "Banned" : "Active"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No verified donors found</p>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.max(1, pagination.page - 1),
                    })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-3 py-2 rounded-lg transition ${
                      pagination.page === page
                        ? "bg-red-600 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.min(pagination.pages, pagination.page + 1),
                    })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reject Application</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to reject the application from{" "}
                <span className="font-semibold">{selectedApplication.fullName}</span>?
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (required)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows="4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRejectDonor}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonorManagement;
