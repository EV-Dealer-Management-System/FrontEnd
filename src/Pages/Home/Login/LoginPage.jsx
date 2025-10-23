import React, { useEffect, useState } from "react";
import { Typography, Avatar, Space, Alert, App, Button, Divider } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import {
  LoginForm,
  ProFormText,
  ProFormCheckbox,
  ProCard,
  PageContainer,
} from "@ant-design/pro-components";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { login } from "../../../utils/auth";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const API_BASE = import.meta.env.VITE_API_URL;

  // Đọc lỗi từ query string (?oauthError=...&fromOAuth=1)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const from = sp.get("fromOAuth");
    const err = sp.get("oauthError");
    if (from && err) {
      setLoginError(err);
      // dọn URL cho sạch (không mất alert)
      const url = new URL(window.location.href);
      url.searchParams.delete("oauthError");
      url.searchParams.delete("fromOAuth");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [location.search]);

  // Đăng nhập email/password
  const handleLogin = async (values) => {
    const { email, password, autoLogin } = values || {};
    if (!email || !password) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
     // Trim email và password
    const cleanedEmail = String(email).trim();
    const cleanedPassword = String(password).trim();
    try {
      setLoading(true);
      const res = await login(cleanedEmail, cleanedPassword, autoLogin);

      const tokenStr = res?.result?.accessToken;
      const refresh = res?.result?.refreshToken;
      if (!tokenStr) throw new Error("Token không hợp lệ.");

      localStorage.setItem("jwt_token", tokenStr);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("userFullName", res?.result?.userData?.fullName || "");

      const decoded = jwtDecode(tokenStr);
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.role ||
        (Array.isArray(decoded.roles) ? decoded.roles[0] : undefined);

      message.success(`Chào mừng ${res?.result?.userData?.fullName || ""}!`);

      switch (role) {
        case "Admin":
          navigate("/admin", { replace: true });
          break;
        case "DealerManager":
          navigate("/dealer-manager", { replace: true });
          break;
        case "DealerStaff":
          navigate("/dealer-staff", { replace: true });
          break;
        case "EVMStaff":
          navigate("/evm-staff", { replace: true });
          break;
        default:
          navigate("/customer", { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      const vi =
        msg === "User not found"
          ? "Người dùng không tồn tại"
          : msg || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
      setLoginError(vi);
    } finally {
      setLoading(false);
    }
  };

  // Google login -> BE -> /login-success?ticket=... | ?error=...
  const handleGoogleLogin = () => {
    const returnUrl = `${window.location.origin}/login-success`;
    window.location.href = `${API_BASE}/Auth/signin-google?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <PageContainer ghost>
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: 24,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <ProCard bordered style={{ width: "100%" }} bodyStyle={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar
              size={80}
              style={{
                background: "linear-gradient(90deg,#1677ff,#722ed1)",
                marginBottom: 14,
              }}
              icon={<UserOutlined style={{ fontSize: 34, color: "#fff" }} />}
            />
            <Title level={3} style={{ margin: 0 }}>
              EV Dealer Management System
            </Title>
            <Text type="secondary">Đăng nhập để tiếp tục sử dụng hệ thống</Text>
          </div>

          <LoginForm
            onFinish={handleLogin}
            submitter={{
              searchConfig: { submitText: "Đăng nhập" },
              submitButtonProps: { size: "large", loading },
            }}
            initialValues={{ autoLogin: true }}
            message={loginError ? <Alert message={loginError} type="error" showIcon /> : null}
          >
            <ProFormText
              name="email"
              fieldProps={{ size: "large", prefix: <UserOutlined /> }}
              placeholder="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{ size: "large", prefix: <LockOutlined /> }}
              placeholder="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: -8,
                marginBottom: 8,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                Ghi nhớ đăng nhập
              </ProFormCheckbox>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </LoginForm>

          <Divider plain>Hoặc</Divider>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button block size="large" icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
              Đăng nhập với Google
            </Button>
          </Space>

          <Divider />
        </ProCard>
      </div>
    </PageContainer>
  );
}
