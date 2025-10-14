import api from "../../../../api/api";

export const getEVAvailableQuantity = async (modelId, versionId, colorId) => {
  try {
    const response = await api.get(`/ElectricVehicle/get-available-quantity-by-model-version-color/${modelId}/${versionId}/${colorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching EV available quantity:", error);
    throw error;
  }
};
