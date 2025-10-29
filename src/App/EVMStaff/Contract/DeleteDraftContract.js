import api from "../../../api/api";
import { message } from "antd";

 const deleteDealerContract = async function(contractId) {
    try {
      const response = await api.delete(`/EContract/delete-econtract-draft/${contractId}`, {
      headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting dealer contract:', error);
      message.warning('Xóa hợp đồng đại lý thất bại. Vui lòng thử lại.');
      return {
        success: false,
        error: error.response?.data?.message || 'Có lỗi xảy ra khi xóa hợp đồng đại lý',
      };
    }
  }
  export default deleteDealerContract;