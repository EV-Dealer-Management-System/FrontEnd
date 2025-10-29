import api from "../../../api/api";

export const GetAvailableAppointments = {
    getAvailableAppointments: async () => {
        try {
            const response = await api.get("/AppointmentSetting/get-available-slot-appointments");
            return response.data;
        } catch (error) {
            console.error("Error fetching available appointments:", error);
            throw error;
        }
    }
};
