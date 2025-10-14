import React, { useState } from "react";
import {
  ProFormSelect,
  ProFormDigit,
  ProForm,
} from "@ant-design/pro-components";
import { Card, Space, Typography, Row, Col } from "antd";
import { CarOutlined } from "@ant-design/icons";
import VersionDetails from "./VersionDetails";
import AvailableQuantityAlert from "./AvailableQuantityAlert";

const { Text } = Typography;

/**
 * Component để chọn thông tin xe (mẫu, phiên bản, màu, số lượng)
 * @param {Array} models - Danh sách mẫu xe
 * @param {Array} versions - Danh sách phiên bản
 * @param {Object} colorsCache - Cache màu xe theo modelId_versionId
 * @param {Object} availableQuantities - Cache số lượng có sẵn theo modelId_versionId_colorId
 * @param {Function} onModelChange - Callback khi thay đổi mẫu xe
 * @param {Function} onVersionChange - Callback khi thay đổi phiên bản
 * @param {Function} onColorChange - Callback khi thay đổi màu xe
 * @param {Object} formRef - Reference của form chính
 * @param {Number} index - Index của item trong list
 */
function VehicleSelector({
  models,
  versions,
  colorsCache,
  availableQuantities,
  onModelChange,
  onVersionChange,
  onColorChange,
  formRef,
  index,
}) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Lấy số lượng có sẵn dựa trên model, version, color đã chọn
  const getAvailableQuantity = () => {
    const modelId = formRef.current?.getFieldValue([
      "bookingDetails",
      index,
      "modelId",
    ]);
    const versionId = formRef.current?.getFieldValue([
      "bookingDetails",
      index,
      "versionId",
    ]);
    const colorId = formRef.current?.getFieldValue([
      "bookingDetails",
      index,
      "colorId",
    ]);

    if (modelId && versionId && colorId) {
      const quantityKey = `${modelId}_${versionId}_${colorId}`;
      return availableQuantities[quantityKey];
    }
    return null;
  };

  const availableQty = getAvailableQuantity();

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

                // Gọi callback để fetch colors
                const modelId = formRef.current?.getFieldValue([
                  "bookingDetails",
                  index,
                  "modelId",
                ]);
                if (onVersionChange && modelId) {
                  onVersionChange(value, modelId, index);
                }
              },
            }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ProFormSelect
            name="colorId"
            label="Màu xe"
            options={(() => {
              // Lấy modelId và versionId hiện tại từ form
              const modelId = formRef.current?.getFieldValue([
                "bookingDetails",
                index,
                "modelId",
              ]);
              const versionId = formRef.current?.getFieldValue([
                "bookingDetails",
                index,
                "versionId",
              ]);

              // Tạo cache key và lấy colors từ cache
              if (modelId && versionId) {
                const cacheKey = `${modelId}_${versionId}`;
                return colorsCache[cacheKey] || [];
              }
              return [];
            })()}
            placeholder="Chọn phiên bản trước"
            rules={[{ required: true, message: "Vui lòng chọn màu xe" }]}
            dependencies={[["bookingDetails", index, "versionId"]]}
            fieldProps={{
              showSearch: true,
              optionFilterProp: "label",
              onChange: (value) => {
                // Gọi callback để fetch số lượng có sẵn
                const modelId = formRef.current?.getFieldValue([
                  "bookingDetails",
                  index,
                  "modelId",
                ]);
                const versionId = formRef.current?.getFieldValue([
                  "bookingDetails",
                  index,
                  "versionId",
                ]);
                if (onColorChange && modelId && versionId) {
                  onColorChange(value, modelId, versionId, index);
                }
              },
            }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ProFormDigit
            name="quantity"
            label="Số lượng"
            placeholder="Nhập số lượng"
            min={1}
            max={availableQty !== null && availableQty !== undefined ? availableQty : undefined}
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const colorId = getFieldValue(["bookingDetails", index, "colorId"]);

                  // Chỉ validate nếu đã chọn màu và có số lượng available
                  if (colorId && availableQty !== null && availableQty !== undefined) {
                    if (!value || value <= availableQty) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(`Số lượng không được vượt quá ${availableQty} xe có sẵn`)
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            dependencies={[["bookingDetails", index, "colorId"]]}
            fieldProps={{
              precision: 0,
              style: { width: "100%" },
            }}
          />
          {/* Hiển thị thông báo số lượng ngay dưới ô input */}
          <div style={{ marginTop: -16 }}>
            <AvailableQuantityAlert availableQuantity={availableQty} />
          </div>
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
