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
import { handleResetPassword } from "../../../../utils/auth";
import SuccessModal from "./Components/SuccessModal";

const { Title, Text, Link } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await handleResetPassword(values.email);

      console.log('Reset password response:', result); // Debug

      // Kiểm tra nhiều trường hợp response
      if (result.success || result.isSuccess || result.succeeded) {
        // Hiển thị modal thành công
        setSubmittedEmail(values.email);
        setModalVisible(true);
      } else {
        // Hiển thị message lỗi
        message.error(result.message || result.Message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Đóng modal và điều hướng về login
  const handleModalClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      navigate("/login");
    }, 500);
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
                backgroundColor: "#1890ff",
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
                  style: {
                    width: "100%",
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none'
                  },
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
      </div>

      {/* Modal thông báo thành công */}
      <SuccessModal
        open={modalVisible}
        email={submittedEmail}
        onClose={handleModalClose}
      />
    </PageContainer>
  );
};

export default ResetPassword;
