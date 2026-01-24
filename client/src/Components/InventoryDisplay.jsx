import React, { useState, useEffect } from "react";

const InventoryDisplay = ({ organization, hospital }) => {
  const [inventory, setInventory] = useState(null);
  const [entityName, setEntityName] = useState("");

  useEffect(() => {
    if (organization) {
      setInventory(organization.bloodInventory);
      setEntityName(organization.name);
    } else if (hospital) {
      setInventory(hospital.bloodInventory);
      setEntityName(hospital.name);
    }
  }, [organization, hospital]);

  if (!inventory || !entityName) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">Loading inventory information...</p>
      </div>
    );
  }

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Check if any blood type is out of stock
  const isOutOfStock = bloodTypes.every((type) => !inventory[type] || inventory[type] === 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🏥 Current Blood Inventory</h3>
        <p className="text-sm text-gray-600">{entityName}</p>
      </div>

      {isOutOfStock ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">⚠️ Out of Stock</p>
          <p className="text-red-600 text-sm">
            Currently, no blood units are available. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bloodTypes.map((type) => {
            const count = inventory[type] || 0;
            const isLowStock = count > 0 && count < 5;

            return (
              <div
                key={type}
                className={`p-4 rounded-lg text-center border-2 transition ${
                  count === 0
                    ? "bg-gray-100 border-gray-300"
                    : isLowStock
                    ? "bg-orange-50 border-orange-400"
                    : "bg-green-50 border-green-400"
                }`}
              >
                <p className="text-2xl font-bold text-red-600">{type}</p>
                <p className="text-sm font-semibold text-gray-700 mt-2">
                  {count} {count === 1 ? "unit" : "units"}
                </p>
                {count === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Out of stock</p>
                )}
                {isLowStock && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Low stock</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>💡 Inventory updates automatically after each purchase completion.</p>
      </div>
    </div>
  );
};

export default InventoryDisplay;
