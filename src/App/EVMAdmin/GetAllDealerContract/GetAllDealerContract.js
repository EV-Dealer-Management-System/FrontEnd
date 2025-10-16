import api from "../../../api/api";

export const GetAllDealerContract = {
    getAllDealerContracts: async (pageNumber = 1, pageSize = 1000, eContractStatus = 2) => {
        try {
            const params = {
                pageNumber: pageNumber,
                pageSize: pageSize,
                eContractStatus: eContractStatus
            };

            const response = await api.get('/Econtract/get-all-econtract-list', { params });
            
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