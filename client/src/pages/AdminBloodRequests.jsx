import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", bloodType: "all", urgency: "all" });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchRequests();
  }, [navigate, filter]);

  const fetchRequests = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const params = new URLSearchParams();
      if (filter.status !== "all") params.append("status", filter.status);
      if (filter.bloodType !== "all") params.append("bloodType", filter.bloodType);
      if (filter.urgency !== "all") params.append("urgency", filter.urgency);

      const response = await axios.get(`/api/admin/blood-requests?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setRequests(response.data.requests);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blood requests:", error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setShowModal(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.patch(
        `/api/admin/blood-requests/${selectedRequest._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setShowModal(false);
      fetchRequests();
      alert("Blood request status updated successfully!");
    } catch (error) {
      console.error("Error updating blood request:", error);
      alert("Failed to update blood request");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-blue-100 text-blue-800 border-blue-300",
      fulfilled: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      emergency: "bg-red-500 text-white",
      urgent: "bg-orange-500 text-white",
      normal: "bg-green-500 text-white",
    };
    return colors[urgency] || "bg-gray-500 text-white";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <h1 className="text-3xl font-bold text-gray-800">Blood Requests</h1>
            <p className="text-gray-600 mt-2">Manage all blood donation requests</p>
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
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter((r) => r.status === "approved").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Fulfilled</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === "fulfilled").length}
            </p>
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
                <option value="approved">Approved</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="rejected">Rejected</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
              <select
                value={filter.urgency}
                onChange={(e) => setFilter({ ...filter, urgency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Urgency</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No blood requests found with the selected filters.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {request.bloodType}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{request.patientName}</h3>
                      <p className="text-sm text-gray-600">{request.hospital}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(request)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Update Status
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Units Required</p>
                    <p className="font-semibold text-red-600">{request.units} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Required Date</p>
                    <p className="font-semibold text-orange-600">
                      {new Date(request.requiredDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-semibold">{request.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-semibold">{request.contactPhone}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Requested By</p>
                    <p className="font-medium text-gray-800">
                      {request.requestedBy?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.requestedBy?.email || "N/A"} | {request.requestedBy?.phone || "N/A"}
                    </p>
                    {request.requestedBy?.bloodType && (
                      <p className="text-sm text-gray-500">
                        Blood Type: {request.requestedBy.bloodType}
                      </p>
                    )}
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="text-sm text-gray-800">{formatDate(request.createdAt)}</p>
                    {request.updatedAt !== request.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {formatDate(request.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Request Status</h2>
            
            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient: {selectedRequest?.patientName}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type: {selectedRequest?.bloodType} | Units: {selectedRequest?.units}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Changing the status will notify the requester.
                </p>
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
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBloodRequests;
