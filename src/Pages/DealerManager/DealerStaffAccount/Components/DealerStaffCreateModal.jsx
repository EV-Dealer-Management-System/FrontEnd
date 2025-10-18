import React, { useState } from "react";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { App } from "antd";
import { createDealerStaff } from "../../../../App/DealerManager/DealerStaff/StaffService";

function DealerStaffCreateModal({ visible, onCancel, onSuccess }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await createDealerStaff(values);

      if (res.isSuccess) {
        message.success("🎉 Tạo nhân viên thành công!");
        onSuccess?.();
      } else {
        message.warning("⚠️ Không thể tạo nhân viên — vui lòng kiểm tra lại thông tin.");
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
        message.error("Email này đã tồn tại trong hệ thống. Vui lòng dùng email khác.");
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
}
 finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      title="Tạo nhân viên mới"
      open={visible}
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
      }}
    >
      <ProFormText
        name="fullName"
        label="Họ và tên"
        placeholder="Nhập họ và tên nhân viên"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      />
      <ProFormText
        name="email"
        label="Email"
        placeholder="Nhập email nhân viên"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      />
      <ProFormText
        name="phoneNumber"
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại" },
          {
            pattern: /^0\d{9}$/,
            message: "Số điện thoại không hợp lệ (phải có 10 chữ số)",
          },
        ]}
      />
    </ModalForm>
  );
}

export default DealerStaffCreateModal;
