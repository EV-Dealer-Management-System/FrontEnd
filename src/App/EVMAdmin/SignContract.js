import api from "../../Api/api";

export const SignContract = () => {
  // Hàm lấy access token cho EVC
  const getAccessTokenForEVC = async () => {
    try {
      const response = await api.get('/EContract/get-access-token-for-evc');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy access token:", error);
      throw error;
    }
  };

  const handleSignContract = async (contractData) => {
    try {
      // Lấy access token trước khi ký hợp đồng
      const token = await getAccessTokenForEVC();

      // Request body theo đúng schema (không có token)
      const requestBody = {
        processId: contractData.waitingProcess?.id || contractData.processId || "",
        reason: contractData.reason || "",
        reject: contractData.reject || false,
        otp: contractData.otp || "",
        signatureDisplayMode: contractData.signatureDisplayMode || 0,
        signatureImage: contractData.signatureImage || "",
        signingPage: contractData.signingPage || 0,
        signingPosition: contractData.signingPosition || "",
        signatureText: contractData.signatureText || "",
        fontSize: contractData.fontSize || 0,
        showReason: contractData.showReason !== undefined ? contractData.showReason : true,
        confirmTermsConditions: contractData.confirmTermsConditions !== undefined ? contractData.confirmTermsConditions : true
      };

      // Token được gửi như query parameter theo API doc
      const response = await api.post('/EContract/sign-process', requestBody, {
        params: {
          token: token
        }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi ký hợp đồng:", error);
      
      // Xử lý các lỗi cụ thể từ server
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("User has not confirmed yet")) {
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
    getAccessTokenForEVC
  };
};