import api from "../../../api/api";
import { useState} from "react";
import { Modal, message } from "antd";

// Hook xác nhận hợp đồng
const useConfirmContract = (contractId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

    // Xác nhận hợp đồng
  const handleConfirmContract = async () => {
    if (!contractId) {
      message.error('Không tìm thấy ID hợp đồng');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận hợp đồng',
      content: 'Bạn có chắc chắn muốn xác nhận hợp đồng này? Sau khi xác nhận, hợp đồng sẽ được gửi đi xét duyệt.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          setLoading(true);
          setError(null);

          const EContractId = contractId;
          const response = await api.post('/EContract/ready-dealer-contracts',null , 
          {
            params: { eContractid: EContractId },
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.data?.isSuccess) {
            setSuccess(true);
            message.success(`Xác nhận hợp đồng thành công! Hợp đồng ${response.data.result?.data?.no || contractNo} đã sẵn sàng ký số.`);
            
            // Sau 3 giây tự động chuyển về tạo hợp đồng mới
            setTimeout(() => {
              resetFormDirect();
            }, 3000);
          } else {
            message.error(response.data?.message || 'Xác nhận hợp đồng thất bại');
            setSuccess(false);
          }
        } catch (error) {
          console.error('Confirm contract error:', error);
          message.error(error.response?.data?.message || error.message || 'Không thể xác nhận hợp đồng');
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    });
  };
  return { handleConfirmContract, loading, error, success };
};
export default useConfirmContract;