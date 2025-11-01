import api from "../../../api/api";
export const getAllEVInventories = async () => {
    try {
        const response = await api.get("/EVCInventory/get-all-evcinventories");
        return response.data;
    } catch (error) {
        console.error("Error fetching EV inventory:", error);
        throw error;
    }   
};
