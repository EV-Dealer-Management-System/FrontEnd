import api from "../../../../api/api";
export const getAllEVTemplates = async () => {
    try {
        const response = await api.get("/EVTemplate/Get-all-template-vehicles");
        return response.data;
    } catch (error) {
        console.error("Error fetching all EV templates:", error);
        throw error;
    }   
};

export default getAllEVTemplates;