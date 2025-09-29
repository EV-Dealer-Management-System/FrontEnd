import api from "../../Api/api";

export const SignContract = () => {
  const handleSignContract = async (contractData) => {
    try {
      const params = {
        processId: contractData.waitingProcess?.id || contractData.processId || "",
        reason: contractData.reason || "",
        reject: contractData.reject || false,
        otp: null,
        signatureDisplayMode: contractData.signatureDisplayMode || 2,
        signatureImage: contractData.signatureImage || "",
        signingPage: contractData.signingPage || 0,
        signingPosition: contractData.signingPosition || "",
        signatureText: contractData.signatureText || "",
        fontSize: contractData.fontSize || 0,
        showReason: contractData.showReason !== undefined ? contractData.showReason : true,
        confirmTermsConditions: contractData.confirmTermsConditions !== undefined ? contractData.confirmTermsConditions : true
      };

      const response = await api.post('/EContract/sign-process', params);
      return response.data;
    } catch (error) {
      console.error("Error signing contract:", error);
      throw error;
    }
  };

  return {
    handleSignContract
  };
};