import axios from "../utils/axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hospitals } from "../Utlity/hospitals";
import { organizationsData } from "../utils/organizationsData";

const BuyBlood = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedBloodType, setSelectedBloodType] = useState("");
  const [searchBloodType, setSearchBloodType] = useState("");
  const [units, setUnits] = useState(1);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Data from database
  const [dbOrganizations, setDbOrganizations] = useState([]);
  const [dbHospitals, setDbHospitals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Form state
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientCondition, setPatientCondition] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [requiredDate, setRequiredDate] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseResponse, setPurchaseResponse] = useState(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch organizations and hospitals from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgsResponse, hospsResponse] = await Promise.all([
          axios.get("/public/organizations"),
          axios.get("/public/hospitals")
        ]);
        
        // Ensure we always have arrays
        const orgs = Array.isArray(orgsResponse.data) ? orgsResponse.data : [];
        const hosps = Array.isArray(hospsResponse.data) ? hospsResponse.data : [];
        
        setDbOrganizations(orgs);
        setDbHospitals(hosps);
      } catch (err) {
        console.error("Error fetching data:", err);
        // If API fails, ensure arrays are set
        setDbOrganizations([]);
        setDbHospitals([]);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
    
    // Auto-refresh every 10 seconds to show updated prices and inventory
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10000);

    // Refetch data when page becomes visible (tab is brought to focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle pre-selected source and blood type from navigation state
  useEffect(() => {
    if (location.state?.preSelectedSource && location.state?.preSelectedBloodType) {
      const { preSelectedSource, preSelectedBloodType } = location.state;
      
      // Set the source type tab based on the pre-selected source
      if (preSelectedSource.type === "organization") {
        setActiveTab("organizations");
      } else if (preSelectedSource.type === "hospital") {
        setActiveTab("hospitals");
      }
      
      // Set the selected source and blood type
      setSelectedSource(preSelectedSource);
      setSelectedBloodType(preSelectedBloodType);
      setUnits(1);
      setShowSearchResults(false);
      
      // Clear the navigation state to prevent re-triggering on component updates
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Get all sources - database sources ONLY (demo data already seeded in database)
  const getAllSources = () => {
    // Ensure dbOrganizations and dbHospitals are arrays
    const dbOrgs = Array.isArray(dbOrganizations) ? dbOrganizations : [];
    const dbHosps = Array.isArray(dbHospitals) ? dbHospitals : [];
    
    let result = [];
    
    if (activeTab === "all") {
      result = [
        ...dbOrgs.map(org => ({ ...org, sourceType: "organization" })),
        ...dbHosps.map(h => ({ ...h, sourceType: "hospital" })),
      ];
    } else if (activeTab === "organizations") {
      result = [
        ...dbOrgs.map(org => ({ ...org, sourceType: "organization" })),
      ];
    } else {
      result = [
        ...dbHosps.map(h => ({ ...h, sourceType: "hospital" })),
      ];
    }
    
    // Calculate missing fields for each source
    result = result.map(source => ({
      ...source,
      // If pricePerUnit is missing, use pricing.bloodPrice or default 1200
      pricePerUnit: source.pricePerUnit || source.pricing?.bloodPrice || 1200,
      // Calculate totalFees from pricing object or use a default
      totalFees: source.totalFees || (source.pricing ? 
        (source.pricing.processingFee || 0) + 
        (source.pricing.deliveryCharge || 0) + 
        (source.pricing.handlingFee || 0) 
        : 450),
      // Ensure bloodInventory exists
      bloodInventory: source.bloodInventory || {},
      // Ensure contactNumber exists
      contactNumber: source.contactNumber || source.contact || source.phone || "N/A",
      // Ensure operatingHours exists
      operatingHours: source.operatingHours || source.operatingTime || "9:00 AM - 5:00 PM",
    }));
    
    console.log(`getAllSources (activeTab: ${activeTab}):`, {
      total: result.length,
      organizations: result.filter(s => s.sourceType === "organization").length,
      hospitals: result.filter(s => s.sourceType === "hospital").length,
      dbOrgs: dbOrgs.length,
      dbHosps: dbHosps.length
    });
    
    return result;
  };

  const sources = getAllSources();

  // Search functionality
  const handleSearch = () => {
    if (!searchBloodType) {
      setError("Please select a blood type to search");
      return;
    }

    // First filter by source type based on activeTab
    let sourcesToSearch = sources;
    
    if (activeTab === "organizations") {
      sourcesToSearch = sources.filter(s => s.sourceType === "organization");
    } else if (activeTab === "hospitals") {
      sourcesToSearch = sources.filter(s => s.sourceType === "hospital");
    }
    // If activeTab is "all", use all sources

    const availableSources = sourcesToSearch.filter(
      (source) =>
        source.bloodInventory &&
        source.bloodInventory[searchBloodType] > 0 &&
        source.pricing
    );

    // Calculate total price and sort by best price
    const sourcesWithPrice = availableSources.map((source) => ({
      ...source,
      totalPrice:
        (Number(source.pricing.bloodPrice) || 0) +
        (Number(source.pricing.processingFee) || 0) +
        (Number(source.pricing.screeningFee) || 0) +
        (Number(source.pricing.serviceCharge) || 0),
      availableUnits: source.bloodInventory[searchBloodType],
    }));

    sourcesWithPrice.sort((a, b) => a.totalPrice - b.totalPrice);

    setSearchResults(sourcesWithPrice);
    setShowSearchResults(true);
    setError("");
  };

  const handleSelectFromSearch = (source) => {
    setSelectedSource(source);
    setSelectedBloodType(searchBloodType);
    setShowSearchResults(false);
    setUnits(1);
  };

  // Auto-refresh search results when source data updates
  useEffect(() => {
    if (showSearchResults && searchBloodType) {
      const refreshSearchResults = () => {
        // Re-filter and sort search results with updated source data
        let sourcesToSearch = sources;
        
        if (activeTab === "organizations") {
          sourcesToSearch = sources.filter(s => s.sourceType === "organization");
        } else if (activeTab === "hospitals") {
          sourcesToSearch = sources.filter(s => s.sourceType === "hospital");
        }

        const availableSources = sourcesToSearch.filter(
          (source) =>
            source.bloodInventory &&
            source.bloodInventory[searchBloodType] > 0 &&
            source.pricing
        );

        const sourcesWithPrice = availableSources.map((source) => ({
          ...source,
          totalPrice:
            (Number(source.pricing.bloodPrice) || 0) +
            (Number(source.pricing.processingFee) || 0) +
            (Number(source.pricing.screeningFee) || 0) +
            (Number(source.pricing.serviceCharge) || 0),
          availableUnits: source.bloodInventory[searchBloodType],
        }));

        sourcesWithPrice.sort((a, b) => a.totalPrice - b.totalPrice);
        setSearchResults(sourcesWithPrice);
      };

      refreshSearchResults();
    }
  }, [sources, searchBloodType, showSearchResults, activeTab]);

  // Calculate total cost
  const calculateTotal = () => {
    if (!selectedSource || !selectedSource.pricing) return 0;
    
    const pricing = selectedSource.pricing;
    const bloodPrice = Number(pricing.bloodPrice) || 0;
    const processingFee = Number(pricing.processingFee) || 0;
    const screeningFee = Number(pricing.screeningFee) || 0;
    const serviceCharge = Number(pricing.serviceCharge) || 0;
    const deliveryCharge = Number(pricing.deliveryCharge) || 0;
    const handlingFee = Number(pricing.handlingFee) || 0;
    
    const total = (bloodPrice * units) + processingFee + screeningFee + serviceCharge + deliveryCharge + handlingFee;
    return total;
  };

  // Generate expiry date (35-42 days from today)
  const generateExpiryDate = () => {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * 8) + 35; // Random between 35-42 days
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + daysToAdd);
    return expiryDate;
  };

  const handleSelectSource = (source) => {
    // Ensure source has all required data before selection
    const sourceWithData = {
      ...source,
      bloodInventory: source.bloodInventory || {},
      pricing: source.pricing || {
        bloodPrice: source.pricePerUnit || 1200,
        processingFee: 0,
        screeningFee: 0,
        serviceCharge: 0,
      },
      sourceType: source.sourceType || (source.type === "hospital" ? "hospital" : "organization"),
    };
    setSelectedSource(sourceWithData);
    setSelectedBloodType("");
    setUnits(1);
    setShowPurchaseForm(false);
  };

  const handleProceedToPurchase = () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (!token || !isLoggedIn) {
      setError("Please register and login to purchase blood");
      setTimeout(() => navigate("/register-donor"), 2000);
      return;
    }

    if (!selectedSource || !selectedBloodType || units < 1) {
      setError("Please select source, blood type, and units");
      return;
    }

    // Check maximum limit (5 units per purchase)
    if (units > 5) {
      setError("Maximum 5 units allowed per purchase");
      return;
    }

    // Check availability
    const availability = selectedSource.bloodInventory[selectedBloodType];
    if (!availability || availability < units) {
      setError(`Insufficient stock. Only ${availability || 0} units available`);
      return;
    }

    setError("");
    setShowPurchaseForm(true);
  };

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to purchase blood");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Validate form
      if (!patientName || !contactName || !contactPhone || !requiredDate) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate units (maximum 5)
      if (units > 5) {
        setError("Maximum 5 units allowed per purchase");
        setLoading(false);
        return;
      }

      // Validate transaction ID for bKash and Nagad
      if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !transactionId.trim()) {
        setError(`Transaction ID is required for ${paymentMethod === "bkash" ? "bKash" : "Nagad"}`);
        setLoading(false);
        return;
      }

      const totalCost = calculateTotal();
      
      console.log("Submitting purchase data:", {
        sourceType: selectedSource.sourceType || "organization",
        sourceName: selectedSource.name,
        sourceId: selectedSource._id || selectedSource.id,
        bloodType: selectedBloodType,
        units: Number(units),
      });
      //////////////////////////////////////////////////////
      const purchaseData = {
        sourceType: selectedSource.sourceType || "organization",
        sourceName: selectedSource.name,
        sourceId: selectedSource._id || selectedSource.id,
        bloodType: selectedBloodType,
        units: Number(units),
        pricing: {
          ...selectedSource.pricing,
          totalCost,
        },
        patientName,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientCondition,
        contactName,
        contactPhone,
        contactEmail,
        urgency,
        requiredDate,
        userNotes,
        deliveryAddress,
        paymentMethod,
        transactionId: (paymentMethod === "bkash" || paymentMethod === "nagad") ? transactionId : undefined,
      };

      const response = await axios.post(
        "/blood-purchases",
        purchaseData
      );

      console.log("Purchase response:", response.data);
      
      // Show success modal with tracking number
      const responseData = response.data.purchase || response.data;
      setPurchaseResponse(responseData);
      setShowSuccessModal(true);

      
      console.log("Modal state set:", { showSuccessModal: true, responseData });
      
      // Reset form on success//////////////////////////////////////////////////////
      setShowPurchaseForm(false);
    } catch (err) {
      console.error("Purchase error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);
      
      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError("Failed to submit purchase request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  console.log("Render state:", { showSuccessModal, purchaseResponse });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-red-600 mb-8">
          Buy Blood
        </h1>

        {/* Debug: Show modal state
        {showSuccessModal && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50">
            Modal should be showing!
          </div>
        )} */}

        {/* Search Section - Only show if no source is selected */}
        {!selectedSource && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Search for Available Blood
            </h2>
          
            {error && !showPurchaseForm && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Blood Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Blood Type
              </label>
              <select
                value={searchBloodType}
                onChange={(e) => setSearchBloodType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter By
              </label>
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setShowSearchResults(false);
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Sources</option>
                <option value="organizations">Organizations Only</option>
                <option value="hospitals">Hospitals Only</option>
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
        )}

        {!showPurchaseForm && !showSuccessModal ? (
          <>
            {/* Search Results */}
            {showSearchResults ? (
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
                      No sources found with blood type {searchBloodType}. Please try a different search.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((source, index) => (
                      <div
                        key={source.id}
                        className={`flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                          index === 0 ? "ring-2 ring-green-500" : ""
                        }`}
                      >
                        {index === 0 && (
                          <div className="bg-green-500 text-white px-4 py-2 text-center font-semibold text-sm">
                            🏆 BEST PRICE
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
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
                                {searchBloodType}
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
                            onClick={() => handleSelectFromSearch(source)}
                            className="w-full mt-auto bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
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
            ) : (
              !selectedSource && (
                <div className="space-y-6">
                  {(() => {
                    const filteredSources = sources.filter((source) => {
                      if (activeTab === "organizations") {
                        return source.sourceType === "organization";
                      } else if (activeTab === "hospitals") {
                        return source.sourceType === "hospital";
                      }
                      return true; // "all" tab - show all sources
                    });
                    const orgCount = filteredSources.filter(s => s.sourceType === "organization").length;
                    const hospCount = filteredSources.filter(s => s.sourceType === "hospital").length;

                    return (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">
                            All Available Sources ({filteredSources.length})
                          </h2>
                          <div className="text-sm text-gray-600">
                            {orgCount} Organizations • {hospCount} Hospitals
                          </div>
                        </div>

                        {dataLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading sources...</p>
                          </div>
                        ) : filteredSources.length === 0 ? (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                            <p className="text-yellow-800 font-medium">
                              No sources available at the moment.
                            </p>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSources.map((source) => (
                        <div
                          key={source.id}
                          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                        >
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
                              <div className="border-t pt-3">
                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                  Blood Inventory:
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {bloodTypes.map((type) => (
                                    <div
                                      key={type}
                                      className={`text-center p-2 rounded ${
                                        source.bloodInventory?.[type] > 0
                                          ? "bg-green-50 text-green-700 border border-green-200"
                                          : "bg-gray-50 text-gray-400 border border-gray-200"
                                      }`}
                                    >
                                      <div className="text-xs font-bold">{type}</div>
                                      <div className="text-xs">
                                        {source.bloodInventory?.[type] || 0}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {source.pricing && (
                                <div className="border-t pt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                      Blood Price:
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                      ৳{source.pricing.bloodPrice}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                      Total Fees:
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                      ৳{source.pricing.processingFee + source.pricing.screeningFee + source.pricing.serviceCharge}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm font-semibold text-gray-900">
                                      Total Cost:
                                    </span>
                                    <span className="text-lg font-bold text-red-600">
                                      ৳{source.pricing.bloodPrice + source.pricing.processingFee + source.pricing.screeningFee + source.pricing.serviceCharge}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleSelectSource(source)}
                              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                            >
                              Select Source
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
                      </>
                    );
                  })()}
                </div>
              )
            )}

            {selectedSource && !showPurchaseForm && !showSuccessModal && (
              /* Blood Type Selection */
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <button
                  onClick={() => {
                    setSelectedSource(null);
                    setShowSearchResults(true);
                  }}
                  className="mb-6 text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  ← Back to search results
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {selectedSource.name}
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Blood Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Blood Type *
                    </label>
                    <select
                      value={selectedBloodType}
                      onChange={(e) => setSelectedBloodType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Choose Blood Type</option>
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>
                          {type} (Available: {selectedSource.bloodInventory[type] || 0} units)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Units * (Max 5 units)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={units}
                      onChange={(e) => {
                        const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 5);
                        setUnits(value);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {units > 5 && (
                      <p className="text-red-600 text-sm mt-1">Maximum 5 units allowed per purchase</p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                {selectedBloodType && selectedSource.pricing && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Price Breakdown
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>Blood Type:</span>
                        <span className="font-bold text-red-600 text-lg">
                          {selectedBloodType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Units:</span>
                        <span className="font-semibold text-green-600">
                          {selectedSource.bloodInventory[selectedBloodType]} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiry Date:</span>
                        <span className="font-semibold text-orange-600">
                          {generateExpiryDate().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="border-t pt-2 mt-2"></div>
                      <div className="flex justify-between">
                        <span>Blood Price ({units} units):</span>
                        <span className="font-semibold">
                          ৳{selectedSource.pricing.bloodPrice * units}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee:</span>
                        <span className="font-semibold">
                          ৳{selectedSource.pricing.processingFee}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Screening/Test Fee:</span>
                        <span className="font-semibold">
                          ৳{selectedSource.pricing.screeningFee}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge:</span>
                        <span className="font-semibold">
                          ৳{selectedSource.pricing.serviceCharge}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-bold text-red-600">
                        <span>Total Cost:</span>
                        <span>৳{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {!localStorage.getItem("token") && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <span className="font-semibold">Authentication Required:</span> You must be logged in to purchase blood. Please{" "}
                          <button onClick={() => navigate("/register-donor")} className="underline font-semibold hover:text-yellow-900">
                            register
                          </button>{" "}
                          first, then{" "}
                          <button onClick={() => navigate("/login")} className="underline font-semibold hover:text-yellow-900">
                            login
                          </button>{" "}
                          to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProceedToPurchase}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Proceed to Purchase
                </button>
              </div>
            )}
          </>
        ) : !showSuccessModal ? (
          /* Purchase Form */
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={() => setShowPurchaseForm(false)}
              className="mb-6 text-red-600 hover:text-red-700 flex items-center gap-2"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Complete Purchase Request
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitPurchase} className="space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Patient Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient Condition/Reason
                    </label>
                    <textarea
                      value={patientCondition}
                      onChange={(e) => setPatientCondition(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Delivery Information
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Enter complete delivery address with area, city, and postal code"
                    required
                  />
                </div>
              </div>

              {/* Urgency, Date, and Payment */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Required Date *
                  </label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setTransactionId("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>

                {/* Transaction ID for bKash and Nagad */}
                {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transaction ID * ({paymentMethod === "bkash" ? "bKash" : "Nagad"})
                    </label>
                    
                    {/* Payment Instructions */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4 w-full">
                      <h4 className="font-bold text-blue-900 mb-3">
                        {paymentMethod === "bkash" ? "bKash" : "Nagad"} Payment Instructions
                      </h4>
                      <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                        <li>Open the {paymentMethod === "bkash" ? "bKash" : "Nagad"} App on your mobile phone.</li>
                        <li>Tap on Payment.</li>
                        <li>
                          Enter the {paymentMethod === "bkash" ? "bKash" : "Nagad"} number: 
                          <span className="text-2xl font-bold text-red-600 inline-block">
                            {paymentMethod === "bkash" ? "01858-201032" : "01858-201032"}
                          </span>
                        </li>
                        <li>Enter the payment amount and complete the payment.</li>
                        <li>After completing the payment, copy the Transaction ID.</li>
                        <li>Paste the Transaction ID into the required field below.</li>
                      </ol>
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <p className="text-sm text-red-700 font-semibold">
                          ⚠️ Transaction ID is mandatory. Purchases without a valid Transaction ID will be automatically cancelled.
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder={`Enter your ${paymentMethod === "bkash" ? "bKash" : "Nagad"} transaction ID`}
                      className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-yellow-50 font-semibold"
                      required
                    />
                    {!transactionId && (
                      <p className="text-xs text-red-600 mt-2 font-semibold">
                       
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      You must provide a transaction ID to proceed with {paymentMethod === "bkash" ? "bKash" : "Nagad"} payment
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Any special instructions or requirements"
                />
              </div>

              {/* Purchase Summary */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Purchase Summary
                </h3>
                <p className="text-gray-700">
                  <span className="font-semibold">Source:</span> {selectedSource.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Blood Type:</span> {selectedBloodType}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Units:</span> {units}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-4">
                  Total: ৳{calculateTotal()}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {loading ? "Submitting..." : "Submit Purchase Request"}
              </button>
            </form>
          </div>
        ) : null}

        {/* Success Message */}
        {showSuccessModal && purchaseResponse && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Purchase Request Submitted Successfully!
              </h2>
              <p className="text-gray-600">
                Your blood purchase request has been received and is being processed
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Blood Type:</span>
                  <span className="font-bold text-red-600 text-lg">
                    {purchaseResponse.bloodType || purchaseResponse.purchase?.bloodType}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-semibold text-gray-900">
                    {purchaseResponse.units || purchaseResponse.purchase?.units}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Source:</span>
                  <span className="font-semibold text-gray-900">
                    {purchaseResponse.sourceName || purchaseResponse.purchase?.sourceName}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Patient Name:</span>
                  <span className="font-semibold text-gray-900">
                    {purchaseResponse.patientName || purchaseResponse.purchase?.patientName}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Contact Phone:</span>
                  <span className="font-semibold text-gray-900">
                    {purchaseResponse.contactPhone || purchaseResponse.purchase?.contactPhone}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-900 font-semibold text-lg">
                    Total Cost:
                  </span>
                  <span className="font-bold text-green-600 text-2xl">
                    ৳{(purchaseResponse.pricing?.totalCost || purchaseResponse.purchase?.pricing?.totalCost || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Your request will be reviewed by the source organization
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    You'll receive a confirmation once the order is approved
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    The organization will contact you for pickup or delivery arrangements
                  </span>
                </li>
              </ul>
            </div>

            {/* Customer Service Message */}
            <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 9a1 1 0 100-2 1 1 0 000 2zm5 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-lg font-semibold text-amber-900">
                    Our Customer Service Will Contact You Very Soon
                  </p>
                  <p className="text-amber-800 text-sm mt-1">
                    Our dedicated team will reach out to you within 24 hours to confirm your order and arrange delivery details.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowPurchaseForm(false);
                  setSelectedSource(null);
                  setSelectedBloodType("");
                  setShowSearchResults(false);
                  setPatientName("");
                  setPatientAge("");
                  setPatientCondition("");
                  setContactName("");
                  setContactPhone("");
                  setContactEmail("");
                  setUrgency("normal");
                  setRequiredDate("");
                  setUserNotes("");
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
              >
                Make Another Purchase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyBlood;
