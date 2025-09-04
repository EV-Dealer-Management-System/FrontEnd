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
      try {
        // Log toàn bộ URL hiện tại
        console.log("Current URL:", window.location.href);
        console.log("Search params:", window.location.search);

        // Lấy parameters từ URL bằng URLSearchParams
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const token = urlParams.get("token");

        // Log chi tiết parameters
        console.log("Extracted Parameters:", {
          userId,
          token,
          allParams: Object.fromEntries(urlParams.entries()),
        });

        console.log("Thông tin xác thực:", { userId, token });

        if (!userId || !token) {
          setVerificationStatus("error");
          setErrorMessage("Link xác thực không hợp lệ.");
          return;
        }

        // Gọi API xác thực với userId và token
        const response = await verifyEmail(userId, token);
        console.log("Response từ API:", response);

        console.log("Kiểm tra response:", {
          response,
          isSuccess: response.isSuccess,
          message: response.message,
        });

        // Kiểm tra response trực tiếp từ API
        if (response && response.isSuccess === true) {
          notification.success({
            message: "Xác thực email thành công!",
            description:
              response.message ||
              "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.",
            duration: 5,
            placement: "topRight",
            icon: <SmileOutlined style={{ color: "#52c41a" }} />,
          });
          setVerificationStatus("success");
          return; // Thoát khỏi hàm nếu thành công
        }

        // Nếu không thành công, xử lý như lỗi
        setVerificationStatus("error");
        setErrorMessage(response.message || "Xác thực email thất bại");
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setVerificationStatus("error");
        setErrorMessage("Có lỗi xảy ra trong quá trình xác thực email.");

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
  }, [searchParams]);

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
