import api from "../../../api/api";
export const getAllCustomer = async () => {
    try {
        const response = await api.get("/Customer/get-all-customers");
        return response.data;
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
};
