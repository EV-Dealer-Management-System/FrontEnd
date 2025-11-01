import api from "../../../api/api";
export const GetAvailableSlot = {
    getAvailableSlot: async () => {
        try {
            const response = await api.get("/AppointmentSetting/get-available-slot-appointments");
            return response.data;
        } catch (error) {
            console.error("Error getting available slot:", error);
            throw error;
        }
    }
};