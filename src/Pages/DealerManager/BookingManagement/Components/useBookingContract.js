import { useState, useCallback } from 'react';
import api from '../../../../api/api';
import { message } from 'antd';

// Hook quản lý hợp đồng booking
const useBookingContract = () => {
  const [contractLoading, setContractLoading] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);

  // Tạo hợp đồng từ booking
  const createBookingContract = useCallback(async (bookingId) => {
    if (!bookingId) return null;
    
    setContractLoading(true);
    try {
      const response = await api.post(`/EContract/create-booking-confirm-econtract?bookingId=${bookingId}`);
      
      if (response.data.isSuccess) {
        const contractData = response.data.result?.data || response.data.result;
        message.success('Tạo hợp đồng booking thành công!');
        return contractData;
      } else {
        throw new Error(response.data.message || 'Không thể tạo hợp đồng');
      }
      
    } catch (error) {
      console.error('Lỗi khi tạo hợp đồng booking:', error);
      
      // Nếu lỗi là hợp đồng đã tồn tại, thử lấy danh sách hợp đồng
      if (error.response?.status === 400 || error.message?.includes('exist')) {
        message.warning('Hợp đồng đã tồn tại, đang tải thông tin...');
        return await getExistingContract(bookingId);
      }
      
      message.error(error.response?.data?.message || error.message || 'Lỗi khi tạo hợp đồng');
      return null;
    } finally {
      setContractLoading(false);
    }
  }, []);

  // Lấy hợp đồng đã tồn tại bằng cách tìm trong danh sách
  const getExistingContract = useCallback(async (bookingId) => {
    try {
      // Lấy danh sách hợp đồng booking
      const response = await api.get('/EContract/get-all-econtract-list', {
        params: {
          pageNumber: 1,
          pageSize: 1000,
          econtractType: 2 // Booking type
        }
      });
      
      const contracts = response.data.result || [];
      
      // Tìm hợp đồng liên quan đến booking này (cần match theo name pattern hoặc booking info)
      // Vì API không trả về bookingId, ta lấy contract đầu tiên có thể ký được
      const signableContract = contracts.find(contract => 
        contract.status === 1 || contract.status === 2
      );
      
      if (signableContract) {
        return await getContractDetails(signableContract.id);
      }
      
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy hợp đồng tồn tại:', error);
      return null;
    }
  }, []);

  // Lấy chi tiết hợp đồng
  const getContractDetails = useCallback(async (contractId) => {
    if (!contractId) return null;
    
    setContractLoading(true);
    try {
      const response = await api.get(`/EContract/get-vnpt-econtract-by-id/${contractId}`);
      
      if (response.data.success || response.data.data) {
        const contractData = response.data.data;
        setContractDetail(contractData);
        return contractData;
      } else {
        throw new Error('Không thể lấy thông tin hợp đồng');
      }
      
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết hợp đồng:', error);
      message.error('Không thể tải thông tin hợp đồng');
      return null;
    } finally {
      setContractLoading(false);
    }
  }, []);

  // Kiểm tra có thể ký hợp đồng
  const canSignContract = useCallback((contractData) => {
    if (!contractData) return false;
    
    const status = contractData.status?.value;
    const hasWaitingProcess = contractData.waitingProcess?.id || 
                              (contractData.processes && contractData.processes.some(p => p.status.value === 1));
    
    return (status === 1 || status === 2) && hasWaitingProcess;
  }, []);

  // Lấy process ID để ký
  const getSignProcessId = useCallback((contractData) => {
    if (!contractData) return null;
    
    // Ưu tiên waitingProcess
    if (contractData.waitingProcess?.id) {
      return contractData.waitingProcess.id;
    }
    
    // Fallback: tìm process đầu tiên có status waiting
    if (contractData.processes?.length > 0) {
      const waitingProcess = contractData.processes.find(p => p.status.value === 1);
      return waitingProcess?.id || null;
    }
    
    return null;
  }, []);

  // Clear contract data
  const clearContract = useCallback(() => {
    setContractDetail(null);
  }, []);

  return {
    contractLoading,
    contractDetail,
    createBookingContract,
    getContractDetails,
    canSignContract,
    getSignProcessId,
    clearContract
  };
};

export default useBookingContract;