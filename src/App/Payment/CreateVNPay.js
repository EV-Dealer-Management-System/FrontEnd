import api from "../../api/api";
export const createVNPay = async (customerOrderId, vnPayData) => {
    try {
        const response = await api.post(`/Payment/create-vnpay/${customerOrderId}`, vnPayData);
        return response.data;
    } catch (error) {
        console.error("Error creating VNPay:", error);
        throw error;
    }
};