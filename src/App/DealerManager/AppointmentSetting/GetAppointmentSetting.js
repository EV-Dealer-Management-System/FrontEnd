import api from "../../../api/api";
export const GetAppointmentSetting = {
    getAppointmentSetting: async () => {
        try {
            const response = await api.get("/AppointmentSetting/get-current-setting");
            return response.data;
        } catch (error) {
            console.error("Error getting appointment setting:", error);
            throw error;
        }
    }
};