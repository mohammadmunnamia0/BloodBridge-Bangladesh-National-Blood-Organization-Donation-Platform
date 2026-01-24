import React, { useState, useEffect } from "react";
import { getInventory, updateInventory } from "../utils/inventoryAPI";
import { toast } from "react-hot-toast";

const AdminInventoryManagement = ({ adminToken }) => {
  const [entityType, setEntityType] = useState("organization");
  const [entityId, setEntityId] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("A+");
  const [quantity, setQuantity] = useState("");
  const [action, setAction] = useState("increase");
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch inventory when entity is selected
  useEffect(() => {
    if (entityId) {
      fetchInventory();
    }
  }, [entityId, entityType]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await getInventory(entityType, entityId, adminToken);
      setInventory(data);
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();

    if (!entityId) {
      toast.error("Please select an entity");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setUpdating(true);
    try {
      const result = await updateInventory(
        entityType,
        entityId,
        selectedBloodType,
        quantity,
        action,
        adminToken
      );

      toast.success(`Stock ${action === "increase" ? "increased" : "decreased"} successfully`);
      setInventory(result.updatedInventory);
      setQuantity("");

      // Refetch inventory to ensure latest data
      setTimeout(fetchInventory, 500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update inventory";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-red-700 mb-6">📦 Inventory Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Entity Selection and Update Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setEntityId("");
                setInventory(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="organization">Organization</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entity ID
            </label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Paste entity ID here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {loading && <p className="text-blue-600 text-sm">Loading inventory...</p>}

          {inventory && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-700">{inventory.name}</p>
              <p className="text-sm text-gray-600 mt-1">Current Stock Levels:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {bloodTypes.map((type) => (
                  <div key={type} className="text-sm">
                    <span className="font-medium">{type}:</span>
                    <span className="ml-2 text-red-600 font-bold">
                      {inventory.bloodInventory[type] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateInventory} className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-700">Update Stock</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="increase">Increase Stock ⬆️</option>
                <option value="decrease">Decrease Stock ⬇️</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity (Units)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={updating || !entityId}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {updating ? "Updating..." : `${action === "increase" ? "Increase" : "Decrease"} Stock`}
            </button>
          </form>
        </div>

        {/* Right Side - Information */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-700">📋 Instructions</h3>
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>Select the entity type (Organization or Hospital)</li>
            <li>Enter or paste the entity ID</li>
            <li>The current stock levels will load automatically</li>
            <li>Select blood type, action (increase/decrease), and quantity</li>
            <li>Click the button to update the stock</li>
            <li>The inventory updates in real-time across all panels</li>
          </ul>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">🔄 Auto-Updates</h4>
            <p className="text-sm text-gray-700">
              Blood stock automatically decreases when users complete blood purchases. Stock
              levels are updated in real-time in both User and Admin panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryManagement;
