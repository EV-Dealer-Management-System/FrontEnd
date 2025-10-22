import { useState, useCallback } from 'react';
import api from '../../../../api/api';

// Hook lấy chi tiết hợp đồng theo ID
const useContractDetails = () => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signProcessId, setSignProcessId] = useState(null);

  // Hàm gọi API lấy chi tiết hợp đồng
  const fetchContractDetails = useCallback(async (contractId) => {
    if (!contractId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/EContract/get-vnpt-econtract-by-id/${contractId}`);
      const contractData = response.data.data;
      if (!contractData) {
  setDetail(null);
  setSignProcessId(null);
  return;
}
      setDetail(contractData);
      
      // Tìm waitingProcess.id để ký (nếu có)
      if (contractData.waitingProcess?.id) {
        setSignProcessId(contractData.waitingProcess.id);
      } else {
        setSignProcessId(null);
      }

    } catch (error) {
      console.error('Lỗi khi lấy chi tiết hợp đồng:', error);
      setDetail(null);
      setSignProcessId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra có thể ký hợp đồng hay không
  const canSign = !!(detail?.waitingProcess?.id);

  // Hàm clear data khi đóng modal
  const clearDetails = useCallback(() => {
    setDetail(null);
    setSignProcessId(null);
  }, []);

  // Hàm lấy preview URL
  const getPreviewUrl = useCallback(() => {
    if (!detail?.downloadUrl) return null;
    return `/EContract/preview?downloadUrl=${encodeURIComponent(detail.downloadUrl)}`;
  }, [detail]);

  return {
    detail,
    loading,
    canSign,
    signProcessId,
    fetchContractDetails,
    clearDetails,
    getPreviewUrl
  };
};

export default useContractDetails;