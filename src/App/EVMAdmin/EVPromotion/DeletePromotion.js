import api from "../../../api/api";
export const DeletePromotion = async (promotionId) => {
  try {
    const response = await api.delete(
      `/Promotion/delete-promotion/${promotionId}`
    );

    console.log("Delete promotion response.data:", response.data);

    // Trả về toàn bộ response.data
    return response.data;
  } catch (error) {
    console.error("Error deleting promotion:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
