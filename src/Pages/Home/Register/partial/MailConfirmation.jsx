import React, { useState, useEffect } from "react";
import { Typography, Result, Space, message, Button, Avatar } from "antd";
import {
  MailOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ProCard, PageContainer } from "@ant-design/pro-components";
// import { resendVerificationEmail } from "../../../../Api/api";
import { useLocation } from "react-router-dom";

const { Text, Title } = Typography;

export const MailConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // countdown in seconds
  const location = useLocation();
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from location state
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [location]);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = () => {
    console.log("Nút đã được click!");
    message.info("Đã nhấn nút gửi lại email");

    // Giả lập loading 1 giây
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      startCountdown();
    }, 1000);
  };

  return (
    <PageContainer>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px" }}>
        <ProCard
          bordered
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 8,
          }}
        >
          <Result
            icon={
              <Avatar
                size={80}
                style={{
                  backgroundColor: "#1677ff",
                  boxShadow: "0 4px 12px rgba(22, 119, 255, 0.2)",
                }}
                icon={<MailOutlined style={{ fontSize: 45 }} />}
              />
            }
            title={
              <Title level={3} style={{ marginBottom: 8 }}>
                Kiểm tra email của bạn
              </Title>
            }
            subTitle={
              <Text type="secondary" style={{ fontSize: 16 }}>
                Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn
              </Text>
            }
            extra={[
              <Button
                key="resend"
                type="primary"
                onClick={handleResendVerification}
                loading={loading}
                disabled={countdown > 0}
                icon={
                  countdown > 0 ? <ClockCircleOutlined /> : <ReloadOutlined />
                }
                size="large"
                style={{
                  minWidth: 180,
                  borderRadius: 6,
                }}
              >
                {countdown > 0
                  ? `Gửi lại sau ${countdown}s`
                  : "Gửi lại email xác thực"}
              </Button>,
            ]}
          />
          <div
            style={{
              marginTop: 24,
              padding: "16px 24px",
              background: "#E6F4FF",
              borderRadius: 8,
              border: "1px solid #91CAFF",
            }}
          >
            <Space align="start">
              <InfoCircleOutlined
                style={{ color: "#1677FF", fontSize: 16, marginTop: 3 }}
              />
              <div>
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  Lưu ý
                </Text>
                <Text type="secondary">
                  Vui lòng kiểm tra cả thư mục spam nếu bạn không nhận được
                  email
                </Text>
              </div>
            </Space>
          </div>
        </ProCard>
      </div>
    </PageContainer>
  );
};