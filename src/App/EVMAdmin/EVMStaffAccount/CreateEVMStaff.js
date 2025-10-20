import api from "../../../api/api";
export const EVMStaffAccountService = {
    createStaffAccount: async function (formData) {
        try {
            const apiData = {
                email: formData.email || '',
                fullName: formData.fullName || '',
                phoneNumber: formData.PhoneNumber || '',
            };
            const response = await api.post("/EVC/create-evm-staff", apiData);
            return response.data;
        } catch (error) {
            console.error("Error creating staff account:", error);
            throw error;
        }
    },
};
