import React, { useState } from "react";
import {
  ProFormSelect,
  ProFormDigit,
  ProForm,
} from "@ant-design/pro-components";
import { Card, Space, Typography, Row, Col } from "antd";
import { CarOutlined } from "@ant-design/icons";
import VersionDetails from "./VersionDetails";

const { Text } = Typography;

/**
 * Component để chọn thông tin xe (mẫu, phiên bản, màu, số lượng)
 * @param {Array} models - Danh sách mẫu xe
 * @param {Array} versions - Danh sách phiên bản
 * @param {Array} colors - Danh sách màu xe
 * @param {Function} onModelChange - Callback khi thay đổi mẫu xe
 * @param {Object} formRef - Reference của form chính
 * @param {Number} index - Index của item trong list
 */
function VehicleSelector({
  models,
  versions,
  colors,
  onModelChange,
  formRef,
  index,
}) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  return (
    <Card
      size="small"
      bordered={false}
      style={{
        marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderRadius: 8,
      }}
      title={
        <Space size={8}>
          <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
          <Text strong style={{ fontSize: 14 }}>
            Xe #{index + 1}
          </Text>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <ProFormSelect
            name="modelId"
            label="Mẫu xe"
            options={models}
            placeholder="Chọn mẫu xe"
            rules={[{ required: true, message: "Vui lòng chọn mẫu xe" }]}
            fieldProps={{
              showSearch: true,
              optionFilterProp: "label",
              onChange: (value) => {
                // Reset version khi đổi model
                setSelectedVersion(null);
                if (onModelChange) {
                  onModelChange(value, index);
                }
              },
            }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ProFormSelect
            name="versionId"
            label="Phiên bản"
            options={versions.filter((v) => {
              const modelId = formRef.current?.getFieldValue([
                "bookingDetails",
                index,
                "modelId",
              ]);
              return v.modelId === modelId;
            })}
            placeholder="Chọn phiên bản"
            rules={[{ required: true, message: "Vui lòng chọn phiên bản" }]}
            dependencies={[["bookingDetails", index, "modelId"]]}
            fieldProps={{
              showSearch: true,
              optionFilterProp: "label",
              onChange: (value) => {
                // Tìm thông tin chi tiết của version
                const versionDetail = versions.find((v) => v.value === value);
                setSelectedVersion(versionDetail);
              },
            }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ProFormSelect
            name="colorId"
            label="Màu xe"
            options={colors}
            placeholder="Chọn màu xe"
            rules={[{ required: true, message: "Vui lòng chọn màu xe" }]}
            fieldProps={{
              showSearch: true,
              optionFilterProp: "label",
            }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ProFormDigit
            name="quantity"
            label="Số lượng"
            placeholder="Nhập số lượng"
            min={1}
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
            fieldProps={{
              precision: 0,
              style: { width: "100%" },
            }}
          />
        </Col>

        {/* Hiển thị thông tin chi tiết phiên bản */}
        {selectedVersion && (
          <Col span={24}>
            <VersionDetails version={selectedVersion} />
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default VehicleSelector;
