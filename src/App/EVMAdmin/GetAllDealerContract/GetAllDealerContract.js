import api from "../../../api/api";

export const GetAllDealerContract = {
    // Lấy tất cả hợp đồng đại lý từ backend API với query parameters
    getAllDealerContracts: async (pageNumber = 1, pageSize = 1000, eContractStatus = 2) => {
        try {
            // Tạo query parameters - mặc định lấy status = 2 (Sẵn sàng)
            const params = {
                pageNumber: pageNumber,
                pageSize: pageSize,
                eContractStatus: eContractStatus
            };

            const response = await api.get('/Econtract/get-all-econtract-list', { params });
            
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