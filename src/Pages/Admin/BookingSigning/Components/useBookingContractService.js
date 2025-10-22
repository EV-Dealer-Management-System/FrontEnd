// Reuse ContractService cho Admin Booking
import { ContractService } from '../../../../App/Home/SignContractCustomer';
import { SignContract } from '../../../../App/EVMAdmin/SignContractEVM/SignContractEVM';

// Service tái sử dụng các tính năng ký hợp đồng đã có
export const useBookingContractService = () => {
  const contractService = ContractService();
  const evmSignService = SignContract();

  // Tích hợp logic ký cho Admin từ EVMAdmin service
  const signBookingContract = async (signData) => {
    try {
      // Sử dụng logic từ SignContractEVM cho Admin
      const contractSignData = {
        processId: signData.processId,
        reason: signData.reason || 'Admin approval for booking contract',
        reject: false,
        otp: signData.otp || '',
        signatureDisplayMode: signData.signatureDisplayMode || 0,
        signatureImage: signData.signatureImage || '',
        signingPage: signData.signingPage || 0,
        signingPosition: signData.signingPosition || '',
        signatureText: signData.signatureText || 'Đã ký bởi Quản Lý Hãng',
        fontSize: signData.fontSize || 12,
        showReason: true,
        confirmTermsConditions: true,
        // Thêm các field từ booking contract detail
        waitingProcess: { 
          id: signData.processId,
          pageSign: signData.signingPage,
          position: signData.signingPosition
        }
      };

      const result = await evmSignService.handleSignContract(contractSignData);
      return {
        success: true,
        data: result,
        message: 'Ký hợp đồng booking thành công!'
      };
    } catch (error) {
      console.error('Lỗi khi ký hợp đồng booking:', error);
      throw new Error(error.message || 'Lỗi khi ký hợp đồng');
    }
  };

  // Tích hợp logic từ chối hợp đồng
  const rejectBookingContract = async (processId, reason = 'Admin rejection') => {
    try {
      const contractSignData = {
        processId: processId,
        reason: reason,
        reject: true, // true = từ chối
        otp: '',
        signatureDisplayMode: 0,
        signatureImage: '',
        signingPage: 0,
        signingPosition: '',
        signatureText: '',
        fontSize: 0,
        showReason: true,
        confirmTermsConditions: true,
        waitingProcess: { id: processId }
      };

      const result = await evmSignService.handleSignContract(contractSignData);
      return {
        success: true,
        data: result,
        message: 'Từ chối hợp đồng booking thành công!'
      };
    } catch (error) {
      console.error('Lỗi khi từ chối hợp đồng booking:', error);
      throw new Error(error.message || 'Lỗi khi từ chối hợp đồng');
    }
  };

  // Tái sử dụng logic lấy access token từ EVM service
  const getAccessToken = async () => {
    try {
      return await evmSignService.getAccessTokenForEVC();
    } catch (error) {
      console.error('Lỗi khi lấy access token:', error);
      throw error;
    }
  };

  return {
    signBookingContract,
    rejectBookingContract,
    getAccessToken,
    // Export các service gốc để sử dụng nếu cần
    contractService,
    evmSignService
  };
};

export default useBookingContractService;