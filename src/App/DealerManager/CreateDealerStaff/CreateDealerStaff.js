import api from "../../../api/api";
export const CreateDealerStaff = {
    createStaffAccount: async function (formData) {
        try {
            const apiData = {
                email: formData.email || '',
                fullName: formData.fullName || '',
                phoneNumber: formData.PhoneNumber || '',
            };
            const response = await api.post("/Dealer/create-dealer-staff", apiData);
            return response.data;
        } catch (error) {
            console.error("Error creating staff account:", error);
            throw error;
        }
    },
};
