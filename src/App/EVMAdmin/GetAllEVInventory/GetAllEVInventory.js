import api from "../../../api/api";
export const getAllEVInventory = async () => {
    try {
        const response = await api.get("/ElectricVehicle/get-evc-inventory");
        return response.data;
    }
    catch (error) {
        console.error("Error fetching EV inventory:", error);
        throw error;
    }
};