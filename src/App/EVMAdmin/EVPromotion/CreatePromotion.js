import api from "../../../api/api";
export const createPromotion = async (promotionData) => {
    try {
        const response = await api.post("/Promotion/create-promotion", promotionData);
        return response.data;
    }
    catch (error) {
        console.error("Error creating promotion:", error);
        throw error;
    }
};


