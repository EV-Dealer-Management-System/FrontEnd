import api from "../../../api/api"; 
export const createCustomerOrder = async (orderData) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await api.post("/CustomerOrder/Create-customer-order", orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
