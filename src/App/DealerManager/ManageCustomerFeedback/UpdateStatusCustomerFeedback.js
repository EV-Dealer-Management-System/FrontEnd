import api from "../../../api/api";
export const UpdateStatusCustomerFeedback = {
    updateStatusCustomerFeedback: async (feedbackId, newStatus) => {
        try {
            const response = await api.put(`/CustomerFeedback/update-customer-feedback-status/${feedbackId}?newStatus=${newStatus}`);
            return response.data;
        } catch (error) {
            console.error("Error updating customer feedback status:", error);
            throw error;
        }
    }
}