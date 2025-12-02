import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "national",
    location: "",
    contact: "",
    email: "",
    website: "",
    bloodInventory: {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
    },
    pricing: {
      bloodPrice: 0,
      processingFee: 0,
      deliveryCharge: 0,
      handlingFee: 0,
    },
  });
  const navigate = useNavigate();

  const categories = [
    { value: "national", label: "🏥 National", icon: "🏥" },
    { value: "hospital", label: "🏨 Hospital", icon: "🏨" },
    { value: "digital", label: "💻 Digital", icon: "💻" }
  ];

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchOrganizations();
  }, [navigate]);

  const fetchOrganizations = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get("/api/admin/organizations", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setOrganizations(response.data.organizations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOrg(null);
    setFormData({
      name: "",
      category: "national",
      location: "",
      contact: "",
      email: "",
      website: "",
      bloodInventory: {
        "A+": 0, "A-": 0, "B+": 0, "B-": 0,
        "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
      },
      pricing: {
        bloodPrice: 0,
        processingFee: 0,
        deliveryCharge: 0,
        handlingFee: 0,
      },
    });
    setShowModal(true);
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData(org);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.delete(`/api/admin/organizations/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchOrganizations();
      alert("Organization deleted successfully!");
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("Failed to delete organization");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (editingOrg) {
        await axios.patch(`/api/admin/organizations/${editingOrg._id}`, formData, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        alert("Organization updated successfully!");
      } else {
        await axios.post("/api/admin/organizations", formData, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        alert("Organization created successfully!");
      }
      setShowModal(false);
      fetchOrganizations();
    } catch (error) {
      console.error("Error saving organization:", error);
      alert("Failed to save organization");
    }
  };

  const calculateTotal = (pricing) => {
    return (
      (pricing.bloodPrice || 0) +
      (pricing.processingFee || 0) +
      (pricing.deliveryCharge || 0) +
      (pricing.handlingFee || 0)
    );
  };

  const getTotalStock = (inventory) => {
    return Object.values(inventory || {}).reduce((sum, val) => sum + val, 0);
  };

  const getCategoryColor = (category) => {
    const colors = {
      national: "bg-blue-100 text-blue-800",
      hospital: "bg-green-100 text-green-800",
      digital: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryDisplay = (category) => {
    const displays = {
      national: "🏥 National",
      hospital: "🏨 Hospital",
      digital: "💻 Digital",
    };
    return displays[category] || category;
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
            <h1 className="text-3xl font-bold text-gray-800">Organization Management</h1>
            <p className="text-gray-600 mt-2">Add, edit, or remove organizations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Organization
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Organizations</p>
            <p className="text-2xl font-bold text-blue-600">{organizations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active Organizations</p>
            <p className="text-2xl font-bold text-green-600">
              {organizations.filter((o) => o.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Blood Units</p>
            <p className="text-2xl font-bold text-red-600">
              {organizations.reduce((sum, o) => sum + getTotalStock(o.bloodInventory), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(organizations.map((o) => o.category)).size}
            </p>
          </div>
        </div>

        {/* Organizations List */}
        <div className="space-y-4">
          {organizations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No organizations found. Add your first organization!</p>
            </div>
          ) : (
            organizations.map((org) => (
              <div key={org._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{org.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                          org.category
                        )}`}
                      >
                        {getCategoryDisplay(org.category)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">📍 {org.location}</p>
                    <p className="text-sm text-gray-600">📞 {org.contact}</p>
                    {org.email && <p className="text-sm text-gray-600">📧 {org.email}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(org)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(org._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Total Stock</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {getTotalStock(org.bloodInventory)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ৳{calculateTotal(org.pricing)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Delivery Charge</p>
                    <p className="text-xl font-bold text-purple-600">
                      ৳{org.pricing?.deliveryCharge || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Handling Fee</p>
                    <p className="text-xl font-bold text-orange-600">
                      ৳{org.pricing?.handlingFee || 0}
                    </p>
                  </div>
                </div>

                {/* Blood Type Stock */}
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Object.entries(org.bloodInventory || {}).map(([type, units]) => (
                    <div key={type} className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs font-semibold text-gray-700">{type}</p>
                      <p className="text-lg font-bold text-red-600">{units}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingOrg ? "Edit Organization" : "Add New Organization"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact *
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
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
                  {editingOrg ? "Update Organization" : "Add Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizations;
