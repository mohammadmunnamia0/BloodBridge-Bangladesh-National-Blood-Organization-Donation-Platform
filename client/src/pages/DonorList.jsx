import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ bloodType: "all" });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [user, setUser] = useState(null);
  const [isVerifiedDonor, setIsVerifiedDonor] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile from API to get fresh isDonor status
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/auth/profile");
      const userData = response.data.user;
      setUser(userData);
      
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(userData));
      
      return userData.isDonor === true;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch fresh user data from API
    const checkDonorStatus = async () => {
      const isDonor = await fetchUserProfile();
      setIsVerifiedDonor(isDonor);
      
      if (isDonor) {
        fetchDonors();
      } else {
        setLoading(false);
      }
    };

    checkDonorStatus();
  }, [navigate]);

  // Fetch donors when filters or pagination change
  useEffect(() => {
    if (isVerifiedDonor) {
      fetchDonors();
    }
  }, [filter, pagination.page, isVerifiedDonor]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagination.page);
      if (filter.bloodType !== "all") params.append("bloodType", filter.bloodType);

      const response = await axios.get(`/donors/list?${params.toString()}`);
      setDonors(response.data.donors || []);
      setPagination(response.data.pagination || { page: 1, total: 0, pages: 0 });
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching donors");
      setDonors([]);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setPagination({ ...pagination, page: 1 });
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
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If not a verified donor, show restriction message
  if (!isVerifiedDonor && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                user?.isBanned ? "bg-red-100" : "bg-yellow-100"
              }`}>
                <svg
                  className={`w-8 h-8 ${user?.isBanned ? "text-red-600" : "text-yellow-600"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {user?.isBanned ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
            </div>
            {user?.isBanned ? (
              <>
                <h2 className="text-2xl font-bold text-red-800 mb-2">🚫 Account Suspended</h2>
                <p className="text-red-600 mb-4 font-medium">You cannot access this feature due to account suspension.</p>
                {user?.banReason && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-red-800"><strong>Reason:</strong> {user.banReason}</p>
                  </div>
                )}
                <p className="text-gray-600 mb-6">
                  If you believe this is a mistake, please contact our support team.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Donor Panel Restricted</h2>
                <p className="text-gray-600 mb-6">
                  You need to be a verified donor to access the Donor Panel. Please submit your donor application and wait for approval.
                </p>
              </>
            )}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Go to Profile & Apply
              </button>
              <button
                onClick={async () => {
                  const isDonor = await fetchUserProfile();
                  setIsVerifiedDonor(isDonor);
                  if (isDonor) {
                    window.location.reload();
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                🔄 Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If error about permission, show error message
  if (error && error.includes("permission")) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Verified Donors</h1>
          <p className="text-gray-600 mt-2">
            Connect with verified blood donors in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Blood Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Blood Type
              </label>
              <select
                name="bloodType"
                value={filter.bloodType}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-700">
            Showing <span className="font-bold">{donors.length}</span> of{" "}
            <span className="font-bold">{pagination.total}</span> verified donors
          </p>
        </div>

        {/* Donors List */}
        {donors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <div
                key={donor._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                {/* Donor Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{donor.fullName}</h3>
                    <p className="text-gray-600 text-sm">{donor.city || "City not specified"}</p>
                  </div>
                  <div className="bg-red-100 rounded-full px-3 py-1">
                    <span className="text-red-700 font-bold text-lg">{donor.bloodType}</span>
                  </div>
                </div>

                {/* Donor Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium text-gray-800">{donor.age || "N/A"} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-gray-800 text-right text-sm">
                      {donor.address || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Donation:</span>
                    <span className="font-medium text-gray-800">{formatDate(donor.lastDonation)}</span>
                  </div>
                </div>

                {/* Donation Eligibility  ///////////////////// ///////////////////// */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      !donor.lastDonation ||
                      (donor.lastDonation &&
                        new Date() - new Date(donor.lastDonation) >= 90 * 24 * 60 * 60 * 1000)
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {!donor.lastDonation ||
                    (donor.lastDonation &&
                      new Date() - new Date(donor.lastDonation) >= 90 * 24 * 60 * 60 * 1000)
                      ? "✓ Can Donate"
                      : "⏱ Cannot Donate (< 3 months)"}
                  </span>

                     ///////////////////// /////////////////////
                  {/* Contact Button - Safe Contact Method */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        alert(
                          `To contact ${donor.fullName}, please use the messaging system or request their contact details from the admin panel.`
                        );
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      📧 Send Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6H6a6 6 0 00-6 6v2h12v-2a3 3 0 00-3-3"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Donors Found</h3>
            <p className="text-gray-600">
              Try adjusting your filters to find verified donors
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
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
            </div>
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.min(pagination.pages, pagination.page + 1),
                })
              }
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorList;
