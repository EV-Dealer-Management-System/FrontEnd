import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { App, Spin } from "antd";

function mapErrorToVI(err) {
  if (!err) return null;
  const e = String(err).toLowerCase();

  if (e.includes("user not found")) return "Người dùng không tồn tại";
  if (e.includes("access denied") || e.includes("forbidden")) return "Từ chối truy cập";
  if (e.includes("cancel")) return "Bạn đã hủy đăng nhập Google";
  if (e.includes("unauthorized")) return "Không được phép truy cập";
  if (e.includes("google auth failed") || e.includes("google login failed"))
    return "Đăng nhập Google không thành công. Vui lòng thử lại.";
  return typeof err === "string"
    ? err
    : "Đăng nhập Google không thành công. Vui lòng thử lại.";
}

export default function LoginSuccess() {
  const navigate = useNavigate();
  const { message } = App.useApp?.() || { message: { success: () => {} } };
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);

    // 1) Nhánh lỗi từ BE -> đẩy lỗi về trang / qua query string (không dùng state)
    const err = qs.get("error");
    if (err) {
      const vi = mapErrorToVI(err);
      // đẩy về /?oauthError=...&fromOAuth=1
      const url = `/?oauthError=${encodeURIComponent(vi)}&fromOAuth=1`;
      window.location.replace(url);
      return;
    }

    // 2) Không có ticket (ai đó gõ tay /login-success) -> quay về login
    const ticket = qs.get("ticket");
    if (!ticket) {
      window.location.replace("/");
      return;
    }

    // 3) Có ticket -> exchange lấy token, điều hướng theo role
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE}/Auth/exchange?ticket=${encodeURIComponent(ticket)}`
        );
        const data = await r.json().catch(() => ({}));

        const token =
          data.accessToken || data.AccessToken ||
          data.result?.accessToken || data.Result?.AccessToken;

        const refresh =
          data.refreshToken || data.RefreshToken ||
          data.result?.refreshToken || data.Result?.RefreshToken;

        if (!token) {
          return;
        }

        localStorage.setItem("jwt_token", token);
        if (refresh) localStorage.setItem("refresh_token", refresh);

        const d = jwtDecode(token);
        const role =
          d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          d.role ||
          (Array.isArray(d.roles) ? d.roles[0] : undefined);
        const fullName = d.FullName || d.name || "";
        localStorage.setItem("userFullName", fullName);

        let target = "/";
        if (role === "Admin") target = "/admin";
        else if (role === "DealerManager") target = "/dealer-manager";
        else if (role === "DealerStaff") target = "/dealer-staff";
        else if (role === "EVMStaff") target = "/evm-staff";

        // dứt điểm, không lóe UI
        window.location.replace(target);
      } catch {
        window.location.replace(
          "/?oauthError=" +
          encodeURIComponent("Không thể kết nối máy chủ. Vui lòng thử lại.") +
          "&fromOAuth=1"
        );
      }
    })();
  }, [navigate, message, API_BASE]);

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <Spin tip="Đang đăng nhập..." />
    </div>
  );
}