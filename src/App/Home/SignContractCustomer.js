// Contract.js - Business logic cho xử lý hợp đồng điện tử
import api from "../../api/api";

export const ContractService = () => {
  // Lấy thông tin hợp đồng bằng processCode
  const handleGetContractInfo = async (processCode) => {
    try {
      const response = await api.get(`/EContract/get-info-to-sign-process-by-code`, {
        params: { processCode }
      });
      
      // Parse response data mới với position và pageSign
      const contractData = response.data;
      
      console.log('Contract info response:', contractData);
      
      // Validate required fields including new position and pageSign
      if (!contractData.processId || !contractData.accessToken) {
        throw new Error('Response thiếu thông tin processId hoặc accessToken');
      }
      
      // Validate position và pageSign fields
      if (!contractData.position || !contractData.pageSign) {
        console.warn('Response thiếu position hoặc pageSign, sử dụng giá trị mặc định');
      }
      
      // Ensure position and pageSign are included in the returned data
      const enhancedData = {
        ...contractData,
        position: contractData.position, 
        pageSign: contractData.pageSign 
      };
      
      return {
        success: true,
        data: enhancedData
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

  // Ký hợp đồng điện tử - sử dụng position và pageSign từ contract info
  const handleDigitalSignature = async ({ processId, reason, signatureImage, signatureDisplayMode, accessToken, contractInfo }) => {
    try {
      if (!signatureImage) {
        throw new Error("Vui lòng tạo chữ ký trước khi ký hợp đồng");
      }

      // Lấy pageSign và position từ contract info (response mới)
      // Lấy position và pageSign từ contractInfo response
      const signingPosition = contractInfo?.position || "406,396,576,486"; // Default position từ API mới
      const signingPage = contractInfo?.pageSign || pageSign || 3; // Ưu tiên từ contractInfo, default page 3
      
      console.log('Signing parameters from contractInfo:', {
        position: signingPosition,
        pageSign: signingPage,
        contractInfoPosition: contractInfo?.position,
        contractInfoPageSign: contractInfo?.pageSign
      });

      // Request body theo schema API với position và pageSign từ get-info-to-sign-process-by-code
      const requestBody = {
        processId: processId,
        reason: reason || "Ký hợp đồng điện tử - Khách hàng",
        reject: false,
        otp: "",
        signatureDisplayMode: signatureDisplayMode || 2,
        signatureImage: signatureImage,
        signingPage: signingPage,
        signingPosition: signingPosition,
        signatureText: "Đại Diện Đại Lý",
        fontSize: 14,
        showReason: true,
        confirmTermsConditions: true
      };

      console.log("Customer signing contract with updated data:", {
        pageSign: signingPage,
        signingPosition: signingPosition,
        processId: requestBody.processId,
        fromContractInfo: {
          position: contractInfo?.position,
          pageSign: contractInfo?.pageSign
        },
        requestBody: requestBody
      });

      // Gọi API với access token
      const response = await api.post('/EContract/sign-process', requestBody, {
        params: {
          token: accessToken
        }
      });

      console.log('Customer signature result:', response.data);
      
      if (response.data && response.data.statusCode === 200 && response.data.isSuccess) {
        return {
          success: true,
          data: response.data.result?.data || response.data,
          message: response.data.message || 'Ký điện tử thành công!'
        };
      } else {
        const errorMessage = response.data?.message || 
                         response.data?.result?.messages?.[0] || 
                         'Có lỗi khi ký điện tử';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error in customer digital signature:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Please add a signature image")) {
          throw new Error("Vui lòng thêm chữ ký trước khi ký hợp đồng");
        } else if (errorMessage.includes("User has not confirmed yet")) {
          throw new Error("Người dùng chưa xác nhận. Vui lòng kiểm tra OTP hoặc xác nhận điều khoản trước khi ký.");
        } else if (errorMessage.includes("Lỗi ký số")) {
          throw new Error(`Lỗi ký số: ${errorMessage}`);
        } else {
          throw new Error(errorMessage);
        }
      }
      
      return {
        success: false,
        error: error.message || 'Không thể ký hợp đồng điện tử.'
      };
    }
  };



  // Lấy preview PDF từ token hoặc downloadUrl
  const handleGetPreviewPDF = async (tokenOrUrl) => {
    try {
      // Nếu là URL đầy đủ, thử sử dụng trực tiếp
      if (tokenOrUrl && (tokenOrUrl.startsWith('http') || tokenOrUrl.startsWith('/api'))) {
        console.log('Using direct URL for PDF:', tokenOrUrl);
        return {
          success: true,
          url: tokenOrUrl,
          data: null
        };
      }
      
      // Nếu là token, thử gọi preview API
      if (tokenOrUrl) {
        console.log('Trying preview API with token...');
        const response = await api.get('/EContract/preview', {
          params: { token: tokenOrUrl },
          responseType: 'blob'
        });
        
        return {
          success: true,
          data: response.data,
          url: URL.createObjectURL(response.data)
        };
      }
      
      throw new Error('No token or URL provided');
      
    } catch (error) {
      console.error('Error getting PDF preview:', error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
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

  // Cập nhật SmartCA được chọn - API mới  
  const handleUpdateSmartCA = async (smartCAId, userId, smartCAOwnerName = null) => {
    try {
      console.log('=== UPDATE SMARTCA API CALL - Customer ===');
      
      const requestPayload = {
        id: String(smartCAId),            // Đảm bảo ID là string
        userId: String(userId),           // ID người dùng hiện tại
        isSetDefault: true,               // Mặc định true
        name: smartCAOwnerName || null    // Tên chủ SmartCA hoặc null
      };
      
      console.log('Request payload with types:', {
        id: requestPayload.id + ' (' + typeof requestPayload.id + ')',
        userId: requestPayload.userId + ' (' + typeof requestPayload.userId + ')',
        isSetDefault: requestPayload.isSetDefault + ' (' + typeof requestPayload.isSetDefault + ')',
        name: requestPayload.name + ' (' + typeof requestPayload.name + ')'
      });
      console.log('Full payload:', requestPayload);
      
      const response = await api.post('/EContract/update-smartca', requestPayload);
      
      console.log('Update SmartCA response:', response.data);
      
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật SmartCA thành công'
        };
      }
      
      return {
        success: false,
        error: 'Phản hồi không hợp lệ từ server'
      };
      
    } catch (error) {
      console.error('Error updating SmartCA:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật SmartCA.'
      };
    }
  };

  return {
    // Main API handlers
    handleGetContractInfo,
    handleCheckSmartCA,
    handleAddSmartCA,
    handleUpdateSmartCA,
    handleDigitalSignature,
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
