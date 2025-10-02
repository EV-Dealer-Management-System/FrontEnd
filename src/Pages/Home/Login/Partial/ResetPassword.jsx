import React, { useState } from "react";
import {
  ProForm,
  ProFormText,
  PageContainer,
  ProCard,
} from "@ant-design/pro-components";
import { message, Typography, Space, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { handleResetPassword } from "../../../../App/Home/Login/ResetPassword/ResetPassword.js";

const { Title, Text, Link } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    const result = await handleResetPassword(values.email);
    message[result.success ? "success" : "error"](result.message);
    setLoading(false);

    if (result.success) {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <PageContainer
      title={false}
      content={
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2}>Quên mật khẩu</Title>
          <Text type="secondary">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </Text>
        </div>
      }
    >
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px" }}>
        <ProCard
          bordered
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Avatar
              size={64}
              icon={<MailOutlined />}
              style={{
                backgroundColor: "#1677ff",
                marginBottom: "16px",
              }}
            />

            <ProForm
              onFinish={handleSubmit}
              submitter={{
                searchConfig: {
                  submitText: "Gửi yêu cầu",
                },
                submitButtonProps: {
                  loading: loading,
                  size: "large",
                  style: { width: "100%" },
                },
                resetButtonProps: {
                  style: { display: "none" },
                },
              }}
            >
              <ProFormText
                fieldProps={{
                  size: "large",
                  prefix: <MailOutlined className="prefixIcon" />,
                }}
                name="email"
                placeholder="Nhập email của bạn"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}
              />
            </ProForm>

            <div style={{ marginTop: "24px" }}>
              <Space align="center">
                <ArrowLeftOutlined />
                <Link onClick={() => navigate("/login")}>
                  Quay lại trang đăng nhập
                </Link>
              </Space>
            </div>
          </Space>
        </ProCard>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Text type="secondary">
            Chưa có tài khoản?{" "}
            <Link onClick={() => navigate("/register")}>Đăng ký ngay</Link>
          </Text>
        </div>
      </div>
    </PageContainer>
  );
};

export default ResetPassword;
