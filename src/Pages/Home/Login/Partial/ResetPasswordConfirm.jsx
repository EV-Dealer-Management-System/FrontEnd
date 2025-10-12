import React, { useEffect, useState } from "react";
import { Result, Button, Spin, notification, Form, Input } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "@ant-design/pro-components";
import { SmileOutlined, FrownOutlined, LockOutlined } from "@ant-design/icons";
import { handleConfirmResetPassword } from "../../../../utils/auth";

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [resetStatus, setResetStatus] = useState("verifying"); // 'verifying', 'ready', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyResetToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const token = urlParams.get("token");

        if (!userId || !token) {
          setResetStatus("error");
          setErrorMessage("Link đặt lại mật khẩu không hợp lệ.");
          return;
        }

        // Verify token validity here if needed
        setResetStatus("ready");
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setResetStatus("error");
        setErrorMessage(
          "Có lỗi xảy ra trong quá trình xác thực link đặt lại mật khẩu"
        );
      }
    };

    verifyResetToken();
  }, [searchParams]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");
      const token = urlParams.get("token");

      const response = await handleConfirmResetPassword(
        userId,
        token,
        values.password,
        values.confirmPassword
      );

      if (response.statusCode === 200) {
        setResetStatus("success");
        notification.success({
          message: "Thành công",
          description: "Mật khẩu của bạn đã được đặt lại thành công!",
          duration: 5,
          placement: "topRight",
          icon: <SmileOutlined style={{ color: "#52c41a" }} />,
        });
      } else {
        throw new Error(
          response.message || "Có lỗi xảy ra trong quá trình đặt lại mật khẩu"
        );
      }
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);

      let errorMsg = "Có lỗi xảy ra trong quá trình đặt lại mật khẩu";

      if (error.response?.data) {
        // Log error details
        console.log("Error response data:", error.response.data);

        if (error.response.status === 400) {
          // Handle validation errors
          if (error.response.data.errors) {
            const errors = error.response.data.errors;
            errorMsg = Object.values(errors).join(", ");
          } else if (error.response.data.message) {
            errorMsg = error.response.data.message;
          }
        } else {
          switch (error.response.data.message) {
            case "token expired":
              errorMsg =
                "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu gửi lại email";
              break;
            case "invalid token":
              errorMsg =
                "Link đặt lại mật khẩu không hợp lệ. Vui lòng kiểm tra lại email";
              break;
            default:
              errorMsg =
                error.response.data.message ||
                "Có lỗi xảy ra trong quá trình đặt lại mật khẩu";
          }
        }
      }

      setResetStatus("error");
      setErrorMessage(errorMsg);

      notification.error({
        message: "Đặt lại mật khẩu thất bại",
        description: errorMsg,
        duration: 5,
        placement: "topRight",
        icon: <FrownOutlined style={{ color: "#ff4d4f" }} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (resetStatus) {
      case "verifying":
        return (
          <Result
            icon={<Spin size="large" />}
            title="Đang xác thực link đặt lại mật khẩu..."
            subTitle="Vui lòng đợi trong giây lát"
          />
        );

      case "ready":
        return (
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <Result
              status="info"
              title="Đặt lại mật khẩu mới"
              subTitle="Vui lòng nhập mật khẩu mới cho tài khoản của bạn"
            />
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              style={{ padding: "24px" }}
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu mới"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </div>
        );

      case "success":
        return (
          <Result
            icon={<SmileOutlined style={{ color: "#52c41a" }} />}
            status="success"
            title="Đặt lại mật khẩu thành công!"
            subTitle="Bạn có thể đăng nhập với mật khẩu mới"
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate("/login")}
              >
                Đăng nhập ngay
              </Button>,
            ]}
          />
        );

      case "error":
        return (
          <Result
            icon={<FrownOutlined style={{ color: "#ff4d4f" }} />}
            status="error"
            title="Đặt lại mật khẩu thất bại"
            subTitle={errorMessage}
            extra={[
              <Button key="back" onClick={() => navigate("/reset-password")}>
                Yêu cầu link mới
              </Button>,
              <Button key="support" onClick={() => navigate("/support")}>
                Liên hệ hỗ trợ
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
        {renderContent()}
      </div>
    </PageContainer>
  );
};

export default ResetPasswordConfirm;
