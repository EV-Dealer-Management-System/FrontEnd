import api from "../../../api/api";
export const createCustomer = async (customerData) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await api.post("/Customer/create-customer", customerData);
        return response.data;
    }
    catch (error) {
        throw error;
    }
};
