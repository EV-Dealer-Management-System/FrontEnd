import api from "../../../api/api";

export const GetAvailableAppointments = {
    getAvailableAppointments: async (targetDate) => {
        try {
            const params = {};
            if (targetDate) {
                // Format: 2025-10-30T00:00:00Z
                params.targetDate = targetDate;
            }
            const response = await api.get("/AppointmentSetting/get-available-slot-appointments", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching available appointments:", error);
            throw error;
        }
    }
};
