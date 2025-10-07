import { useState } from "react";
import { Typography, Avatar, Space, Alert, App } from "antd";
const { useApp } = App;
import { login } from "../../../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  GoogleOutlined,
  FacebookOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  LoginForm,
  ProFormText,
  ProFormCheckbox,
  ProCard,
  PageContainer,
} from "@ant-design/pro-components";

const { Title, Text } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { message } = useApp();

  const handleLogin = async (values) => {
    const { email, password, autoLogin } = values;
    if (!email || !password) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password, autoLogin);
      
      // Kiểm tra đơn giản
      if (!response || !response.result) {
        throw new Error("Response không đúng định dạng");
      }

      // Destructuring để tránh lỗi trên production
      const { accessToken, userData } = response.result;
      
      // Lưu token
      localStorage.setItem("jwt_token", accessToken);
      
      // Lưu tên user
      const fullName = userData ? userData.fullName : "";
      if (fullName) {
        localStorage.setItem("userFullName", fullName);
      }
      
      message.success(`Chào mừng ${fullName || "người dùng"}! Đăng nhập thành công!`);
      
      // Redirect to customer dashboard after login
      navigate("/customer", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      // Xóa thông báo lỗi cũ nếu có
      setLoginError("");

      // Xử lý các trường hợp lỗi cụ thể
      if (err.response?.data?.message === "Email is not exist") {
        setLoginError(
          "Email không tồn tại trong hệ thống! Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới."
        );
      } else if (
        err.response?.data?.message.includes("Password is incorrect")
      ) {
        const message = err.response?.data?.message;
        // Kiểm tra nếu có thông báo về số lần thử còn lại
        if (message.includes("If you enter")) {
          const attemptsLeft = 5; // Số này nên được lấy từ server response nếu có
          setLoginError(
            `Mật khẩu không đúng! Nếu nhập sai thêm ${attemptsLeft} lần nữa, tài khoản của bạn sẽ bị khóa trong 5 phút.`
          );
        } else {
          setLoginError(
            "Mật khẩu không đúng! Vui lòng kiểm tra lại hoặc sử dụng tính năng quên mật khẩu."
          );
        }
      } else if (err.response?.status === 400) {
        // Nếu có message từ server, hiển thị nó
        if (err.response?.data?.message) {
          setLoginError(err.response.data.message);
        } else {
          setLoginError(
            "Thông tin đăng nhập không hợp lệ! Vui lòng kiểm tra lại."
          );
        }
      } else if (err.response?.status === 401) {
        setLoginError(
          "Phiên đăng nhập đã hết hạn hoặc không hợp lệ! Vui lòng đăng nhập lại."
        );
      } else if (err.response?.status === 403) {
        // Xử lý trường hợp tài khoản bị khóa
const message = err.response?.data?.message || "";
        const minutes = message.match(/\d+/)?.[0] || "vài"; // Lấy số phút từ thông báo
        setLoginError(
          `Tài khoản đã bị khóa. Vui lòng thử lại sau ${minutes} phút.`
        );
      } else if (err.response?.status === 429) {
        setLoginError(
          "Bạn đã thử đăng nhập quá nhiều lần! Vui lòng thử lại sau ít phút."
        );
      } else if (!navigator.onLine) {
        setLoginError(
          "Không thể kết nối đến máy chủ! Vui lòng kiểm tra kết nối internet của bạn."
        );
      } else {
        // Log chi tiết lỗi để debug
        console.log("Response data:", err.response?.data);
        console.log("Response status:", err.response?.status);

        setLoginError(
          "Đã có lỗi xảy ra trong quá trình đăng nhập! Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
        );
      }

      // Error will be displayed in the Alert component below the form
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (type) => {
    message.info(`Đăng nhập với ${type} đang được phát triển!`);
  };

  return (
    <PageContainer>
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "24px",
          marginTop: "40px",
        }}
      >
        <ProCard bordered={false} className="login-card">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Avatar
              size={72}
              style={{
                background: "linear-gradient(90deg,#1677ff,#722ed1)",
                marginBottom: "16px",
              }}
              icon={<UserOutlined style={{ color: "#fff", fontSize: 28 }} />}
            />
            <Title level={3} style={{ margin: 0 }}>
              Chào mừng trở lại
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
            // Hiển thị thông báo lỗi
            message={
              loginError ? (
                <Alert message={loginError} type="error" showIcon />
              ) : null
            }
          >
            <ProFormText
              name="email"
              fieldProps={{ size: "large", prefix: <UserOutlined /> }}
              placeholder="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                {
                  type: "email",
                  message: "Vui lòng nhập đúng định dạng email!",
},
]}
/>

<ProFormText.Password
name="password"
fieldProps={{ size: "large", prefix: <LockOutlined /> }}
placeholder="Mật khẩu"
rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
/>

<div className="flex items-center justify-between">
<ProFormCheckbox noStyle name="autoLogin">
  Ghi nhớ đăng nhập
</ProFormCheckbox>
<Link to="/forgot-password" className="text-blue-600">
  Quên mật khẩu?
</Link>
</div>
</LoginForm>

<div style={{ marginTop: "24px" }}>
<Space direction="vertical" style={{ width: "100%" }}>
<div style={{ textAlign: "center", color: "#8c8c8c" }}>
  Hoặc tiếp tục với
</div>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginTop: "16px",
  }}
>
  <Avatar
    className="social-button"
    style={{
      backgroundColor: "#fff",
      cursor: "pointer",
      border: "1px solid #d9d9d9",
    }}
    icon={
      <img
        src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
        alt="Google"
        style={{ width: "18px", height: "18px" }}
      />
    }
    onClick={() => handleSocialLogin("Google")}
  />
  <Avatar
    className="social-button"
    style={{
      backgroundColor: "#1877f2",
      cursor: "pointer",
    }}
    icon={
      <FacebookOutlined style={{ fontSize: 20, color: "#fff" }} />
    }
    onClick={() => handleSocialLogin("Facebook")}
  />
</div>
</Space>
</div>

<div
style={{
textAlign: "center",
marginTop: "24px",
fontSize: "14px",
color: "#8c8c8c",
}}
>
Chưa có tài khoản?{" "}
<Link to="/register" style={{ color: "#1677ff", fontWeight: 500 }}>
Đăng ký ngay
</Link>
</div>
</ProCard>
</div>
</PageContainer>
);
}

export default LoginPage;