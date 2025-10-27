import React from "react";
import { Card, Alert } from "antd";

// Tạm thời vô hiệu hóa - đang sửa API
function ManageAppointmentSetting() {
  return (
    <div className="p-6">
      <Card>
        <Alert
          message="Tính năng đang được phát triển"
          description="Chức năng quản lý lịch hẹn tạm thời chưa khả dụng. API đang được cập nhật. Vui lòng quay lại sau."
          type="warning"
          showIcon
          className="mb-4"
        />
      </Card>
    </div>
  );
}

export default ManageAppointmentSetting;
