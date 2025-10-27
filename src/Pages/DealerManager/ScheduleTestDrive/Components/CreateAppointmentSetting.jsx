import React from "react";
import { Card, Alert } from "antd";

// Component tạm thời - đang được phát triển
function CreateAppointmentSetting() {
  return (
    <div className="p-6">
      <Card>
        <Alert
          message="Tính năng đang được phát triển"
          description="Chức năng cài đặt lịch hẹn tạm thời chưa khả dụng. Vui lòng quay lại sau."
          type="warning"
          showIcon
          className="mb-4"
        />
      </Card>
    </div>
  );
}

export default CreateAppointmentSetting;
