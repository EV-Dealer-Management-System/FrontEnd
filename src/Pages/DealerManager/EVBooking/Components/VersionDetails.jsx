import React from "react";
import { Card, Descriptions, Tag, Space, Typography } from "antd";
import {
  ThunderboltOutlined,
  PoweroffOutlined,
  DashboardOutlined,
  RiseOutlined,
  ColumnHeightOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * Component hiển thị thông tin chi tiết của phiên bản xe
 * @param {Object} version - Thông tin phiên bản xe
 */
function VersionDetails({ version }) {
  if (!version) return null;

  return (
    <Card
      size="small"
      bordered={false}
      style={{
        marginTop: 12,
        background: "#f0f5ff",
        border: "1px solid #d6e4ff",
      }}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
          Thông số kỹ thuật
        </Text>

        <Descriptions column={2} size="small" colon={false}>
          <Descriptions.Item
            label={
              <span style={{ fontSize: 12 }}>
                <ThunderboltOutlined /> Công suất
              </span>
            }
            span={1}
          >
            <Tag color="orange">{version.motorPower} W</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ fontSize: 12 }}>
                <PoweroffOutlined /> Pin
              </span>
            }
            span={1}
          >
            <Tag color="green">{version.batteryCapacity} V</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ fontSize: 12 }}>
                <DashboardOutlined /> Tốc độ
              </span>
            }
            span={1}
          >
            <Tag color="red">{version.topSpeed} km/h</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ fontSize: 12 }}>
                <RiseOutlined /> Tầm hoạt động
              </span>
            }
            span={1}
          >
            <Tag color="blue">{version.rangePerCharge} km</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={<span style={{ fontSize: 12 }}>Trọng lượng</span>}
            span={1}
          >
            {version.weight} kg
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ fontSize: 12 }}>
                <ColumnHeightOutlined /> Chiều cao
              </span>
            }
            span={1}
          >
            {version.height} cm
          </Descriptions.Item>

          <Descriptions.Item
            label={<span style={{ fontSize: 12 }}>Năm sản xuất</span>}
            span={2}
          >
            <Tag color="purple">{version.productionYear}</Tag>
          </Descriptions.Item>
        </Descriptions>

        {version.description && (
          <>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FileTextOutlined /> Mô tả:
            </Text>
            <Text style={{ fontSize: 12, fontStyle: "italic" }}>
              {version.description}
            </Text>
          </>
        )}
      </Space>
    </Card>
  );
}

export default VersionDetails;
