import React from "react";
import { Card, Descriptions, Badge, Tag } from "antd";
import { CarOutlined } from "@ant-design/icons";

/**
 * Component hiển thị thông tin chi tiết của một item đặt xe
 * @param {Object} item - Thông tin chi tiết đặt xe
 * @param {Object} models - Danh sách mẫu xe
 * @param {Object} versions - Danh sách phiên bản
 * @param {Object} colors - Danh sách màu xe
 */
function BookingItemCard({ item, models, versions, colors }) {
  // Tìm thông tin chi tiết từ ID
  const model = models.find((m) => m.value === item.modelId);
  const version = versions.find((v) => v.value === item.versionId);
  const color = colors.find((c) => c.value === item.colorId);

  return (
    <Card
      size="small"
      bordered={false}
      style={{
        marginBottom: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        borderLeft: "3px solid #1890ff",
      }}
    >
      <Descriptions column={1} size="small" colon={false}>
        <Descriptions.Item
          label={
            <span style={{ color: "#8c8c8c", fontSize: 12 }}>
              <CarOutlined /> Mẫu xe
            </span>
          }
        >
          <strong>{model?.label || "N/A"}</strong>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span style={{ color: "#8c8c8c", fontSize: 12 }}>Phiên bản</span>
          }
        >
          {version?.label || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span style={{ color: "#8c8c8c", fontSize: 12 }}>Màu sắc</span>
          }
        >
          <Tag color="blue">{color?.label || "N/A"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span style={{ color: "#8c8c8c", fontSize: 12 }}>Số lượng</span>
          }
        >
          <Badge count={item.quantity || 0} showZero color="#52c41a" />
          <span style={{ marginLeft: 8 }}>xe</span>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default BookingItemCard;
