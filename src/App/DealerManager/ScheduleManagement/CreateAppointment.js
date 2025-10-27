import api from "../../../api/api";

export const CreateAppointment = {
  // Tạo cấu hình lịch hẹn mới
  createAppointment: async (formData) => {
    try {
      const response = await api.post("/AppointmentSetting/get-all-appointment-setting", formData);
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },
  
  // Cập nhật cấu hình lịch hẹn
  updateAppointment: async (id, formData) => {
    try {
      const response = await api.put(`/AppointmentSetting/get-all-appointment-setting/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

};
