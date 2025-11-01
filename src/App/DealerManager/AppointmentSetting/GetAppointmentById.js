import api from "../../../api/api";
export const GetAppointmentById = {
    getAppointmentById: async (id) => {
        try {
            const response = await api.get(`/AppointmentSetting/get-appointment-setting-by-id/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error getting appointment by id:", error);
            throw error;
        }
    }
};