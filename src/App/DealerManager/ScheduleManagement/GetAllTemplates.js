import api from "../../../api/api";

export const GetAllTemplates = {
  // Lấy tất cả template xe
  getAllTemplates: async () => {
    try {
      const response = await api.get("/EVTemplate/Get-all-template-vehicles");
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },
};
