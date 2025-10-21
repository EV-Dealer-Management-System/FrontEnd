import api from "../../../api/api"; 
export const CreateEVQuotes = async (quoteData) => {
    try {
        const response = await api.post(`/Quote/create-quote`, quoteData);
        return response.data;
    } catch (error) {
        console.error("Error creating EV quote:", error);
        throw error;
    }
};