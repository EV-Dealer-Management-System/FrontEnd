// emailconfirmation.js
import api from "../../../../Api/api";

/**
 * Gửi email xác thực
 */
export const mailConfirmation = async (email) => {
  const res = await api.post("/Auth/send-verification-email", { email });
  return res.data;
};

/**
 * Lớp lỗi API chuẩn hoá
 */
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Xác thực email theo userId + token
 * Trả về object nhất quán:
 * - ok: boolean
 * - outcome: "success" | "already_verified" (khi ok === true)
 * - message: string
 * - status: number
 * - data: any (tuỳ backend)
 */
export const verifyEmail = async (userId, token) => {
  // Kiểm tra tham số bắt buộc
  if (!userId || !token) {
    throw new ApiError("userId và token là bắt buộc", 400);
  }

  // Gửi request; cho phép 4xx để tự phân luồng (không throw tự động)
  const res = await api.post(
    "/Auth/verify-email",
    null,
    {
      params: { userId, token },
      validateStatus: (s) => s < 500, // chỉ coi 5xx là lỗi mạng/serverside cần throw tự động
    }
  );

  const status = res.status;
  const body = res.data || {};
  const msg = typeof body.message === "string" ? body.message : "";

  // Case 1: xác thực lần đầu thành công (thường 200)
  if (status === 200) {
    return {
      ok: true,
      outcome: "success",
      message: msg || "Verified",
      status,
      data: body.result,
    };
  }

  // Case 2: đã xác thực trước đó (tuỳ backend có thể trả 200/400/409)
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

  // Các lỗi còn lại: ném ApiError để UI hiển thị thông báo lỗi
  throw new ApiError(msg || "Xác thực email thất bại", status);
};
