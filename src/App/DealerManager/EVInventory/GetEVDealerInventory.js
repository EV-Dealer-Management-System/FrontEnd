import api from "../../../api/api";

export const GetEVDealerInventory = async () => {
    try {
        const response = await api.post(`/ElectricVehicle/get-dealer-inventory`);
        return response.data;
    } catch (error) {
        console.error("Error fetching EV dealer inventory:", error);
        throw error;
    }
};
