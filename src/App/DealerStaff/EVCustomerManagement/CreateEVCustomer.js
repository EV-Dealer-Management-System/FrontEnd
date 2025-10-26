import api from "../../../api/api";
export const createCustomer = async (customerData) => {
    try {
        const response = await api.post("/Customer/create-customer", customerData);
        return response.data;
    } catch (error) {
        console.error("Error creating EV customer:", error);
        throw error;
    }
};