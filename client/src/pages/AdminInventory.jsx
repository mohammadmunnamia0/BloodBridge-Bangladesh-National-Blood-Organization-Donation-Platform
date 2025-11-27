import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { organizationsData } from "../utils/organizationsData";
import { hospitals } from "../Utlity/hospitals";

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState("all"); // all, organization, hospital
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bloodStock, setBloodStock] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    loadInventory();
  }, [navigate, filter]);

  const loadInventory = () => {
    let allSources = [];

    if (filter === "all" || filter === "organization") {
      const orgs = [
        ...organizationsData.national.map((org) => ({ ...org, sourceType: "organization" })),
        ...organizationsData.hospital.map((org) => ({ ...org, sourceType: "organization" })),
        ...organizationsData.digital.map((org) => ({ ...org, sourceType: "organization" })),
      ];
      allSources = [...allSources, ...orgs];
    }

    if (filter === "all" || filter === "hospital") {
      const hosp = hospitals.map((h) => ({ ...h, sourceType: "hospital" }));
      allSources = [...allSources, ...hosp];
    }

    setInventory(allSources);
  };

  const handleEditInventory = (item) => {
    setEditingItem(item);
    setBloodStock(item.bloodInventory || {});
    setShowModal(true);
  };

  const handleUpdateStock = (bloodType, value) => {
    setBloodStock({
      ...bloodStock,
      [bloodType]: parseInt(value) || 0,
    });
  };

  const handleSaveInventory = () => {
    // In a real application, this would update the backend/database
    // For now, we'll just update the local state
    alert(`Inventory updated for ${editingItem.name}!\n\nIn production, this would save to database.`);
    setShowModal(false);
    loadInventory();
  };

  const getTotalStock = (bloodInventory) => {
    if (!bloodInventory) return 0;
    return Object.values(bloodInventory).reduce((sum, units) => sum + units, 0);
  };

  const getLowStockCount = (bloodInventory) => {
    if (!bloodInventory) return 0;
    return Object.values(bloodInventory).filter((units) => units < 10).length;
  };

  const getStockStatus = (units) => {
    if (units === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (units < 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    if (units < 30) return { label: "Medium", color: "bg-blue-100 text-blue-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Manage blood stock across all sources</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setFilter("organization")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "organization"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Organizations
          </button>
          <button
            onClick={() => setFilter("hospital")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "hospital"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Hospitals
          </button>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventory.map((item, index) => {
            const totalStock = getTotalStock(item.bloodInventory);
            const lowStockCount = getLowStockCount(item.bloodInventory);

            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.sourceType}</p>
                  </div>
                  <button
                    onClick={() => handleEditInventory(item)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Update Stock
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="text-2xl font-bold text-blue-600">{totalStock}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${lowStockCount > 0 ? "bg-yellow-50" : "bg-green-50"}`}>
                    <p className="text-sm text-gray-600">Low Stock Items</p>
                    <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-yellow-600" : "text-green-600"}`}>
                      {lowStockCount}
                    </p>
                  </div>
                </div>

                {/* Blood Type Breakdown */}
                <div className="space-y-2">
                  {Object.entries(item.bloodInventory || {}).map(([bloodType, units]) => {
                    const status = getStockStatus(units);
                    return (
                      <div key={bloodType} className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">{bloodType}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-medium">{units} units</span>
                          <span className={`px-2 py-1 rounded text-xs ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Update Inventory - {editingItem.name}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bloodType) => (
                <div key={bloodType}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {bloodType}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bloodStock[bloodType] || 0}
                    onChange={(e) => handleUpdateStock(bloodType, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> In production, this would update the database. Currently, this
                is a demonstration of the inventory management interface.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInventory}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
