import api from "../../../api/api";
export const updateEVQuotesStatus = async (quoteId, newStatus) => {
    try {
        const url = `/Quote/Update-quote-status/${quoteId}?newStatus=${newStatus}`;
        const response = await api.put(url);
        return response.data;
    } catch (error) {
        console.error("Error updating EV quotes status:", error);
        throw error;
    }
};