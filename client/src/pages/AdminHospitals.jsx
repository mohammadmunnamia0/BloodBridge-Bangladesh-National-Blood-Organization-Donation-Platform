import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    emergencyHotline: "",
    emergencyContact: "",
    ambulance: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    website: "",
    bloodInventory: {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
    },
    pricing: {
      bloodPrice: 0,
      processingFee: 0,
      screeningFee: 0,
      serviceCharge: 0,
    },
    isActive: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
      navigate("/admin");
      return;
    }
    fetchHospitals();
  }, [navigate]);

  const fetchHospitals = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get("/api/admin/hospitals", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setHospitals(response.data.hospitals);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHospital(null);
    setFormData({
      name: "",
      emergencyHotline: "",
      emergencyContact: "",
      ambulance: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      website: "",
      bloodInventory: {
        "A+": 0, "A-": 0, "B+": 0, "B-": 0,
        "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
      },
      pricing: {
        bloodPrice: 0,
        processingFee: 0,
        screeningFee: 0,
        serviceCharge: 0,
      },
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData(hospital);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital?")) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.delete(`/api/admin/hospitals/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchHospitals();
      alert("Hospital deleted successfully!");
    } catch (error) {
      console.error("Error deleting hospital:", error);
      alert("Failed to delete hospital");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const adminToken = localStorage.getItem("adminToken");
      
      // Prepare data - remove password if empty during edit
      const submitData = { ...formData };
      if (editingHospital && !submitData.password) {
        delete submitData.password;
      }
      
      if (editingHospital) {
        await axios.patch(`/api/admin/hospitals/${editingHospital._id}`, submitData, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        alert("Hospital updated successfully!");
      } else {
        await axios.post("/api/admin/hospitals", submitData, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        alert("Hospital created successfully!");
      }
      setShowModal(false);
      fetchHospitals();
    } catch (error) {
      console.error("Error saving hospital:", error);
      alert("Failed to save hospital: " + (error.response?.data?.message || error.message));
    }
  };

  const calculateTotal = (pricing) => {
    return (
      (pricing.bloodPrice || 0) +
      (pricing.processingFee || 0) +
      (pricing.screeningFee || 0) +
      (pricing.serviceCharge || 0)
    );
  };

  const getTotalStock = (inventory) => {
    return Object.values(inventory || {}).reduce((sum, val) => sum + val, 0);
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
            <h1 className="text-3xl font-bold text-gray-800">Hospital Management</h1>
            <p className="text-gray-600 mt-2">Add, edit, or remove hospitals</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Hospital
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Hospitals</p>
            <p className="text-2xl font-bold text-blue-600">{hospitals.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Active Hospitals</p>
            <p className="text-2xl font-bold text-green-600">
              {hospitals.filter((h) => h.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Blood Units</p>
            <p className="text-2xl font-bold text-red-600">
              {hospitals.reduce((sum, h) => sum + getTotalStock(h.bloodInventory), 0)}
            </p>
          </div>
        </div>

        {/* Hospitals List */}
        <div className="space-y-4">
          {hospitals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No hospitals found. Add your first hospital!</p>
            </div>
          ) : (
            hospitals.map((hospital) => (
              <div key={hospital._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{hospital.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">📍 {hospital.address}</p>
                      <p className="text-sm text-gray-600">🚨 Emergency: {hospital.emergencyHotline}</p>
                      <p className="text-sm text-gray-600">🚑 Ambulance: {hospital.ambulance}</p>
                      <p className="text-sm text-gray-600">📞 Phone: {hospital.phone}</p>
                      {hospital.email && <p className="text-sm text-gray-600">📧 {hospital.email}</p>}
                      {hospital.website && (
                        <p className="text-sm text-gray-600">
                          🌐 <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {hospital.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(hospital)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hospital._id)}
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
                      {getTotalStock(hospital.bloodInventory)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ৳{calculateTotal(hospital.pricing)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xl font-bold text-purple-600">
                      {hospital.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Blood Price</p>
                    <p className="text-xl font-bold text-orange-600">
                      ৳{hospital.pricing?.bloodPrice || 0}
                    </p>
                  </div>
                </div>

                {/* Blood Type Stock */}
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Object.entries(hospital.bloodInventory || {}).map(([type, units]) => (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingHospital ? "Edit Hospital" : "Add New Hospital"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name *
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
                    Emergency Hotline *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyHotline}
                    onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                    required
                    placeholder="e.g., 10616"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Alternative emergency number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ambulance Number *
                  </label>
                  <input
                    type="text"
                    value={formData.ambulance}
                    onChange={(e) => setFormData({ ...formData, ambulance: e.target.value })}
                    required
                    placeholder="e.g., 01713-377776"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="e.g., 18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="Main phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="hospital@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank for default password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: hospital123 (if hospital needs to login later)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://hospital.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Pricing Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Price (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.bloodPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, bloodPrice: Number(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.processingFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, processingFee: Number(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Screening Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.screeningFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, screeningFee: Number(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Charge (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.serviceCharge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, serviceCharge: Number(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Blood Inventory */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Blood Inventory</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {Object.keys(formData.bloodInventory).map((bloodType) => (
                    <div key={bloodType}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {bloodType}
                      </label>
                      <input
                        type="number"
                        value={formData.bloodInventory[bloodType]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bloodInventory: {
                              ...formData.bloodInventory,
                              [bloodType]: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t pt-4 -mx-6 px-6 -mb-6 pb-6">
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
                    {editingHospital ? "Update Hospital" : "Add Hospital"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHospitals;
