import api from "../../../api/api";

export const EVMStaffAccountService = {
    getAllStaffAccounts: async function ({
        filterOn = "",
        filterQuery = "",
        sortBy = "CreatedAt",
        pageNumber = 1,
        isAcending = false,
        pageSize = 1000,

    }) {
        try {
            const response = await api.get("/EVC/get-all-evm-staff", {
                params: {
                    filterOn,
                    filterQuery,
                    sortBy,
                    pageNumber,
                    isAcending,
                    pageSize,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching staff accounts:", error);
            throw error;
        }
    },
};
