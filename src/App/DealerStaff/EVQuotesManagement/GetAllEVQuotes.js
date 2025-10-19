import api from "../../../api/api";
export const getAllEVQuotes = async () => {
    try {
        const response = await api.get("/Quote/get-all-quote");
        return response.data;
    } catch (error) {
        console.error("Error fetching EV quotes:", error);
        throw error;
    }
};
