import api from "../../../../api/api";

export const getEVModelById = async (modelId) => {
  try {
    const response = await api.get(`/ElectricVehicleModel/get-model-by-id/${modelId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching EV model by ID:", error);
    throw error;
  }
};
