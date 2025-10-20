import api from "../../../api/api";
export const updatePromotion = async (promotionId, promotionData) => {
    try {
        console.log('API Call - PromotionId:', promotionId);
        console.log('API Call - Data:', promotionData);

        const response = await api.put(`/Promotion/update-promotion/${promotionId}`, promotionData);
        return response.data;
    }
    catch (error) {
        console.error("Error updating promotion:", error);
        throw error;
    }
};
