import { useState, useCallback } from 'react';
import api from '../../../../api/api';

// Hook lấy chi tiết hợp đồng theo ID
const useContractDetails = () => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signProcessId, setSignProcessId] = useState(null);
  const [error, setError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

    // Hàm tải PDF preview
    const loadPdfPreview = async (downloadUrl) => {
    if (!downloadUrl) return null;
    setPdfLoading(true);
    try {
      const response = await api.get('/EContract/preview', {
        params: { downloadUrl },     
        responseType: 'blob'         
      });

      if (response.status === 200) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        // optional: thu hồi URL cũ để tránh rò rỉ
        setPdfBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blobUrl;
        });
        return blobUrl;
      }
      return null;
    } catch (err) {
      console.error('Lỗi khi tải PDF preview:', err);
      message.error('Lỗi khi tải xem trước PDF');
      return null;
    } finally {
      setPdfLoading(false);
    }
  };

  // Kiểm tra có thể ký hợp đồng hay không
  const canSign = !!(detail?.waitingProcess?.id);

  // Hàm clear data khi đóng modal
  const clearDetails = useCallback(() => {
    setDetail(null);
    setSignProcessId(null);
    setError(null);
  }, []);

  // Hàm lấy preview URL
  const getPreviewUrl = useCallback(() => {
    if (!detail?.downloadUrl) return null;
    return `/EContract/preview?downloadUrl=${encodeURIComponent(detail.downloadUrl)}`;
  }, [detail]);

  return {
    detail,
    loading,
    error,
    canSign,
    signProcessId,
    fetchContractDetails,
    clearDetails,
    getPreviewUrl,
    loadPdfPreview,
    pdfBlobUrl,
    pdfLoading
  };
};

export default useContractDetails;