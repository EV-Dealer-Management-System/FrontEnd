import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
        tip="Đang tải dữ liệu..."
        size="large"
      />
    </div>
  );
}

export default LoadingSpinner;
