import api from "../../../api/api";

export const CreateAppointment = {
  // Tạo cấu hình lịch hẹn mới
  createAppointment: async (formData) => {
    try {
      console.log("🚀 Creating Appointment - Payload:", JSON.stringify(formData, null, 2));
      
      // Validate payload trước khi gửi
      const requiredFields = ['customerId', 'evTemplateId', 'startTime', 'endDate'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await api.post("/Appointment/create-appointment", formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("📥 Appointment Creation Response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      console.error("❌ Error details:", 
        error.response ? JSON.stringify(error.response.data, null, 2) : error.message
      );
      
      // Throw lại để component bắt và xử lý
      throw error;
    }
  },
  
  // Cập nhật cấu hình lịch hẹn
  updateAppointment: async (id, formData) => {
    try {
      const response = await api.put(`/Appointment/update-appointment-by-id?appointmentId=${id}`, formData);
      return response.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },
};
