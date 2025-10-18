import React, { useState } from "react";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { App, Typography, Space, Divider, Tag } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SmileTwoTone,
  MailTwoTone,
} from "@ant-design/icons";
import { createDealerStaff } from "../../../../App/DealerManager/DealerStaff/StaffService";

const { Text, Title } = Typography;

function DealerStaffCreateModal({ visible, onCancel, onSuccess }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await createDealerStaff(values);

      if (res.isSuccess) {
        message.success({
          content: (
            <>
              🎉 <b>Tạo nhân viên thành công!</b> <br />
              <Text type="secondary">
                Thông tin đăng nhập đã được gửi đến email của nhân viên.
              </Text>
            </>
          ),
          duration: 3,
        });
        onSuccess?.();
      } else {
        message.warning(
          "⚠️ Không thể tạo nhân viên — vui lòng kiểm tra lại thông tin."
        );
      }
    } catch (error) {
      console.error("❌ Lỗi tạo nhân viên:", error);
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message || "";

      switch (status) {
        case 409:
          if (backendMsg.includes("still active at dealer")) {
            message.error(
              "Nhân viên này đang làm việc tại một đại lý khác. " +
                "Vui lòng chọn người khác hoặc yêu cầu họ rời khỏi đại lý cũ trước khi thêm mới."
            );
          } else {
            message.error(
              "Email này đã tồn tại trong hệ thống. Vui lòng dùng email khác."
            );
          }
          break;
        case 400:
          message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
          break;
        case 401:
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          break;
        case 500:
          message.error("Lỗi hệ thống. Vui lòng thử lại sau.");
          break;
        default:
          message.error("Không thể tạo nhân viên. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      title={
        <Space>
          <SmileTwoTone twoToneColor="#52c41a" />
          <span style={{ fontWeight: 600, fontSize: 18 }}>
            Tạo nhân viên mới
          </span>
        </Space>
      }
      open={visible}
      width={550}
      layout="vertical"
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      onFinish={handleSubmit}
      modalProps={{
        okText: "Tạo mới",
        cancelText: "Hủy",
        confirmLoading: loading,
        destroyOnClose: true,
        centered: true,
        maskClosable: false,
        bodyStyle: {
          backgroundColor: "#fafafa",
          borderRadius: 14,
          padding: "16px 28px",
        },
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          padding: "18px 20px",
          background: "linear-gradient(135deg, #e6f7ff, #f0f5ff)",
          borderRadius: 12,
          boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
        }}
      >
        <MailTwoTone twoToneColor="#1677ff" style={{ fontSize: 28 }} />
        <Title
          level={5}
          style={{
            marginTop: 8,
            color: "#1677ff",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          Điền đầy đủ thông tin để tạo tài khoản cho nhân viên đại lý
        </Title>

        <Text
          type="secondary"
          style={{
            fontSize: 13,
            color: "#555",
            display: "block",
            marginTop: 6,
          }}
        >
          💡 Hệ thống sẽ tự động gửi email chứa{" "}
          <span style={{ color: "#52c41a", fontWeight: 600 }}>
            mật khẩu tạm thời
          </span>{" "}
          đến nhân viên sau khi tạo thành công.
        </Text>
      </div>

      <Divider plain style={{ margin: "12px 0" }}>
        <Tag color="blue" style={{ fontSize: 13 }}>
          Thông tin nhân viên
        </Tag>
      </Divider>

      <ProFormText
        name="fullName"
        label="Họ và tên"
        placeholder="VD: Nguyễn Văn A"
        fieldProps={{
          prefix: <UserOutlined style={{ color: "#1677ff" }} />,
          size: "large",
        }}
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      />

      <ProFormText
        name="email"
        label="Email"
        placeholder="VD: nhanvien@daily.vn"
        fieldProps={{
          prefix: <MailOutlined style={{ color: "#fa8c16" }} />,
          size: "large",
        }}
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      />

      <ProFormText
        name="phoneNumber"
        label="Số điện thoại"
        placeholder="VD: 0912345678"
        fieldProps={{
          prefix: <PhoneOutlined style={{ color: "#52c41a" }} />,
          size: "large",
        }}
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^0\d{9}$/,
            message: "Số điện thoại không hợp lệ (phải có 10 chữ số)",
          },
        ]}
      />

      <Divider plain style={{ margin: "16px 0" }} />

      <div
        style={{
          backgroundColor: "#fffbe6",
          borderRadius: 10,
          padding: "10px 14px",
          border: "1px dashed #ffe58f",
          textAlign: "center",
        }}
      >
        <Text type="secondary" style={{ fontSize: 13, color: "#ad8b00" }}>
          ⚠️ Sau khi tạo thành công, nhân viên sẽ nhận được email đăng nhập và
          cần đổi mật khẩu khi đăng nhập lần đầu.
        </Text>
      </div>
    </ModalForm>
  );
}

export default DealerStaffCreateModal;
