import api from "../../../api/api.js";

const contractDetail = {
    // Hàm gọi API lấy chi tiết hợp đồng theo ID
    getContractById: async (contractId) => {
        try {
            const response = await api.get(`/EContract/get-vnpt-econtract-by-id/${contractId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching contract details:", error);
            throw error;
        }
    }
};

export default contractDetail;
