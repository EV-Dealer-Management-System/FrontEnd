import api from "../../../api/api";

export const SignContract = () => {
  // Hàm lấy access token cho EVC
  const getAccessTokenForEVC = async () => {
    try {
      const res = await api.get('/EContract/get-access-token-for-evc');
      const payload = res?.data?.data;
      if(!payload?.accessToken) {
        throw new Error("Không nhận được token từ EVC");
      }
      return { 
        accessToken: payload.accessToken,
        userId: payload.userId
      };
    } catch (error) {
      console.error("Lỗi khi lấy access token:", error);
      throw error;
    }
  };
  // Hàm kiểm tra thông tin SmartCA của user
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

  const handleSignContract = async (contractData) => {
    try {
      const {accessToken} = await getAccessTokenForEVC();

      if (!contractData.signatureImage) {
        throw new Error("Vui lòng tạo chữ ký trước khi ký hợp đồng");
      }

      const pageSign = contractData.contractDetail?.pageSign || 
                      contractData.waitingProcess?.pageSign || 
                      contractData.pageSign || 
                      1; // Default page 1

      const signingPosition = contractData.contractDetail?.positionA || 
                             contractData.waitingProcess?.position || 
                             contractData.positionA || 
                             "50,110,220,180"; // Default position

      // Request body theo đúng schema
      const requestBody = {
        processId: contractData.waitingProcess?.id || contractData.processId || "",
        reason: contractData.reason || "",
        reject: contractData.reject || false,
        otp: contractData.otp || "",
        signatureDisplayMode: contractData.signatureDisplayMode || 0,
        signatureImage: contractData.signatureImage || "",
        signingPage: pageSign,
        signingPosition: signingPosition,
        signatureText: contractData.signatureText || "",
        fontSize: contractData.fontSize || 0,
        showReason: contractData.showReason !== undefined ? contractData.showReason : true,
        confirmTermsConditions: contractData.confirmTermsConditions !== undefined ? contractData.confirmTermsConditions : true
      };

      console.log("Signing contract with data:", {
        pageSign,
        signingPosition,
        processId: requestBody.processId
      });

      // Token được gửi như query parameter theo API doc
      const response = await api.post('/EContract/sign-process', requestBody, {
        params: {
          token: accessToken
        }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi ký hợp đồng:", error);
      
      // Cải thiện error handling
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
      
      throw error;
    }
  };

  return {
    handleSignContract,
    getAccessTokenForEVC,
    handleCheckSmartCA,
    handleAddSmartCA,
    handleUpdateSmartCA
  };
};