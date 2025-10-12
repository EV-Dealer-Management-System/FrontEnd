import api from "../../../../api/api";

export const getEVColorById = async (colorId) => {
  try {
    const response = await api.get(`/ElectricVehicleColor/get-color-by-id/${colorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching EV color by ID:", error);
    throw error;
  }
};
