
import api from './../../../../Api/api';

export const handleResetPassword = async (email) => {
  try {
    await api.post("Auth/forgot-password", {
      email: email,
    });
    return {
      success: true,
      message: "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu",
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau",
    };
  }
};

export const handleConfirmResetPassword = async (
  userId,
  token,
  password,
  confirmPassword
) => {
  try {
    console.log("Reset password request data:", {
      userId,
      token,
      password,
      confirmPassword,
    });

    const response = await api.post("Auth/reset-password", {
      userId: userId,
      token: token,
      password: password,
      confirmPassword: confirmPassword,
    });

    console.log("Reset password response:", response);

    if (response.data) {
      return {
        statusCode: response.data.statusCode || 200,
        success: true,
        message: response.data.message || "Đặt lại mật khẩu thành công",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Đặt lại mật khẩu thành công",
    };
  } catch (error) {
    console.error("Reset password error details:", {
      error: error,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
