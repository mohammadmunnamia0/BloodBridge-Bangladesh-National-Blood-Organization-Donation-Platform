import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateReceipt } from "../utils/generateReceipt";

const BloodPurchaseDashboard = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("/api/blood-purchases/my-purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPurchases(response.data.purchases || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError("Failed to load purchases");
      setLoading(false);
    }
  };

  const handleCancelPurchase = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this purchase?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/blood-purchases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh purchases
      fetchPurchases();
      alert("Purchase cancelled successfully");
    } catch (err) {
      console.error("Error cancelling purchase:", err);
      alert(err.response?.data?.message || "Failed to cancel purchase");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
      confirmed: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-green-600 text-white",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      emergency: "text-red-600 font-bold",
      urgent: "text-orange-600 font-semibold",
      normal: "text-gray-600",
    };
    return colors[urgency] || "text-gray-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPurchases = purchases.filter((purchase) => {
    if (filter === "all") return true;
    return purchase.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">
            My Blood Purchases
          </h1>
          <button
            onClick={() => navigate("/buy-blood")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            + New Purchase
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Verified", value: "verified" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Ready", value: "ready" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === item.value
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
            <p className="text-2xl font-bold text-gray-800">
              {purchases.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {purchases.filter((p) => p.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {
                purchases.filter(
                  (p) =>
                    p.status === "verified" ||
                    p.status === "confirmed" ||
                    p.status === "ready"
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {purchases.filter((p) => p.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Purchases List */}
        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🩸</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No purchases found
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You haven't made any blood purchase requests yet."
                : `No purchases with status "${filter}".`}
            </p>
            <button
              onClick={() => navigate("/buy-blood")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Make Your First Purchase
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {purchase.sourceName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          purchase.sourceType === "organization"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {purchase.sourceType}
                      </span>
                    </div>
                    {purchase.trackingNumber && (
                      <p className="text-sm font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded inline-block mb-2">
                        Tracking: {purchase.trackingNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Order Date: {formatDate(purchase.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      purchase.status
                    )}`}
                  >
                    {purchase.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Blood Type</p>
                    <p className="text-lg font-bold text-red-600">
                      {purchase.bloodType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Units</p>
                    <p className="text-lg font-bold text-gray-800">
                      {purchase.units}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                    <p className="text-lg font-bold text-green-600">
                      ৳{purchase.pricing.totalCost}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                    <p className="text-lg font-bold text-orange-600">
                      {purchase.expiryDate ? formatDate(purchase.expiryDate) : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Patient: {purchase.patientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      Contact: {purchase.contactPhone}
                    </p>
                  </div>
                  <div>
                    <p className={getUrgencyColor(purchase.urgency)}>
                      Urgency: {purchase.urgency.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <p>
                      Required: {formatDate(purchase.requiredDate)}
                    </p>
                    <p>
                      Submitted: {formatDate(purchase.createdAt)}
                    </p>
                  </div>

                  {purchase.pickupDetails && (
                    <div className="bg-green-50 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-green-800 mb-1">
                        Pickup Details:
                      </p>
                      {purchase.pickupDetails.date && (
                        <p className="text-gray-700">
                          Date: {formatDate(purchase.pickupDetails.date)}
                        </p>
                      )}
                      {purchase.pickupDetails.time && (
                        <p className="text-gray-700">
                          Time: {purchase.pickupDetails.time}
                        </p>
                      )}
                      {purchase.pickupDetails.address && (
                        <p className="text-gray-700">
                          Address: {purchase.pickupDetails.address}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {["completed", "ready"].includes(purchase.status) && (
                      <button
                        onClick={() => generateReceipt(purchase)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
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
                    )}
                    {["pending", "verified"].includes(purchase.status) && (
                      <button
                        onClick={() => handleCancelPurchase(purchase._id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {purchase.adminNotes && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      Admin Notes:
                    </p>
                    <p className="text-sm text-gray-700">
                      {purchase.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodPurchaseDashboard;
