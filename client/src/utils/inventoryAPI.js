import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get inventory for specific organization or hospital
export const getInventory = async (entityType, entityId, adminToken) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/inventory/${entityType}/${entityId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};

// Update blood inventory (increase or decrease)
export const updateInventory = async (
  entityType,
  entityId,
  bloodType,
  quantity,
  action,
  adminToken
) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/admin/inventory/${entityType}/${entityId}/update`,
      {
        bloodType,
        quantity,
        action, // "increase" or "decrease"
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
};

// Get all inventories (for super admin dashboard)
export const getAllInventories = async (adminToken) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/inventory/summary/all`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all inventories:", error);
    throw error;
  }
};
