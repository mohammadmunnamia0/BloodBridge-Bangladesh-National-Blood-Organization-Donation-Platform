import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ bloodType: "all", city: "all" });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [searchCity, setSearchCity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchDonors();
  }, [navigate, filter, pagination.page]);

  const fetchDonors = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      params.append("page", pagination.page);
      if (filter.bloodType !== "all") params.append("bloodType", filter.bloodType);
      if (filter.city !== "all") params.append("city", filter.city);

      const response = await axios.get(`/api/admin/donors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setDonors(response.data.donors);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching donors:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter, city: searchCity || "all" });
    setPagination({ ...pagination, page: 1 });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const canDonate = (lastDonation) => {
    if (!lastDonation) return true;
    const lastDate = new Date(lastDonation);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    return daysDiff >= 90; // 3 months
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
            <h1 className="text-3xl font-bold text-gray-800">All Donors</h1>
            <p className="text-gray-600 mt-2">View and manage registered blood donors</p>
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
            <p className="text-sm text-gray-600">Total Donors</p>
            <p className="text-2xl font-bold text-blue-600">{pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Eligible to Donate</p>
            <p className="text-2xl font-bold text-green-600">
              {donors.filter((d) => canDonate(d.lastDonation)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Not Eligible</p>
            <p className="text-2xl font-bold text-orange-600">
              {donors.filter((d) => !canDonate(d.lastDonation)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Average Weight</p>
            <p className="text-2xl font-bold text-purple-600">
              {donors.length > 0
                ? Math.round(donors.reduce((sum, d) => sum + d.weight, 0) / donors.length)
                : 0}{" "}
              kg
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              <select
                value={filter.bloodType}
                onChange={(e) => {
                  setFilter({ ...filter, bloodType: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by City</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter city name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Search
                </button>
                {filter.city !== "all" && (
                  <button
                    onClick={() => {
                      setSearchCity("");
                      setFilter({ ...filter, city: "all" });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Donors List */}
        <div className="space-y-4">
          {donors.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No donors found with the selected filters.</p>
            </div>
          ) : (
            donors.map((donor) => {
              const eligible = canDonate(donor.lastDonation);
              const age = calculateAge(donor.dateOfBirth);

              return (
                <div key={donor._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {donor.bloodType}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-800">{donor.fullName}</h3>
                          {donor.isDemoUser && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {age} years | {donor.gender} | {donor.weight} kg
                        </p>
                        <p className="text-sm text-gray-500">
                          Registered: {formatDate(donor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          eligible
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {eligible ? "✓ Eligible" : "⏳ Not Eligible"}
                      </span>
                      {!eligible && donor.lastDonation && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last donated: {formatDate(donor.lastDonation)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{donor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-800">{donor.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-800">
                        {donor.city}, {donor.state}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Address</p>
                    <p className="text-gray-800">
                      {donor.address}, {donor.city}, {donor.state} - {donor.zipCode}
                    </p>
                  </div>

                  {donor.medicalConditions && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-800">Medical Conditions:</p>
                      <p className="text-sm text-yellow-700 mt-1">{donor.medicalConditions}</p>
                    </div>
                  )}
                </div>
              );
            })
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
    </div>
  );
};

export default AdminDonors;
