// SmartCA.js - Business logic cho quản lý SmartCA của EVM Admin
import api from "../../../api/api";

export const SmartCAService = () => {
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

      console.log('Adding SmartCA with data:', { userId, userName, serialNumber: serialNumber || 'null' });

      // Token được gửi trong query params theo API spec
      const response = await api.post(`/EContract/add-smartca?token=${encodeURIComponent(accessToken)}`, requestBody);
      
      console.log('Add SmartCA response:', response.data);
      
      // Kiểm tra success flag từ response
      if (response.data && response.data.success === true) {
        const smartCAData = response.data.data;
        
        // Kiểm tra xem SmartCA có được thêm thành công không
        const hasValidSmartCA = smartCAData && (
          (smartCAData.defaultSmartCa && smartCAData.defaultSmartCa.isValid) ||
          (smartCAData.userCertificates && smartCAData.userCertificates.length > 0 && 
           smartCAData.userCertificates.some(cert => cert.isValid))
        );

        return {
          success: true,
          data: smartCAData,
          message: response.data.messages?.[0] || 'Thêm SmartCA thành công!',
          hasValidSmartCA: hasValidSmartCA
        };
      } else {
        // Response có success: false
        const errorMessage = response.data.messages?.[0] || 'Thêm SmartCA thất bại';
        console.error('Add SmartCA failed:', errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Error adding SmartCA:', error);
      
      // Xử lý lỗi từ response
      const errorMessage = error.response?.data?.messages?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Không thể thêm SmartCA.';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Utility: Kiểm tra SmartCA có hợp lệ không
  const isSmartCAValid = (smartCAInfo) => {
    if (!smartCAInfo) return false;
    
    // Kiểm tra defaultSmartCa (ưu tiên)
    const hasValidDefaultSmartCA = smartCAInfo.defaultSmartCa && smartCAInfo.defaultSmartCa.isValid;
    
    // Kiểm tra userCertificates
    const hasValidCertificates = smartCAInfo.userCertificates && 
                               smartCAInfo.userCertificates.length > 0 &&
                               smartCAInfo.userCertificates.some(cert => cert.isValid);
    
    // SmartCA hợp lệ nếu có defaultSmartCa hợp lệ HOẶC có certificates hợp lệ
    const isValid = hasValidDefaultSmartCA || hasValidCertificates;
    
    console.log('SmartCA validity check:', {
      smartCAInfo: !!smartCAInfo,
      hasDefaultSmartCA: !!smartCAInfo.defaultSmartCa,
      defaultSmartCAValid: smartCAInfo.defaultSmartCa?.isValid,
      certificateCount: smartCAInfo.userCertificates?.length || 0,
      validCertificates: smartCAInfo.userCertificates?.filter(cert => cert.isValid).length || 0,
      finalResult: isValid
    });
    
    return isValid;
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
    handleCheckSmartCA,
    handleAddSmartCA,
    // Utility functions
    isSmartCAValid,
    validateCCCD,
    formatSmartCAInfo
  };
};