import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: "all", sourceType: "all", bloodType: "all" });
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    pickupAddress: "",
    pickupDate: "",
    pickupTime: "",
    pickupInstructions: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchPurchases();
    
    // Auto-refresh every 30 seconds to show new purchases
    const interval = setInterval(() => {
      fetchPurchases();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate, filter]);

  const fetchPurchases = async () => {
    try {
      setError(null);
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        // If no token, redirect to login instead of showing error
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("adminUser");
        navigate("/admin");
        return;
      }

      const params = new URLSearchParams();
      if (filter.status !== "all") params.append("status", filter.status);
      if (filter.sourceType !== "all") params.append("sourceType", filter.sourceType);
      if (filter.bloodType !== "all") params.append("bloodType", filter.bloodType);

      console.log("Fetching purchases with params:", params.toString());
      
      const response = await axios.get(`/admin/purchases?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      console.log("Purchases response:", response.data);
      setPurchases(response.data.purchases || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      console.error("Error response:", error.response?.data);
      
      // If 401, token is invalid - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("isAdminLoggedIn");
        navigate("/admin");
        return;
      }
      
      setError(error.response?.data?.message || error.message || "Failed to load purchases");
      setPurchases([]);
      setLoading(false);
    }
  };

  const handleUpdateStatus = (purchase) => {
    setSelectedPurchase(purchase);
    setUpdateForm({
      status: purchase.status,
      adminNotes: purchase.adminNotes || "",
      pickupInstructions: purchase.pickupDetails?.instructions || "",
    });
    setShowModal(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.patch(
        `/admin/purchases/${selectedPurchase._id}/status`,
        {
          status: updateForm.status,
          adminNotes: updateForm.adminNotes,
          pickupDetails: {
            instructions: updateForm.pickupInstructions,
          },
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setShowModal(false);
      fetchPurchases();
      alert("Purchase updated successfully!");
    } catch (error) {
      console.error("Error updating purchase:", error);
      alert("Failed to update purchase");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Purchases</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchPurchases();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Purchases</h1>
            <p className="text-gray-600 mt-2">View and manage all blood purchase requests</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchPurchases}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              title="Refresh purchases"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="confirmed">Confirmed</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
              <select
                value={filter.sourceType}
                onChange={(e) => setFilter({ ...filter, sourceType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Sources</option>
                <option value="organization">Organization</option>
                <option value="hospital">Hospital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              <select
                value={filter.bloodType}
                onChange={(e) => setFilter({ ...filter, bloodType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Blood Types</option>
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
          </div>
        </div>

        {/* Purchases List */}
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No purchases found with the selected filters.</p>
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{purchase.sourceName}</h3>
                    <p className="text-sm text-gray-600">
                      {purchase.sourceType === "organization" ? "Organization" : "Hospital"}
                    </p>
                    {purchase.trackingNumber && (
                      <p className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mt-1">
                        {purchase.trackingNumber}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
                    {purchase.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Blood Type</p>
                    <p className="font-semibold text-red-600">{purchase.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Units</p>
                    <p className="font-semibold">{purchase.units}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-semibold text-green-600">৳{purchase.pricing.totalCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Urgency</p>
                    <p className="font-semibold">{purchase.urgency.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="font-semibold text-orange-600">{purchase.expiryDate ? formatDate(purchase.expiryDate) : "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Patient: <span className="font-medium">{purchase.patientName}</span></p>
                    <p className="text-gray-600">Contact: <span className="font-medium">{purchase.contactPhone}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">User: <span className="font-medium">{purchase.purchasedBy?.fullName || "N/A"}</span></p>
                    <p className="text-gray-600">Email: <span className="font-medium">{purchase.purchasedBy?.email || "N/A"}</span></p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Required: {formatDate(purchase.requiredDate)} | Submitted: {formatDate(purchase.createdAt)}
                  </p>
                  <button
                    onClick={() => handleUpdateStatus(purchase)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Purchase Status</h2>
            
            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={updateForm.adminNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Add notes for the user..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={updateForm.pickupInstructions}
                  onChange={(e) => setUpdateForm({ ...updateForm, pickupInstructions: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Update Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPurchases;
