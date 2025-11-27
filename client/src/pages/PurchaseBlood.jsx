import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { organizationsData } from "../utils/organizationsData";
import { hospitals } from "../Utlity/hospitals";
import axios from "axios";

const PurchaseBlood = () => {
  const navigate = useNavigate();
  const [bloodType, setBloodType] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Purchase form data
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState("normal");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientCondition, setPatientCondition] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!bloodType) {
      alert("Please select a blood type");
      return;
    }

    let allSources = [];

    // Collect all sources with their blood inventory
    if (filterBy === "all" || filterBy === "organization") {
      const orgs = [
        ...organizationsData.national,
        ...organizationsData.digital,
      ];
      orgs.forEach((org) => {
        if (org.bloodInventory && org.bloodInventory[bloodType] > 0) {
          allSources.push({
            ...org,
            sourceType: "organization",
            availableUnits: org.bloodInventory[bloodType],
            totalPrice: calculateTotalPrice(org.pricing),
          });
        }
      });
    }

    if (filterBy === "all" || filterBy === "hospital") {
      hospitals.forEach((hospital) => {
        if (
          hospital.bloodInventory &&
          hospital.bloodInventory[bloodType] > 0
        ) {
          allSources.push({
            ...hospital,
            sourceType: "hospital",
            availableUnits: hospital.bloodInventory[bloodType],
            totalPrice: calculateTotalPrice(hospital.pricing),
          });
        }
      });
    }

    // Sort by best price (lowest first)
    allSources.sort((a, b) => a.totalPrice - b.totalPrice);

    setSearchResults(allSources);
    setShowResults(true);
  };

  const calculateTotalPrice = (pricing) => {
    if (!pricing) return 0;
    return (
      (pricing.bloodPrice || 0) +
      (pricing.processingFee || 0) +
      (pricing.screeningFee || 0) +
      (pricing.serviceCharge || 0) +
      (pricing.crossMatching || 0) +
      (pricing.storagePerDay || 0)
    );
  };

  const handlePurchase = (source) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to purchase blood");
      navigate("/login");
      return;
    }
    setSelectedSource(source);
    setShowPurchaseModal(true);
  };

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const totalCost = selectedSource.totalPrice * units;

      const purchaseData = {
        bloodType,
        units: Number(units),
        urgency,
        patientName,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientCondition: patientCondition || undefined,
        contactName,
        contactPhone,
        contactEmail: contactEmail || undefined,
        deliveryAddress,
        sourceId: selectedSource.id.toString(),
        sourceName: selectedSource.name,
        sourceType: selectedSource.sourceType,
        pricing: {
          bloodPrice: selectedSource.pricing.bloodPrice || 0,
          processingFee: selectedSource.pricing.processingFee || 0,
          screeningFee: selectedSource.pricing.screeningFee || 0,
          serviceCharge: selectedSource.pricing.serviceCharge || 0,
          crossMatching: selectedSource.pricing.crossMatching || 0,
          storagePerDay: selectedSource.pricing.storagePerDay || 0,
          totalCost,
        },
      };

      const response = await axios.post(
        "/api/blood-purchases",
        purchaseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Navigate to success page with tracking number
      navigate("/purchase-success", {
        state: {
          trackingNumber: response.data.trackingNumber,
          purchase: response.data,
        },
      });
    } catch (err) {
      console.error("Purchase error:", err);
      setError(
        err.response?.data?.message || "Failed to complete purchase. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Blood
          </h1>
          <p className="text-lg text-gray-600">
            Search for available blood and compare prices
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Blood Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Blood Type
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
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

            {/* Filter By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter By
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Sources</option>
                <option value="organization">Organizations Only</option>
                <option value="hospital">Hospitals Only</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Sources ({searchResults.length})
              </h2>
              {searchResults.length > 0 && (
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Best Price: ৳{searchResults[0]?.totalPrice}
                </span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  No sources found with blood type {bloodType}. Please try a different search.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((source, index) => (
                  <div
                    key={source.id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      index === 0 ? "ring-2 ring-green-500" : ""
                    }`}
                  >
                    {index === 0 && (
                      <div className="bg-green-500 text-white px-4 py-2 text-center font-semibold text-sm">
                        🏆 BEST PRICE
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-3xl mb-2 block">
                            {source.icon}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {source.name}
                          </h3>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              source.sourceType === "hospital"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {source.sourceType === "hospital"
                              ? "Hospital"
                              : "Organization"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Available Units:
                          </span>
                          <span className="font-bold text-red-600">
                            {source.availableUnits}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Blood Type:
                          </span>
                          <span className="font-bold text-gray-900">
                            {bloodType}
                          </span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              Blood Price:
                            </span>
                            <span className="text-gray-800">
                              ৳{source.pricing.bloodPrice}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              Processing:
                            </span>
                            <span className="text-gray-800">
                              ৳{source.pricing.processingFee}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              Screening:
                            </span>
                            <span className="text-gray-800">
                              ৳{source.pricing.screeningFee}
                            </span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-green-600">
                              ৳{source.totalPrice}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePurchase(source)}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                      >
                        Purchase Now
                      </button>

                      {source.contact && (
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          Contact: {source.contact}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedSource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
              <div className="bg-red-600 text-white px-6 py-4 rounded-t-2xl">
                <h3 className="text-2xl font-bold">Complete Purchase</h3>
                <p className="text-red-100 text-sm mt-1">
                  {selectedSource.name}
                </p>
              </div>

              <form onSubmit={handleSubmitPurchase} className="p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units Required *
                    </label>
                    <input
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      min="1"
                      max={selectedSource.availableUnits}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency *
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Condition
                    </label>
                    <input
                      type="text"
                      value={patientCondition}
                      onChange={(e) => setPatientCondition(e.target.value)}
                      placeholder="e.g., Surgery, Accident, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Order Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Price per unit:</span>
                      <span>৳{selectedSource.totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Units:</span>
                      <span>{units}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total Cost:</span>
                      <span className="text-green-600">
                        ৳{selectedSource.totalPrice * units}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPurchaseModal(false);
                      setError("");
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                  >
                    {loading ? "Processing..." : "Submit Purchase Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseBlood;
