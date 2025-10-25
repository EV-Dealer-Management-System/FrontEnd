import api from "../../../api/api";
import { useState} from "react";
import { App } from "antd";

// Hook xác nhận hợp đồng
const useConfirmContract = (contractId, onSuccess) => {
  const { modal, message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Xác nhận hợp đồng
  const handleConfirmContract = async () => {
    if (!contractId) {
      message.error('Không tìm thấy ID hợp đồng');
      return;
    }
    console.debug('Confirming contract with ID:', contractId);
    modal.confirm({
      title: 'Xác nhận hợp đồng',
      content: 'Bạn có chắc chắn muốn xác nhận hợp đồng này? Sau khi xác nhận, hợp đồng sẽ được gửi đi xét duyệt.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          console.debug('Sending confirm request for contract ID:', contractId);
          setLoading(true);
          setError(null);
          const response = await api.post(
             '/EContract/ready-dealer-contracts',
             null,
             {
               params: { eContractid: contractId }, // chú ý đúng key theo BE
               headers: { 'Content-Type': 'application/json' },
             }
           );
           console.debug('Confirm response:', response);
          if (response.data?.isSuccess) {
            setSuccess(true);
            const no = response.data?.result?.data?.no || contractId;
            message.success(`Hợp đồng ${no} đã được xác nhận thành công`);
            if (onSuccess) {
              console.debug("[ConfirmContract] Trigger onSuccess (delayed)");
              setTimeout(() => onSuccess(), 0);
            }
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
          console.debug('Confirm contract process completed.');
        }
      }
    });
  };
  return { handleConfirmContract, loading, error, success };
};
export default useConfirmContract;