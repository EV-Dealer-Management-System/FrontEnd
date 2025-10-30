import api from "../../../api/api";

export const GetAllCustomerFeedBack = {
    getAllCustomerFeedBacks: async () => {
        try {
            const response = await api.get("/CustomerFeedback/GetAllCustomerFeedbacks");
            return response.data;
        } catch (error) {
            console.error("Error fetching customer feedbacks:", error);
            throw error;
        }
    }
};
