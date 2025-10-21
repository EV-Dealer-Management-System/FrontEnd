import api from "../../../api/api";
export const GetAllPromotions = async () => {
    try {
        const response = await api.get(`/Promotion/get-all-promotion`);
        // Return the result array from the API response
        if (response.data && response.data.isSuccess) {
            return response.data.result;
        }
        return [];
    } catch (error) {
        console.error("Error fetching all promotions:", error);
        throw error;
    }
};
