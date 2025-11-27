import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">View insights and performance metrics</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Blood Type Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Blood Type Popularity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Blood Type</th>
                  <th className="text-right py-3 px-4">Total Orders</th>
                  <th className="text-right py-3 px-4">Total Units</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.bloodTypeStats?.map((stat) => (
                  <tr key={stat._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-red-600">{stat._id}</td>
                    <td className="text-right py-3 px-4">{stat.count}</td>
                    <td className="text-right py-3 px-4">{stat.totalUnits}</td>
                    <td className="text-right py-3 px-4 text-green-600">
                      ৳{stat.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue (Last 12 Months)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Month/Year</th>
                  <th className="text-right py-3 px-4">Orders</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.monthlyRevenue?.map((stat, index) => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const monthYear = `${monthNames[stat._id.month - 1]} ${stat._id.year}`;
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{monthYear}</td>
                      <td className="text-right py-3 px-4">{stat.count}</td>
                      <td className="text-right py-3 px-4 text-green-600">
                        ৳{stat.revenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Source Type Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Source Type Performance</h2>
            <div className="space-y-4">
              {analytics?.sourceTypeStats?.map((stat) => (
                <div key={stat._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">{stat._id}</p>
                    <p className="text-sm text-gray-600">{stat.count} orders</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ৳{stat.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Urgency Distribution</h2>
            <div className="space-y-4">
              {analytics?.urgencyStats?.map((stat) => {
                const colors = {
                  emergency: "bg-red-100 text-red-800",
                  urgent: "bg-orange-100 text-orange-800",
                  normal: "bg-green-100 text-green-800",
                };
                return (
                  <div key={stat._id} className={`p-4 rounded-lg ${colors[stat._id] || "bg-gray-100"}`}>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold capitalize">{stat._id}</p>
                      <p className="text-2xl font-bold">{stat.count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Export Data</h2>
          <p className="text-gray-600 mb-4">Download reports for further analysis</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Generate PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
