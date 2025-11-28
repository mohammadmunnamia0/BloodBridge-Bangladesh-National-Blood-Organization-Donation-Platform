import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminLogin = () => {
  const [loginRole, setLoginRole] = useState(""); // "superadmin", "organization", "hospital"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch organizations and hospitals list when needed
    const fetchData = async () => {
      try {
        if (loginRole === "organization" || loginRole === "hospital") {
          const [orgsResponse, hospitalsResponse] = await Promise.all([
            axios.get("/api/admin/organizations/list"),
            axios.get("/api/admin/hospitals/list")
          ]);
          setOrganizations(orgsResponse.data);
          setHospitals(hospitalsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [loginRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let loginData = {};

      if (loginRole === "superadmin") {
        loginData = {
          username: "superadmin",
          password,
        };
      } else if (loginRole === "organization") {
        if (!selectedOrganization) {
          setError("Please select an organization");
          setLoading(false);
          return;
        }
        const org = organizations.find(o => o._id === selectedOrganization);
        loginData = {
          username: "orgadmin",
          password,
          organizationName: org?.name,
        };
      } else if (loginRole === "hospital") {
        if (!selectedHospital) {
          setError("Please select a hospital");
          setLoading(false);
          return;
        }
        const hosp = hospitals.find(h => h._id === selectedHospital);
        loginData = {
          username: "hospitaladmin",
          password,
          hospitalName: hosp?.name,
        };
      }

      const response = await axios.post("/api/admin/login", loginData);
      const { token, admin } = response.data;

      const adminUser = {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        organizationId: admin.organizationId || null,
        organizationName: admin.organizationName || null,
        hospitalId: admin.hospitalId || null,
        hospitalName: admin.hospitalName || null,
        permissions: admin.permissions,
        loginTime: new Date().toISOString(),
        token,
      };

      localStorage.setItem("adminUser", JSON.stringify(adminUser));
      localStorage.setItem("adminToken", token);
      localStorage.setItem("isAdminLoggedIn", "true");

      setLoading(false);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-xl">
              <svg
                className="w-10 h-10 text-white"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-600">
            BloodBridge Foundation Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Role Selection Dropdown */}
            <div>
              <label
                htmlFor="loginRole"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Login As
              </label>
              <select
                id="loginRole"
                required
                value={loginRole}
                onChange={(e) => {
                  setLoginRole(e.target.value);
                  setSelectedOrganization("");
                  setSelectedHospital("");
                  setError("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="">Select Role</option>
                <option value="superadmin">Super Admin</option>
                <option value="organization">Organization Admin</option>
                <option value="hospital">Hospital Admin</option>
              </select>
            </div>

            {/* Organization Selection - Only shown for organization role */}
            {loginRole === "organization" && (
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Select Your Organization
                </label>
                <select
                  id="organization"
                  required
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option value="">Choose an organization</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.icon} {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hospital Selection - Only shown for hospital role */}
            {loginRole === "hospital" && (
              <div>
                <label
                  htmlFor="hospital"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Select Your Hospital
                </label>
                <select
                  id="hospital"
                  required
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option value="">Choose a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Password Field - Shown after role selection */}
            {loginRole && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !loginRole}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2">
              {/* Super Admin */}
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">🔐 Super Admin</p>
                <div className="text-xs text-purple-700">
                  <span className="font-semibold">Password:</span> super@123
                </div>
              </div>
              
              {/* Organization Admin */}
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-1">🏢 Organization Admin</p>
                <div className="text-xs text-blue-700">
                  <span className="font-semibold">Select Org + Password:</span> org@123
                </div>
              </div>
              
              {/* Hospital Admin */}
              <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-900 mb-1">🏥 Hospital Admin</p>
                <div className="text-xs text-green-700">
                  <span className="font-semibold">Select Hospital + Password:</span> hospital@123
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
