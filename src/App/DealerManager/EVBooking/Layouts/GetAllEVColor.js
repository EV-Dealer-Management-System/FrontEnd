import api from "../../../../api/api";

const getAllEVColors = async () => {
    try {
        const response = await api.get("/ElectricVehicleColor/get-all-colors");
        return response.data;
    } catch (error) {
        console.error("Error fetching all EV colors:", error);
        throw error;
    }
};

export default getAllEVColors;
