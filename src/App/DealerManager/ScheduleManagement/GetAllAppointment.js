import api from "../../../api/api";

export const GetAllAppointment = {
  // Lấy tất cả cấu hình lịch hẹn
  getAllAppointments: async () => {
    try {
      const response = await api.get("/api/AppointmentSettings");
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },
};
