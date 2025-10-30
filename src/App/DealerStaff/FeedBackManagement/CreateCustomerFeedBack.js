import api from "../../../api/api";

export const CreateCustomerFeedBack = {
    createCustomerFeedBack: async (feedBackData) => {
        try {
            const response = await api.post("/CustomerFeedback/CreateCustomerFeedback", feedBackData);
            return response.data;
        } catch (error) {
            console.error("Error creating customer feedback:", error);
            throw error;
        }
    }
};