import api from "../../../api/api";
export const UpdateAppointmentSetting = {
    updateAppointmentSetting: async (appointmentId, formData) => {
        try {
            const response = await api.put(`/AppointmentSetting/update-appointment-setting-by-id/${appointmentId}`, formData);
            return response.data;
        } catch (error) {
            console.error("Error updating appointment setting:", error);
            throw error;
        }
    }
};