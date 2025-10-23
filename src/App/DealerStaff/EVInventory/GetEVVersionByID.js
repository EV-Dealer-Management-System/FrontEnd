import api from "../../../api/api";

export const getEVVersionById = async (versionId) => {
  try {
    const response = await api.get(`/ElectricVehicleVersion/get-version-by-id/${versionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching EV version by ID:", error);
    throw error;
  }
};
