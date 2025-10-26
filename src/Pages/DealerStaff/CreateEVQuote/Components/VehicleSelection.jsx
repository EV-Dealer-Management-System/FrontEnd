import React, { useState, useMemo } from "react";
import {
  ProCard,
  ProFormSelect,
  ProForm,
  ProFormDigit,
} from "@ant-design/pro-components";
import {
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  Divider,
} from "antd";
import { CarOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { getEVVersionById } from "../../../../App/DealerStaff/EVQuotesManagement/Partials/GetEVVersionByID";

const { Text, Title } = Typography;

function VehicleSelection({
  inventory,
  loadingInventory,
  selectedItems,
  onSelectionChange,
  quantity,
  onQuantityChange,
}) {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionSpecs, setVersionSpecs] = useState(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // Group inventory by model
  const groupedByModel = useMemo(() => {
    return inventory.reduce((acc, item) => {
      if (!acc[item.modelId]) {
        acc[item.modelId] = {
          modelId: item.modelId,
          modelName: item.modelName,
          versions: {},
        };
      }

      if (!acc[item.modelId].versions[item.versionId]) {
        acc[item.modelId].versions[item.versionId] = {
          versionId: item.versionId,
          versionName: item.versionName,
          colors: [],
        };
      }

      acc[item.modelId].versions[item.versionId].colors.push({
        colorId: item.colorId,
        colorName: item.colorName,
        quantity: item.quantity,
      });

      return acc;
    }, {});
  }, [inventory]);

  const models = Object.values(groupedByModel);
  const versions = selectedModel
    ? Object.values(groupedByModel[selectedModel]?.versions || {})
    : [];
  const colors = selectedVersion
    ? versions.find((v) => v.versionId === selectedVersion)?.colors || []
    : [];

  // Handle model selection
  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    setSelectedVersion(null);
    setVersionSpecs(null);
    onSelectionChange({
      versionId: null,
      colorId: null,
    });
  };

  // Handle version selection
  const handleVersionChange = async (versionId) => {
    setSelectedVersion(versionId);
    onSelectionChange({
      versionId: versionId,
      colorId: null,
    });

    // Fetch version specifications
    if (versionId) {
      try {
        setLoadingSpecs(true);
        const response = await getEVVersionById(versionId);
        if (response.isSuccess) {
          setVersionSpecs(response.result);
        } else {
          message.error("Không thể tải thông số kỹ thuật");
          setVersionSpecs(null);
        }
      } catch (error) {
        console.error("Error fetching version specs:", error);
        message.error("Lỗi khi tải thông số kỹ thuật");
        setVersionSpecs(null);
      } finally {
        setLoadingSpecs(false);
      }
    } else {
      setVersionSpecs(null);
    }
  };

  // Handle color selection
  const handleColorChange = (colorId) => {
    onSelectionChange({
      versionId: selectedVersion,
      colorId: colorId,
    });
  };

  // Get selected items info
  const selectedInfo = useMemo(() => {
    if (!selectedModel || !selectedVersion || !selectedItems.colorId)
      return null;

    const model = groupedByModel[selectedModel];
    const version = model?.versions[selectedVersion];
    const color = version?.colors.find(
      (c) => c.colorId === selectedItems.colorId
    );

    return {
      modelName: model?.modelName,
      versionName: version?.versionName,
      colorName: color?.colorName,
      quantity: color?.quantity || 0,
    };
  }, [selectedModel, selectedVersion, selectedItems.colorId, groupedByModel]);

  if (loadingInventory) {
    return (
      <ProCard className="min-h-96">
        <div className="flex flex-col items-center justify-center py-16">
          <Spin size="large" />
          <p className="mt-4 text-gray-500 text-base">
            Đang tải thông tin kho xe điện...
          </p>
        </div>
      </ProCard>
    );
  }

  if (!inventory.length) {
    return (
      <ProCard>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="text-center">
              <p className="text-gray-500 text-base mb-2">
                Không có xe điện trong kho
              </p>
              <p className="text-gray-400 text-sm">
                Vui lòng liên hệ quản lý để nhập thêm xe vào kho
              </p>
            </div>
          }
        />
      </ProCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vehicle Card */}
      <ProCard
        title={
          <Space>
            <CarOutlined style={{ color: "#1890ff" }} />
            <Text strong>Xe #1</Text>
          </Space>
        }
        bordered
        headerBordered
      >
        <ProForm layout="vertical" submitter={false}>
          {/* Row 1: Mẫu xe và Phiên bản */}
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                label={
                  <span>
                    <span style={{ color: "red" }}>* </span>
                    Mẫu xe
                  </span>
                }
                name="model"
                placeholder="E-Scooter Pro Max"
                showSearch
                options={models.map((model) => ({
                  label: model.modelName,
                  value: model.modelId,
                }))}
                fieldProps={{
                  value: selectedModel,
                  onChange: handleModelChange,
                }}
                rules={[{ required: true, message: "Vui lòng chọn mẫu xe!" }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                label={
                  <span>
                    <span style={{ color: "red" }}>* </span>
                    Phiên bản
                  </span>
                }
                name="version"
                placeholder="E-Scooter Pro Max 2025"
                showSearch
                disabled={!selectedModel}
                options={versions.map((version) => ({
                  label: version.versionName,
                  value: version.versionId,
                }))}
                fieldProps={{
                  value: selectedVersion,
                  onChange: handleVersionChange,
                }}
                rules={[
                  { required: true, message: "Vui lòng chọn phiên bản!" },
                ]}
              />
            </Col>
          </Row>

          {/* Row 2: Màu xe và Số lượng */}
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                label={
                  <span>
                    <span style={{ color: "red" }}>* </span>
                    Màu xe
                  </span>
                }
                name="color"
                placeholder="Chọn phiên bản trước"
                showSearch
                disabled={!selectedVersion}
                options={colors.map((color) => ({
                  label: color.colorName,
                  value: color.colorId,
                  disabled: color.quantity === 0,
                }))}
                fieldProps={{
                  value: selectedItems.colorId,
                  onChange: handleColorChange,
                }}
                rules={[{ required: true, message: "Vui lòng chọn màu xe!" }]}
              />
              {!selectedVersion && (
                <Text type="danger" style={{ fontSize: 12 }}>
                  Vui lòng chọn màu xe
                </Text>
              )}
            </Col>
            <Col span={12}>
              <ProFormDigit
                label={
                  <span>
                    <span style={{ color: "red" }}>* </span>
                    Số lượng
                  </span>
                }
                name="quantity"
                placeholder="Nhập số lượng"
                min={1}
                max={selectedInfo?.quantity || 999}
                disabled={!selectedItems.colorId}
                fieldProps={{
                  precision: 0,
                  value: quantity,
                  onChange: onQuantityChange,
                }}
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng!" },
                  {
                    type: "number",
                    min: 1,
                    message: "Số lượng phải lớn hơn 0!",
                  },
                ]}
              />
              {selectedInfo && selectedInfo.quantity > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 12px",
                    backgroundColor: "#e6f7ff",
                    border: "1px solid #91d5ff",
                    borderRadius: 6,
                    textAlign: "center",
                  }}
                >
                  <Space size={2}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#0050b3",
                        fontWeight: 500,
                      }}
                    >
                      Còn {selectedInfo.quantity} xe trong kho hàng
                    </Text>
                  </Space>
                </div>
              )}
            </Col>
          </Row>

          {/* Thông số kỹ thuật */}
          {selectedVersion && (
            <>
              {loadingSpecs ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16, color: "#8c8c8c" }}>
                    Đang tải thông số kỹ thuật...
                  </div>
                </div>
              ) : versionSpecs ? (
                <ProCard
                  title={
                    <Title level={5} style={{ margin: 0, color: "#1890ff" }}>
                      Thông số kỹ thuật
                    </Title>
                  }
                  bordered
                  style={{
                    marginTop: 24,
                    backgroundColor: "#f0f5ff",
                  }}
                  bodyStyle={{ padding: "20px 24px" }}
                >
                  <Row gutter={[24, 20]}>
                    {/* Công suất */}
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          ⚡ Công suất
                        </Text>
                        <Tag
                          color="orange"
                          style={{
                            fontSize: 14,
                            padding: "6px 16px",
                            margin: 0,
                            borderRadius: 6,
                          }}
                        >
                          {versionSpecs.motorPower} W
                        </Tag>
                      </Space>
                    </Col>

                    {/* Pin */}
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          🔋 Pin
                        </Text>
                        <Tag
                          color="green"
                          style={{
                            fontSize: 14,
                            padding: "6px 16px",
                            margin: 0,
                            borderRadius: 6,
                          }}
                        >
                          {versionSpecs.batteryCapacity} V
                        </Tag>
                      </Space>
                    </Col>

                    {/* Tốc độ */}
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          🏁 Tốc độ
                        </Text>
                        <Tag
                          color="red"
                          style={{
                            fontSize: 14,
                            padding: "6px 16px",
                            margin: 0,
                            borderRadius: 6,
                          }}
                        >
                          {versionSpecs.topSpeed} km/h
                        </Tag>
                      </Space>
                    </Col>

                    {/* Tầm hoạt động */}
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          🔌 Tầm hoạt động
                        </Text>
                        <Tag
                          color="blue"
                          style={{
                            fontSize: 14,
                            padding: "6px 16px",
                            margin: 0,
                            borderRadius: 6,
                          }}
                        >
                          {versionSpecs.rangePerCharge} km
                        </Tag>
                      </Space>
                    </Col>

                    {/* Trọng lượng */}
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          ⚖️ Trọng lượng
                        </Text>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#262626",
                          }}
                        >
                          {versionSpecs.weight} kg
                        </div>
                      </Space>
                    </Col>

                    {/* Chiều cao */}
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          📏 Chiều cao
                        </Text>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#262626",
                          }}
                        >
                          {versionSpecs.height} cm
                        </div>
                      </Space>
                    </Col>

                    {/* Năm sản xuất */}
                    <Col span={24}>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          📅 Năm sản xuất
                        </Text>
                        <Tag
                          color="purple"
                          style={{
                            fontSize: 14,
                            padding: "6px 16px",
                            margin: 0,
                            borderRadius: 6,
                          }}
                        >
                          {versionSpecs.productionYear}
                        </Tag>
                      </Space>
                    </Col>
                  </Row>

                  {/* Mô tả */}
                  {versionSpecs.description && (
                    <>
                      <Divider style={{ margin: "20px 0" }} />
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          📝 Mô tả:
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontStyle: "italic",
                            color: "#595959",
                            lineHeight: 1.6,
                          }}
                        >
                          {versionSpecs.description}
                        </Text>
                      </Space>
                    </>
                  )}
                </ProCard>
              ) : null}
            </>
          )}
        </ProForm>
      </ProCard>
    </div>
  );
}
export default VehicleSelection;
