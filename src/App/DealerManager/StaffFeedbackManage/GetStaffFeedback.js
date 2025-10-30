import api from "../../../api/api";

export const GetStaffFeedback = {
    getStaffFeedback: async () => {
        try {
            const response = await api.get("/DealerFeedback/GetAllDealerFeedbacks");
            return response.data;
        } catch (error) {
            console.error("Error fetching staff feedback:", error);
            throw error;
        }
    }
};
