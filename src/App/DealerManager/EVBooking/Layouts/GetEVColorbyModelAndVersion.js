import api from "../../../../api/api";

export const getEVColorbyModelAndVersion = async (modelId, versionId) => {
  try {
    const response = await api.get(`/ElectricVehicleColor/get-all-colors-by-modelid-and-versionid/${modelId}/${versionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching EV color by model and version:", error);
    throw error;
  }
};