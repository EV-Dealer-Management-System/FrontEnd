import api from "../../../../api/api";
const getAllEVVersionByModelID = async (modelId) => {
    try {
        const response = await api.get(`/ElectricVehicleVersion/get-all-versions-by-modelid/${modelId}`);
        return response.data;
    }   catch (error) {
        console.error("Error fetching all EV versions:", error);
        throw error;
    }
};

export default getAllEVVersionByModelID;