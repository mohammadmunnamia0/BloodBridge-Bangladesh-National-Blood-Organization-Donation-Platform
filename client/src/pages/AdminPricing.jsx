import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminPricing = () => {
  const [sources, setSources] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pricing, setPricing] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    loadSources();
  }, [navigate, filter]);

  const loadSources = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      let allSources = [];

      if (filter === "all" || filter === "organization") {
        const orgResponse = await axios.get("/api/admin/organizations", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const orgs = orgResponse.data.organizations.map((org) => ({
          ...org,
          sourceType: "organization",
        }));
        allSources = [...allSources, ...orgs];
      }

      if (filter === "all" || filter === "hospital") {
        const hospResponse = await axios.get("/api/admin/hospitals", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const hosps = hospResponse.data.hospitals.map((h) => ({
          ...h,
          sourceType: "hospital",
        }));
        allSources = [...allSources, ...hosps];
      }

      setSources(allSources);
      setLoading(false);
    } catch (error) {
      console.error("Error loading sources:", error);
      setLoading(false);
    }
  };

  const handleEditPricing = (item) => {
    setEditingItem(item);
    setPricing({
      bloodPrice: item.pricing?.bloodPrice || 0,
      processingFee: item.pricing?.processingFee || 0,
      screeningFee: item.pricing?.screeningFee || 0,
      serviceCharge: item.pricing?.serviceCharge || 0,
      deliveryCharge: item.pricing?.deliveryCharge || 0,
      handlingFee: item.pricing?.handlingFee || 0,
      crossMatching: item.additionalFees?.crossMatching || 0,
      storagePerDay: item.additionalFees?.storagePerDay || 0,
    });
    setShowModal(true);
  };

  const handleUpdatePricing = (field, value) => {
    setPricing({
      ...pricing,
      [field]: parseFloat(value) || 0,
    });
  };

  const handleSavePricing = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const endpoint = editingItem.sourceType === "hospital"
        ? `/api/admin/hospitals/${editingItem._id}/pricing`
        : `/api/admin/organizations/${editingItem._id}/pricing`;

      const pricingData = editingItem.sourceType === "hospital"
        ? {
            pricing: {
              bloodPrice: pricing.bloodPrice,
              processingFee: pricing.processingFee,
              screeningFee: pricing.screeningFee,
              serviceCharge: pricing.serviceCharge,
            },
            additionalFees: {
              crossMatching: pricing.crossMatching,
              storagePerDay: pricing.storagePerDay,
            },
          }
        : {
            pricing: {
              bloodPrice: pricing.bloodPrice,
              processingFee: pricing.processingFee,
              deliveryCharge: pricing.deliveryCharge,
              handlingFee: pricing.handlingFee,
            },
          };

      await axios.patch(endpoint, pricingData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      alert(`Pricing updated successfully for ${editingItem.name}!`);
      setShowModal(false);
      loadSources();
    } catch (error) {
      console.error("Error updating pricing:", error);
      alert("Failed to update pricing. Please try again.");
    }
  };

  const calculateTotal = (item) => {
    const p = item.pricing || {};
    return (
      (p.bloodPrice || 0) +
      (p.processingFee || 0) +
      (p.screeningFee || 0) +
      (p.serviceCharge || 0)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pricing Management</h1>
            <p className="text-gray-600 mt-2">Manage pricing and fees across all sources</p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setFilter("organization")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "organization"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Organizations
          </button>
          <button
            onClick={() => setFilter("hospital")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "hospital"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Hospitals
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : sources.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No sources found. Please add hospitals or organizations first.</p>
          </div>
        ) : (
          /* Pricing Cards */
          <div className="space-y-4">
            {sources.map((item, index) => {
              const total = calculateTotal(item);

            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.sourceType}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Base Price (per unit)</p>
                      <p className="text-2xl font-bold text-green-600">৳{total}</p>
                    </div>
                    <button
                      onClick={() => handleEditPricing(item)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Update Pricing
                    </button>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Blood Price</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ৳{item.pricing?.bloodPrice || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Processing Fee</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ৳{item.pricing?.processingFee || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Screening Fee</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ৳{item.pricing?.screeningFee || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Service Charge</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ৳{item.pricing?.serviceCharge || 0}
                    </p>
                  </div>
                </div>

                {/* Additional Fees (Hospitals) */}
                {item.sourceType === "hospital" && item.additionalFees && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Additional Fees</p>
                    <div className="grid grid-cols-2 gap-4">
                      {item.additionalFees.crossMatching && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Cross Matching</p>
                          <p className="text-lg font-semibold text-blue-800">
                            ৳{item.additionalFees.crossMatching}
                          </p>
                        </div>
                      )}
                      {item.additionalFees && item.additionalFees.storagePerDay && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Storage (per day)</p>
                          <p className="text-lg font-semibold text-blue-800">
                            ৳{item.additionalFees.storagePerDay}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Update Pricing - {editingItem.name}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Price (per unit)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.bloodPrice}
                  onChange={(e) => handleUpdatePricing("bloodPrice", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.processingFee}
                  onChange={(e) => handleUpdatePricing("processingFee", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screening Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.screeningFee}
                  onChange={(e) => handleUpdatePricing("screeningFee", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Charge
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.serviceCharge}
                  onChange={(e) => handleUpdatePricing("serviceCharge", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              {editingItem.sourceType === "hospital" && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Additional Fees (Hospital Only)</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cross Matching Fee
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricing.crossMatching}
                      onChange={(e) => handleUpdatePricing("crossMatching", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Fee (per day)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricing.storagePerDay}
                      onChange={(e) => handleUpdatePricing("storagePerDay", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Total Base Price:</strong>{" "}
                  <span className="text-lg font-bold text-green-600">
                    ৳
                    {(
                      pricing.bloodPrice +
                      pricing.processingFee +
                      pricing.screeningFee +
                      pricing.serviceCharge
                    ).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> In production, this would update the database. Currently, this
                is a demonstration of the pricing management interface.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePricing}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
