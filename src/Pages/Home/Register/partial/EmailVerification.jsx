import React, { useEffect, useState } from "react";
import { Result, Button, Spin, notification } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../../../App/Home/Register/Partials/MailConfirmation";
import { PageContainer } from "@ant-design/pro-components";
import { SmileOutlined, FrownOutlined } from "@ant-design/icons";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyUserEmail = async () => {
      console.log("=== Bắt đầu verify email ===", new Date().toISOString());
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const token = urlParams.get("token");

        if (!userId || !token) {
          setVerificationStatus("error");
          setErrorMessage("Link xác thực không hợp lệ.");
          return;
        }

        // Gọi API xác thực với userId và token
        const response = await verifyEmail(userId, token);
        console.log("Response from API:", response);

        // Kiểm tra response
        if (response.message === "Email is already verified") {
          setVerificationStatus("already_verified");
          notification.info({
            message: "Thông báo",
            description: "Email của bạn đã được xác thực trước đó",
            duration: 5,
            placement: "topRight",
            icon: <SmileOutlined style={{ color: "#1890ff" }} />,
          });
        } else if (response.statusCode === 200) {
          setVerificationStatus("success");
          notification.success({
            message: "Thành công",
            description: "Email của bạn đã được xác thực thành công!",
            duration: 5,
            placement: "topRight",
            icon: <SmileOutlined style={{ color: "#52c41a" }} />,
          });
        } else {
          // Các trường hợp lỗi khác
          setVerificationStatus("error");
          setErrorMessage(
            response.message || "Có lỗi xảy ra trong quá trình xác thực email"
          );
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);

        // Xử lý các lỗi khác
        let errorMsg = "Có lỗi xảy ra trong quá trình xác thực email";

        if (error.response?.data?.message) {
          switch (error.response.data.message) {
            case "token expired":
              errorMsg =
                "Link xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực";
              break;
            case "invalid token":
              errorMsg =
                "Link xác thực không hợp lệ. Vui lòng kiểm tra lại email";
              break;
            default:
              errorMsg = error.response.data.message;
          }
        }

        setVerificationStatus("error");
        setErrorMessage(errorMsg);

        // Hiển thị notification lỗi
        notification.error({
          message: "Xác thực email thất bại",
          description: errorMsg,
          duration: 5,
          placement: "topRight",
          icon: <FrownOutlined style={{ color: "#ff4d4f" }} />,
        });
      }
    };

    verifyUserEmail();
  }, [searchParams]); // Theo dõi sự thay đổi của searchParams

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <Result
            icon={<Spin size="large" />}
            title="Đang xác thực email của bạn..."
            subTitle="Vui lòng đợi trong giây lát"
          />
        );

      case "success":
        return (
          <Result
            icon={<SmileOutlined style={{ color: "#52c41a" }} />}
            status="success"
            title="Xác thực email thành công!"
            subTitle="Bạn đã có thể đăng nhập và sử dụng tài khoản"
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

      case "already_verified":
        return (
          <Result
            icon={<SmileOutlined style={{ color: "#52c41a" }} />}
            status="info"
            title="Email đã được xác thực trước đó"
            subTitle="Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."
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
            title="Xác thực email thất bại"
            subTitle={errorMessage}
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => window.location.reload()}
              >
                Thử lại
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

export default EmailVerification;
