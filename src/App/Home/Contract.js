// Contract.js - Business logic cho xử lý hợp đồng điện tử
import api from "../../Api/api";
import { SignContract } from "../EVMAdmin/SignContract";

export const ContractService = () => {
  // Lấy thông tin hợp đồng bằng processCode
  const handleGetContractInfo = async (processCode) => {
    try {
      const response = await api.get(`/EContract/get-info-to-sign-process-by-code`, {
        params: { processCode }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy thông tin hợp đồng. Vui lòng kiểm tra mã process.'
      };
    }
  };

  // Kiểm tra thông tin SmartCA của user
  const handleCheckSmartCA = async (userId) => {
    try {
      const response = await api.get(`/EContract/smartca-info/${userId}`);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error checking SmartCA:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể kiểm tra thông tin SmartCA.'
      };
    }
  };

  // Thêm SmartCA cho user - Token trong query params như API spec
  const handleAddSmartCA = async ({ userId, userName, serialNumber, accessToken }) => {
    try {
      const requestBody = {
        userId: userId,
        userName: userName,
        serialNumber: serialNumber || null
      };

      // Token được gửi trong query params theo API spec
      const response = await api.post(`/EContract/add-smartca?token=${encodeURIComponent(accessToken)}`, requestBody);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.messages?.[0] || 'Thêm SmartCA thành công!'
        };
      } else {
        throw new Error(response.data.messages?.[0] || 'Thêm SmartCA thất bại');
      }
    } catch (error) {
      console.error('Error adding SmartCA:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể thêm SmartCA.'
      };
    }
  };

  // Ký hợp đồng sử dụng SignContract service
  const handleSignContract = async ({ processId, reason, otp, signatureText, accessToken }) => {
    try {
      const signContractService = SignContract();
      
      // Chuẩn bị data theo format của SignContract
      const contractData = {
        processId: processId,
        reason: reason || "Đồng ý ký hợp đồng",
        reject: false,
        otp: otp,
        signatureDisplayMode: 0,
        signatureImage: null,
        signingPage: 0,
        signingPosition: "",
        signatureText: signatureText || "",
        fontSize: 12,
        showReason: true,
        confirmTermsConditions: true
      };

      // Gọi handleSignContract từ SignContract service
      const result = await signContractService.handleSignContract(contractData);
      
      if (result.isSuccess) {
        return {
          success: true,
          data: result.result?.data || result,
          message: result.message || 'Ký hợp đồng thành công!'
        };
      } else {
        throw new Error(result.message || 'Ký hợp đồng thất bại');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể ký hợp đồng.'
      };
    }
  };

  // Lấy preview PDF từ token
  const handleGetPreviewPDF = async (token) => {
    try {
      const response = await api.get('/EContract/preview', {
        params: { token },
        responseType: 'blob' // Để nhận PDF file
      });
      
      return {
        success: true,
        data: response.data,
        url: URL.createObjectURL(response.data)
      };
    } catch (error) {
      console.error('Error getting PDF preview:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể lấy preview PDF.'
      };
    }
  };

  // Utility: Tạo URL preview từ downloadUrl
  const getPreviewUrl = (downloadUrl) => {
    try {
      const urlParams = new URLSearchParams(downloadUrl.split('?')[1]);
      const token = urlParams.get('token');
      
      // Trả về relative URL cho axios
      return `/api/EContract/preview?token=${encodeURIComponent(token)}`;
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return downloadUrl;
    }
  };

  // Utility: Kiểm tra SmartCA có hợp lệ không
  const isSmartCAValid = (smartCAInfo) => {
    if (!smartCAInfo) return false;
    return smartCAInfo.isValid && 
           smartCAInfo.userCertificates && 
           smartCAInfo.userCertificates.length > 0 &&
           smartCAInfo.userCertificates.some(cert => cert.isValid);
  };

  // Utility: Validate processCode
  const validateProcessCode = (processCode) => {
    if (!processCode) {
      return { valid: false, message: 'Vui lòng nhập mã process!' };
    }
    if (processCode.length < 6) {
      return { valid: false, message: 'Mã process phải có ít nhất 6 ký tự!' };
    }
    return { valid: true, message: '' };
  };

  // Utility: Validate CCCD
  const validateCCCD = (cccd) => {
    if (!cccd) {
      return { valid: false, message: 'Vui lòng nhập số CCCD!' };
    }
    const cccdPattern = /^[0-9]{9,12}$/;
    if (!cccdPattern.test(cccd)) {
      return { valid: false, message: 'Số CCCD phải từ 9-12 chữ số!' };
    }
    return { valid: true, message: '' };
  };

  // Utility: Validate OTP
  const validateOTP = (otp) => {
    if (!otp) {
      return { valid: false, message: 'Vui lòng nhập mã OTP!' };
    }
    if (otp.length !== 6) {
      return { valid: false, message: 'Mã OTP phải có đúng 6 ký tự!' };
    }
    const otpPattern = /^[0-9]{6}$/;
    if (!otpPattern.test(otp)) {
      return { valid: false, message: 'Mã OTP phải là 6 chữ số!' };
    }
    return { valid: true, message: '' };
  };

  // Utility: Xác định bước tiếp theo
  const determineNextStep = (contractInfo, smartCAInfo) => {
    if (!contractInfo) return 0; // Nhập mã process
    if (!smartCAInfo) return 1; // Loading SmartCA info
    if (!isSmartCAValid(smartCAInfo)) return 2; // Cần thêm SmartCA
    return 3; // Sẵn sàng ký hợp đồng
  };

  // Utility: Format thông tin SmartCA
  const formatSmartCAInfo = (smartCAInfo) => {
    if (!smartCAInfo) return null;
    
    return {
      name: smartCAInfo.name || 'Không có thông tin',
      email: smartCAInfo.email || 'Không có thông tin',
      phone: smartCAInfo.phone || 'Không có thông tin',
      isValid: smartCAInfo.isValid || false,
      status: smartCAInfo.isValid ? 'Hợp lệ' : 'Chưa hợp lệ',
      statusType: smartCAInfo.isValid ? 'success' : 'error',
      certificateCount: smartCAInfo.userCertificates?.length || 0,
      certificates: smartCAInfo.userCertificates || [],
      defaultSmartCa: smartCAInfo.defaultSmartCa || null
    };
  };

  return {
    // Main API handlers
    handleGetContractInfo,
    handleCheckSmartCA,
    handleAddSmartCA,
    handleSignContract,
    handleGetPreviewPDF,
    
    // Utility functions
    getPreviewUrl,
    isSmartCAValid,
    validateProcessCode,
    validateCCCD,
    validateOTP,
    determineNextStep,
    formatSmartCAInfo
  };
};
