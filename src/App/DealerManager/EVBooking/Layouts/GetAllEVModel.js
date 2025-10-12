import api from "../../../../api/api";

const getAllEVModels = async () => {
    try {
        const response = await api.get("/ElectricVehicleModel/get-all-models");
        return response.data;
    } catch (error) {
        console.error("Error fetching all EV models:", error);
        throw error;
    }
};

export default getAllEVModels;
