import api from "../../../api/api"; 
export const createContract = async (contractData) => {
    try {
        const response = await api.post("/Econtract/draft-dealer-contract", contractData);
        return response.data;
    } catch (error) {
        console.error("Error creating contract:", error);
        throw error;
    }
};
