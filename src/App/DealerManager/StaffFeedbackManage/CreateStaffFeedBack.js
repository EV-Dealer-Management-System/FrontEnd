import api from "../../../api/api";
export const CreateStaffFeedBack = {
    createStaffFeedBack: async (feedBackData) => {
        try {
            const response = await api.post("/DealerFeedback/CreateDealerFeedback", feedBackData);
            return response.data;
        } catch (error) {
            console.error("Error creating staff feedback:", error);
            throw error;
        }
    }
};