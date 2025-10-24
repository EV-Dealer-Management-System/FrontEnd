import React from "react";
import { Button, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// Không sử dụng hooks - chỉ là utility function trả về config object
function getPageHeaderConfig({ totalQuotes = 0, onRefresh, onCreateNew }) {
  return {
    title: (
      <div className="flex items-center gap-3">
        <FileTextOutlined className="text-3xl text-blue-600" />
        <span className="text-2xl font-bold text-gray-800">
          Quản lý báo giá xe điện
        </span>
      </div>
    ),
    subTitle: (
      <span className="text-gray-500">
        Tổng số báo giá:{" "}
        <span className="font-semibold text-blue-600">{totalQuotes}</span>
      </span>
    ),
    extra: (
      <Space>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Làm mới
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          Tạo báo giá mới
        </Button>
      </Space>
    ),
  };
}

export default getPageHeaderConfig;
