import api from "../../../../api/api";

export const mailConfirmation = async (email) => {
  const response = await api.post("/Auth/send-verification-email", { email });
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

    // Gửi request xác thực email
    try {
      const response = await api.post(
        `/Auth/verify-email?userId=${encodeURIComponent(
          userId
        )}&token=${encodeURIComponent(token)}`
      );
      return response.data;
    } catch (error) {
      // Nếu email đã được xác thực, trả về response với message phù hợp
      if (error.response?.data?.message === "Email is already verified") {
        return {
          isSuccess: true,
          message: "Email is already verified",
          statusCode: 200,
          result: null,
        };
      }
      throw error;
    }
  } catch (error) {
    // Nếu là lỗi từ API
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Xác thực email thất bại");
    }
    // Nếu là lỗi khác
    throw error;
  }
};
