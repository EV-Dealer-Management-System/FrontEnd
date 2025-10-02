import api from "../Api/Api";
export const login = async (email, password, rememberMe = true) => {
  const response = await api.post("Auth/login-user", {
    email,
    password,
    rememberMe,
  });
  return response.data;
};

export const register = async (email, password, confirmPassword, fullName) => {
  const response = await api.post("/Auth/register-customer", {
    fullName,
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

export const handleResetPassword = async (email) => {
  const response = await api.post("/Auth/forgot-password", { email });
  return response.data;
};

export const handleConfirmResetPassword = async (email, token, newPassword, confirmPassword) => {
  const response = await api.post("/Auth/reset-password", {
    email,
    token,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

export const verifyEmail = async (userId, token) => {
  if (!userId || !token) {
    throw new Error("userId và token là bắt buộc");
  }

  const res = await api.post(
    "/Auth/verify-email",
    null,
    {
      params: { userId, token },
      validateStatus: (s) => s < 500,
    }
  );

  const status = res.status;
  const body = res.data || {};
  const msg = typeof body.message === "string" ? body.message : "";

  if (status === 200) {
    return {
      ok: true,
      outcome: "success",
      message: msg || "Verified",
      status,
      data: body.result,
    };
  }

  if (
    msg === "Email is already verified" ||
    status === 409 ||
    (status === 400 && /already verified/i.test(msg))
  ) {
    return {
      ok: true,
      outcome: "already_verified",
      message: msg || "Email is already verified",
      status,
      data: body.result,
    };
  }

  throw new Error(msg || "Xác thực email thất bại");
};

export const mailConfirmation = async (email) => {
  const res = await api.post("/Auth/send-verification-email", { email });
  return res.data;
};