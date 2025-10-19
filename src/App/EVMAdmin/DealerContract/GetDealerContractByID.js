import api from "../../../api/api";
export const GetDealerContractByID = {
    // Lấy hợp đồng đại lý theo ID từ backend API
    getDealerContractByID: async (eContractId) => {
        try {
            const response = await api.get(`/EContract/get-vnpt-econtract-by-id/${eContractId}`);
            if (response.data?.success && response.data.data) {
                console.log('Loaded dealer contract by ID from backend:', response.data.data);
                return response.data.data;
            }
            console.warn('Backend response không hợp lệ:', response.data);
            return null;
        }
        catch (error) {
            console.error('Lỗi khi tải hợp đồng đại lý từ backend:', error);
            return null;
        }
    },
};
