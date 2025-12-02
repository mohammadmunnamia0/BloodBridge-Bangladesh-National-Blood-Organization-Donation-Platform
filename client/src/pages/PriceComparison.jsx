import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PriceComparison = () => {
  const navigate = useNavigate();
  const [selectedBloodType, setSelectedBloodType] = useState("A+");
  const [filterType, setFilterType] = useState("all"); // all, organizations, hospitals
  const [searchBloodType, setSearchBloodType] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hospsResponse, orgsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/public/hospitals"),
          axios.get("http://localhost:5000/api/public/organizations"),
        ]);
        setHospitals(hospsResponse.data);
        setOrganizations(orgsResponse.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all sources
  const getAllSources = () => {
    const orgs = organizations.map((org) => ({ ...org, type: "organization" }));
    const hosps = hospitals.map((hosp) => ({ ...hosp, type: "hospital" }));

    let allSources = [...orgs, ...hosps];

    if (filterType === "organizations") {
      allSources = allSources.filter((s) => s.type === "organization");
    } else if (filterType === "hospitals") {
      allSources = allSources.filter((s) => s.type === "hospital");
    }

    // Filter only those with pricing and inventory
    return allSources.filter((s) => s.pricing && s.bloodInventory);
  };

  const sources = getAllSources();

  // Handle search functionality
  const handleSearch = () => {
    if (!searchBloodType) {
      setShowSearchResults(false);
      return;
    }
    setSelectedBloodType(searchBloodType);
    setShowSearchResults(true);
  };

  // Handle clicking on a row to buy blood
  const handleBuyBlood = (source) => {
    navigate("/buy-blood", {
      state: {
        preSelectedSource: source,
        preSelectedBloodType: showSearchResults ? searchBloodType : selectedBloodType,
      },
    });
  };

  // Calculate total cost per unit
  const calculateTotalCost = (source) => {
    const { bloodPrice, processingFee, screeningFee, serviceCharge } =
      source.pricing;
    return bloodPrice + processingFee + screeningFee + serviceCharge;
  };

  // Sort sources by total cost
  const sortedSources = [...sources].sort(
    (a, b) => calculateTotalCost(a) - calculateTotalCost(b)
  );

  // Get min and max prices
  const prices = sortedSources.map((s) => calculateTotalCost(s));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-red-600 mb-4">
          Blood Price Comparison
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Compare blood prices across different hospitals and organizations to
          find the best option for your needs.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading price comparison...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-12 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-lg">No data available for comparison.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Blood Type Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Blood Type
                </label>
                <select
                  value={searchBloodType}
                  onChange={(e) => setSearchBloodType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter By
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All (Organizations & Hospitals)</option>
                  <option value="organizations">Organizations Only</option>
                  <option value="hospitals">Hospitals Only</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {showSearchResults && searchBloodType && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Showing results for:</span> Blood Type {searchBloodType}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Price Statistics */}
        <div className="max-w-4xl mx-auto mb-8 grid md:grid-cols-3 gap-4">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold mb-1">
              Lowest Price
            </p>
            <p className="text-2xl font-bold text-green-600">৳{minPrice}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold mb-1">
              Average Price
            </p>
            <p className="text-2xl font-bold text-blue-600">
              ৳{Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}
            </p>
          </div>
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold mb-1">
              Highest Price
            </p>
            <p className="text-2xl font-bold text-red-600">৳{maxPrice}</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-3 py-3 text-left text-xs">Rank</th>
                  <th className="px-3 py-3 text-left text-xs min-w-[180px]">Name</th>
                  <th className="px-3 py-3 text-left text-xs">Type</th>
                  <th className="px-3 py-3 text-right text-xs">Blood</th>
                  <th className="px-3 py-3 text-right text-xs">Process</th>
                  <th className="px-3 py-3 text-right text-xs">Screen</th>
                  <th className="px-3 py-3 text-right text-xs">Service</th>
                  <th className="px-3 py-3 text-right text-xs">Total</th>
                  <th className="px-3 py-3 text-center text-xs">
                    Stock ({selectedBloodType})
                  </th>
                  <th className="px-3 py-3 text-center text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedSources.map((source, index) => {
                  const totalCost = calculateTotalCost(source);
                  const isLowest = totalCost === minPrice;
                  const availability =
                    source.bloodInventory[selectedBloodType] || 0;

                  return (
                    <tr
                      key={`${source.type}-${source._id || source.id}`}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        isLowest ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="px-3 py-3">
                        {isLowest && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                            Best
                          </span>
                        )}
                        {!isLowest && (
                          <span className="text-gray-600 font-semibold text-xs">
                            #{index + 1}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">
                            {source.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {source.address || source.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            source.type === "organization"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {source.type === "organization"
                            ? "Org"
                            : "Hosp"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700 text-xs">
                        ৳{source.pricing.bloodPrice}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700 text-xs">
                        ৳{source.pricing.processingFee}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700 text-xs">
                        ৳{source.pricing.screeningFee}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700 text-xs">
                        ৳{source.pricing.serviceCharge}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-bold text-red-600 text-sm">
                          ৳{totalCost}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded font-semibold text-xs ${
                            availability > 10
                              ? "bg-green-100 text-green-800"
                              : availability > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {availability}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleBuyBlood(source)}
                          disabled={availability === 0}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                            availability > 0
                              ? "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {availability > 0 ? "Buy" : "N/A"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            💡 Important Notes:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
            <li>
              Prices shown are per unit of blood and include all standard fees
            </li>
            <li>
              Additional fees may apply for cross-matching or extended storage
            </li>
            <li>Availability is updated regularly but subject to change</li>
            <li>
              Emergency cases may incur additional charges or expedited fees
            </li>
            <li>
              Contact the organization/hospital directly for the most accurate
              information
            </li>
          </ul>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceComparison;
