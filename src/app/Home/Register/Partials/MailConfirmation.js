import api from "../../../../api/api";

export const mailConfirmation = async (email) => {
  const response = await api.post("/Auth/verify-email", { email });
  return response.data;
};

export const verifyEmail = async (userId, token) => {
  try {
    // Kiểm tra tham số đầu vào
    if (!userId || !token) {
      throw new Error("userId và token là bắt buộc");
    }

    console.log("Sending request with:", {
      userId,
      token,
    });

    // Gửi POST request với query parameters
    const response = await api.post(
      `/Auth/verify-email?userId=${encodeURIComponent(
        userId
      )}&token=${encodeURIComponent(token)}`
    );

    console.log("Verification response:", response.data);
    return response.data;
  } catch (error) {
    // Log chi tiết lỗi
    console.error("Verification error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
