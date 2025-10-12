import api from "../../../api/api";
export const GetAllDealerContract = {
    // Lấy tất cả hợp đồng đại lý từ backend API
    getAllDealerContracts: async () => {
        try {
            const response = await api.get('/Econtract/get-econtract-list');
            // Kiểm tra response structure từ backend
            if (response.data?.isSuccess && Array.isArray(response.data.result)) {
                console.log('Loaded dealer contracts from backend:', response.data.result.length);
                return response.data.result;
            }
            console.warn('Backend response không hợp lệ:', response.data);
            return [];
        }
        catch (error) {
            console.error('Lỗi khi tải danh sách hợp đồng đại lý từ backend:', error);
            return [];
        }   
    },
};