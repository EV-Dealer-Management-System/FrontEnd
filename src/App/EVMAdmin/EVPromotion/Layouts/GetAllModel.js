import api from "../../../../api/api";
const getAllModelIDs = async () => {
    try {
        const response = await api.get("/ElectricVehicleModel/get-all-models");
        return response.data;
    } catch (error) {
        console.error("Error fetching all model IDs:", error);
        throw error;
    }
};

export default getAllModelIDs;
