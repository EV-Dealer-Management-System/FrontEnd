import api from "../../../api/api";

export const UpdateAppointment = {
    updateAppointmentStatus: async (appointmentId, newStatus) => {
        try {
            const response = await api.put(`/Appointment/update-appointment-by-id/${appointmentId}`, null, {
                params: { newStatus }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating appointment:", error);
            throw error;
        }
    }
};

