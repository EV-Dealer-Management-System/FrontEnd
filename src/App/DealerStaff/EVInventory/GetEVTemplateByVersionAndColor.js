import api from "../../../api/api";
export const GetEVTemplateByVersionAndColor = async (versionId, colorId) => {
    try {
        const response = await api.get(`/EVTemplate/get-template-by-version-and-color/${versionId}/${colorId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching EV template by version and color:", error);
        throw error;
    }
}