import api from "../../api/api";

const signContract = async (contractId, userId) => {
  try {
    const response = await api.post(`/contracts/${contractId}/sign`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error signing contract:", error);
    throw error;
  }
};

export default {
  signContract
};
