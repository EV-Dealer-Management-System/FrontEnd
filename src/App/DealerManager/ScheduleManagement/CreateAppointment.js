import api from "../../../api/api";

export const CreateAppointment = {
    createAppointment: async (formData) => {        
        try {
            const response = await api.post("/Appointment/create-appointment", formData);
            return response.data;
        }   

        catch (error) {
            console.error("Error creating appointment:", error);
            throw error;
        }
    }
};



