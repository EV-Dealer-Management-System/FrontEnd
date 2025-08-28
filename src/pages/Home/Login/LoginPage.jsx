import { useState } from "react";
import { Typography, Avatar, Space, message } from "antd";
import { login } from "../../../App/Home/Login/Login";
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

  const handleLogin = async (values) => {
    const { username, password } = values;
    if (!username || !password) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const response = await login(username, password);
      // keep the existing console log for debugging
      console.log(response);
      message.success(`Chào mừng ${username}! Đăng nhập thành công!`);
      // TODO: redirect after successful login (handled elsewhere in the app)
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
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
          >
            <ProFormText
              name="username"
              fieldProps={{ size: "large", prefix: <UserOutlined /> }}
              placeholder="Tên đăng nhập hoặc email"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
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
              <a href="/reset-password" className="text-blue-600">
                Quên mật khẩu?
              </a>
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
            <a href="/register" style={{ color: "#1677ff", fontWeight: 500 }}>
              Đăng ký ngay
            </a>
          </div>
        </ProCard>
      </div>
    </PageContainer>
  );
}

export default LoginPage;
