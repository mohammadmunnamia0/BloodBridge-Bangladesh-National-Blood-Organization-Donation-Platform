import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import { generateReceipt } from "../utils/generateReceipt";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodType: "",
    address: "",
  });
  const [activeTab, setActiveTab] = useState("info"); // info, purchases, shipping
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Check if tab is specified in location state
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }

    // Fetch user profile from database
    fetchUserProfile(token);
    fetchPurchases(token);
  }, [navigate, location]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userData = response.data.user;
      setUser(userData);
      setEditForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bloodType: userData.bloodType || "",
        address: userData.address || "",
      });
      
      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  const fetchPurchases = async (token) => {
    try {
      const response = await axios.get("/api/blood-purchases/my-purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle different response structures
      const purchasesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.purchases || []);
      
      setPurchases(purchasesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setPurchases([]); // Set empty array on error
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.patch("/api/auth/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update localStorage with new user data
      const updatedUser = response.data.user || response.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.response || error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
      confirmed: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user?.fullName || "User Profile"}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleEditToggle}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                isEditing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === "info"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab("purchases")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === "purchases"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Purchase History ({purchases.length})
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-300 ${
                  activeTab === "shipping"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Shipping Status
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === "info" && (
              <div>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={editForm.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Type
                        </label>
                        <select
                          name="bloodType"
                          value={editForm.bloodType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={editForm.address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.fullName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.bloodType || "Not provided"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Purchase History Tab */}
            {activeTab === "purchases" && (
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No purchases yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by purchasing blood from the Buy Blood page.
                    </p>
                    <button
                      onClick={() => navigate("/buy-blood")}
                      className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                    >
                      Buy Blood Now
                    </button>
                  </div>
                ) : (
                  purchases.map((purchase) => (
                    <div
                      key={purchase._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {purchase.sourceName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {purchase.sourceType === "organization"
                              ? "Organization"
                              : "Hospital"}
                          </p>
                          {purchase.trackingNumber && (
                            <p className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mt-1">
                              {purchase.trackingNumber}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            purchase.status
                          )}`}
                        >
                          {purchase.status.charAt(0).toUpperCase() +
                            purchase.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Blood Type:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {purchase.bloodType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Units:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {purchase.units}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Cost:</span>
                          <span className="ml-2 font-medium text-red-600">
                            ৳{purchase.pricing.totalCost.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Order Date:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {formatDate(purchase.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Blood Expiry Date:</span>
                          <span className="ml-2 font-medium text-orange-600">
                            {purchase.expiryDate ? formatDate(purchase.expiryDate) : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <p className="text-sm text-gray-600">
                          Patient: <span className="font-medium">{purchase.patientName}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Contact: <span className="font-medium">{purchase.contactPhone}</span>
                        </p>
                      </div>
                      {["completed", "ready"].includes(purchase.status) && (
                        <div className="border-t mt-3 pt-3">
                          <button
                            onClick={() => generateReceipt(purchase)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
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
                                strokeWidth="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Download Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Shipping Status Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-4">
                {purchases.filter((p) =>
                  ["verified", "confirmed", "ready", "completed"].includes(p.status)
                ).length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No active shipments
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Shipping information will appear here once your purchases are
                      confirmed.
                    </p>
                  </div>
                ) : (
                  purchases
                    .filter((p) =>
                      ["verified", "confirmed", "ready", "completed"].includes(p.status)
                    )
                    .map((purchase) => (
                      <div
                        key={purchase._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {purchase.sourceName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order Date: {formatDate(purchase.createdAt)}
                            </p>
                            {purchase.trackingNumber && (
                              <p className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mt-1">
                                {purchase.trackingNumber}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              purchase.status
                            )}`}
                          >
                            {purchase.status.charAt(0).toUpperCase() +
                              purchase.status.slice(1)}
                          </span>
                        </div>

                        {/* Shipping Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`flex-1 text-center ${
                                purchase.status === "verified" ||
                                purchase.status === "confirmed" ||
                                purchase.status === "ready" ||
                                purchase.status === "completed"
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <div className="w-8 h-8 mx-auto rounded-full bg-current flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-xs mt-1">Verified</p>
                            </div>
                            <div className="flex-1 h-1 bg-gray-200">
                              <div
                                className={`h-full ${
                                  purchase.status === "confirmed" ||
                                  purchase.status === "ready" ||
                                  purchase.status === "completed"
                                    ? "bg-green-600"
                                    : "bg-gray-200"
                                }`}
                              />
                            </div>
                            <div
                              className={`flex-1 text-center ${
                                purchase.status === "confirmed" ||
                                purchase.status === "ready" ||
                                purchase.status === "completed"
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <div className="w-8 h-8 mx-auto rounded-full bg-current flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-xs mt-1">Confirmed</p>
                            </div>
                            <div className="flex-1 h-1 bg-gray-200">
                              <div
                                className={`h-full ${
                                  purchase.status === "ready" ||
                                  purchase.status === "completed"
                                    ? "bg-green-600"
                                    : "bg-gray-200"
                                }`}
                              />
                            </div>
                            <div
                              className={`flex-1 text-center ${
                                purchase.status === "ready" ||
                                purchase.status === "completed"
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <div className="w-8 h-8 mx-auto rounded-full bg-current flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-xs mt-1">Ready</p>
                            </div>
                            <div className="flex-1 h-1 bg-gray-200">
                              <div
                                className={`h-full ${
                                  purchase.status === "completed"
                                    ? "bg-green-600"
                                    : "bg-gray-200"
                                }`}
                              />
                            </div>
                            <div
                              className={`flex-1 text-center ${
                                purchase.status === "completed"
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <div className="w-8 h-8 mx-auto rounded-full bg-current flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-xs mt-1">Completed</p>
                            </div>
                          </div>
                        </div>

                        {/* Pickup Details */}
                        {purchase.pickupDetails && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-800 mb-2">
                              Pickup Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              {purchase.pickupDetails.address && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Address:</span>{" "}
                                  {purchase.pickupDetails.address}
                                </p>
                              )}
                              {purchase.pickupDetails.date && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Date:</span>{" "}
                                  {formatDate(purchase.pickupDetails.date)}
                                </p>
                              )}
                              {purchase.pickupDetails.time && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Time:</span>{" "}
                                  {purchase.pickupDetails.time}
                                </p>
                              )}
                              {purchase.pickupDetails.instructions && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Instructions:</span>{" "}
                                  {purchase.pickupDetails.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
