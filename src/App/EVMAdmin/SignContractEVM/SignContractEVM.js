import api from "../../../api/api";

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
      const token = await getAccessTokenForEVC();

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
          token: token
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
    getAccessTokenForEVC
  };
};