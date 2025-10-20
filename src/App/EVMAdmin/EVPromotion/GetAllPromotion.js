import api from "../../../api/api";
export const getAllPromotion = async () => {
    try {
        const response = await api.get("/Promotion/get-all-promotion");
        return response.data;
    }
    catch (error) {
        console.error("Error fetching promotions:", error);
        throw error;
    }
};
