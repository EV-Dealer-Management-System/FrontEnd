import { useState } from "react";
import { Typography, Avatar, Space, message, notification } from "antd";
import { register } from "../../../App/Home/Register/Register.js";
import { useNavigate } from "react-router-dom";
import {
  GoogleOutlined,
  FacebookOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  LoginForm,
  ProFormText,
  ProFormCheckbox,
  ProCard,
  PageContainer,
} from "@ant-design/pro-components";
const { Title } = Typography;

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      const { email, password, confirmPassword, fullName } = values;
      const response = await register(
        email,
        password,
        confirmPassword,
        fullName
      );

      // Log thông tin đăng ký thành công
      console.log("Đăng ký thành công:", {
        email,
        fullName,
        response,
      });

      // Hiển thị thông báo thành công
      notification.success({
        message: "Đăng ký thành công!",
        description:
          "Chúng tôi đã gửi email xác thực đến địa chỉ email của bạn.",
        duration: 3,
      });

      // Chuyển hướng đến trang xác thực email với state
      navigate("/mailconfirm", {
        state: { email: values.email },
      });
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(
          error.response.data.message || "Đăng ký thất bại. Vui lòng thử lại!"
        );
      } else {
        message.error("Đăng ký thất bại. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (type) => {
    message.info(`Đăng ký với ${type} đang được phát triển!`);
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
        <ProCard bordered={false}>
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
              Tạo tài khoản mới
            </Title>
            <Typography.Text type="secondary">
              Đăng ký để trải nghiệm dịch vụ của chúng tôi
            </Typography.Text>
          </div>

          <LoginForm
            onFinish={handleRegister}
            submitter={{
              searchConfig: { submitText: "Đăng ký" },
              submitButtonProps: { size: "large", loading },
            }}
          >
            {/* <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: <UserOutlined />,
              }}
              placeholder="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            /> */}

            <ProFormText
              name="fullName"
              fieldProps={{
                size: "large",
                prefix: <UserOutlined />,
              }}
              placeholder="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên!" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
              ]}
            />

            <ProFormText
              name="email"
              fieldProps={{
                size: "large",
                prefix: <MailOutlined />,
              }}
              placeholder="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            />

            {/* <ProFormText
              name="phone"
              fieldProps={{
                size: "large",
                prefix: <PhoneOutlined />,
              }}
              placeholder="Số điện thoại (tùy chọn)"
            /> */}

            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined />,
              }}
              placeholder="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                {
                  pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                  message:
                    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt!",
                },
              ]}
            />

            <ProFormText.Password
              name="confirmPassword"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined />,
              }}
              placeholder="Xác nhận mật khẩu"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                {
                  pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                  message:
                    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt!",
                },
              ]}
            />

            <ProFormCheckbox
              name="agreement"
              rules={[
                { required: true, message: "Vui lòng đồng ý với điều khoản!" },
              ]}
            >
              Tôi đồng ý với <a href="/terms">điều khoản</a> và{" "}
              <a href="/privacy">chính sách bảo mật</a>
            </ProFormCheckbox>
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
            Đã có tài khoản?{" "}
            <a href="/login" style={{ color: "#1677ff", fontWeight: 500 }}>
              Đăng nhập
            </a>
          </div>
        </ProCard>
      </div>
    </PageContainer>
  );
}

export default RegisterPage;