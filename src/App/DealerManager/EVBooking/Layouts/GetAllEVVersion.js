import api from "../../../../api/api";
const getAllEVVersion = async () => {
    try {
        const response = await api.get("/ElectricVehicleVersion/get-all-versions");
        return response.data;
    }   catch (error) {
        console.error("Error fetching all EV versions:", error);
        throw error;
    }
};

export default getAllEVVersion;