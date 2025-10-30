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
  Button,
  Alert,
} from "antd";
import { CarOutlined, PlusOutlined, DeleteOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { getEVVersionById } from "../../../../App/DealerStaff/EVQuotesManagement/Partials/GetEVVersionByID";

const { Text, Title } = Typography;

function VehicleSelection({
  inventory,
  loadingInventory,
  vehicleList,
  onVehicleListChange,
}) {
  const [versionSpecsMap, setVersionSpecsMap] = useState({});
  const [loadingSpecsMap, setLoadingSpecsMap] = useState({});

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

  // Thêm xe mới vào danh sách
  const handleAddVehicle = () => {
    const newVehicle = {
      id: Date.now(), // ID tạm thời
      modelId: null,
      versionId: null,
      colorId: null,
      quantity: 1,
      promotionId: null,
    };
    onVehicleListChange([...vehicleList, newVehicle]);
  };

  // Xóa xe khỏi danh sách
  const handleRemoveVehicle = (vehicleId) => {
    if (vehicleList.length === 1) {
      message.warning("Phải có ít nhất 1 xe trong báo giá!");
      return;
    }
    onVehicleListChange(vehicleList.filter((v) => v.id !== vehicleId));
  };

  // Cập nhật thông tin xe
  const updateVehicle = (vehicleId, field, value) => {
    onVehicleListChange(
      vehicleList.map((v) =>
        v.id === vehicleId ? { ...v, [field]: value } : v
      )
    );
  };

  // Xử lý khi chọn model
  const handleModelChange = (vehicleId, modelId) => {
    const updates = {
      modelId: modelId,
      versionId: null,
      colorId: null,
      quantity: 1,
    };
    onVehicleListChange(
      vehicleList.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v))
    );
  };

  // Xử lý khi chọn version
  const handleVersionChange = async (vehicleId, versionId) => {
    // Cập nhật version và reset color cùng lúc
    onVehicleListChange(
      vehicleList.map((v) =>
        v.id === vehicleId
          ? { ...v, versionId: versionId, colorId: null }
          : v
      )
    );

    // Tải thông số kỹ thuật
    if (versionId) {
      try {
        setLoadingSpecsMap((prev) => ({ ...prev, [vehicleId]: true }));
        const response = await getEVVersionById(versionId);
        if (response.isSuccess) {
          setVersionSpecsMap((prev) => ({
            ...prev,
            [vehicleId]: response.result,
          }));
        } else {
          message.error("Không thể tải thông số kỹ thuật");
          setVersionSpecsMap((prev) => ({ ...prev, [vehicleId]: null }));
        }
      } catch (error) {
        console.error("Error fetching version specs:", error);
        message.error("Lỗi khi tải thông số kỹ thuật");
        setVersionSpecsMap((prev) => ({ ...prev, [vehicleId]: null }));
      } finally {
        setLoadingSpecsMap((prev) => ({ ...prev, [vehicleId]: false }));
      }
    } else {
      setVersionSpecsMap((prev) => ({ ...prev, [vehicleId]: null }));
    }
  };

  // Lấy thông tin versions theo model
  const getVersionsByModel = (modelId) => {
    if (!modelId) return [];
    return Object.values(groupedByModel[modelId]?.versions || {});
  };

  // Lấy thông tin colors theo version
  const getColorsByVersion = (modelId, versionId) => {
    if (!modelId || !versionId) return [];
    const versions = groupedByModel[modelId]?.versions || {};
    return versions[versionId]?.colors || [];
  };

  // Lấy số lượng tối đa của color
  const getMaxQuantity = (modelId, versionId, colorId) => {
    const colors = getColorsByVersion(modelId, versionId);
    const color = colors.find((c) => c.colorId === colorId);
    return color?.quantity || 0;
  };

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

  const models = Object.values(groupedByModel);

  return (
    <div className="space-y-4">
      {/* Hiển thị danh sách xe */}
      {vehicleList.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          index={index}
          models={models}
          versionSpecs={versionSpecsMap[vehicle.id]}
          loadingSpecs={loadingSpecsMap[vehicle.id]}
          onModelChange={handleModelChange}
          onVersionChange={handleVersionChange}
          onColorChange={(vehicleId, colorId) =>
            updateVehicle(vehicleId, "colorId", colorId)
          }
          onQuantityChange={(vehicleId, quantity) =>
            updateVehicle(vehicleId, "quantity", quantity)
          }
          onRemove={handleRemoveVehicle}
          canRemove={vehicleList.length > 1}
          getVersionsByModel={getVersionsByModel}
          getColorsByVersion={getColorsByVersion}
          getMaxQuantity={getMaxQuantity}
        />
      ))}

      {/* Nút thêm xe */}
      <ProCard>
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={handleAddVehicle}
          size="large"
          className="border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700"
        >
          Thêm xe vào báo giá
        </Button>
      </ProCard>

      {/* Thông báo tổng số xe */}
      {vehicleList.length > 1 && (
        <Alert
          message={`Tổng số: ${vehicleList.length} loại xe trong báo giá`}
          type="info"
          showIcon
          className="mb-0"
        />
      )}
    </div>
  );
}

// Component hiển thị thẻ xe
function VehicleCard({
  vehicle,
  index,
  models,
  versionSpecs,
  loadingSpecs,
  onModelChange,
  onVersionChange,
  onColorChange,
  onQuantityChange,
  onRemove,
  canRemove,
  getVersionsByModel,
  getColorsByVersion,
  getMaxQuantity,
}) {
  const versions = getVersionsByModel(vehicle.modelId);
  const colors = getColorsByVersion(vehicle.modelId, vehicle.versionId);
  const maxQuantity = getMaxQuantity(
    vehicle.modelId,
    vehicle.versionId,
    vehicle.colorId
  );

  return (
    <ProCard
      title={
        <Space>
          <CarOutlined style={{ color: "#1890ff" }} />
          <Text strong>Xe #{index + 1}</Text>
        </Space>
      }
      extra={
        canRemove && (
          <Button
            type="text"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => onRemove(vehicle.id)}
            size="small"
          >
            Xóa
          </Button>
        )
      }
      bordered
      headerBordered
    >
      <ProForm layout="vertical" submitter={false} key={`form_${vehicle.id}_${vehicle.modelId}_${vehicle.versionId}`}>
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
              name={`model_${vehicle.id}`}
              placeholder="Chọn mẫu xe"
              showSearch
              options={models.map((model) => ({
                label: model.modelName,
                value: model.modelId,
              }))}
              fieldProps={{
                value: vehicle.modelId,
                onChange: (value) => onModelChange(vehicle.id, value),
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
              name={`version_${vehicle.id}`}
              placeholder="Chọn phiên bản"
              showSearch
              disabled={!vehicle.modelId}
              options={versions.map((version) => ({
                label: version.versionName,
                value: version.versionId,
              }))}
              fieldProps={{
                value: vehicle.versionId,
                onChange: (value) => onVersionChange(vehicle.id, value),
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
              name={`color_${vehicle.id}`}
              placeholder="Chọn màu xe"
              showSearch
              disabled={!vehicle.versionId}
              options={colors.map((color) => ({
                label: `${color.colorName} (Còn ${color.quantity} xe)`,
                value: color.colorId,
                disabled: color.quantity === 0,
              }))}
              fieldProps={{
                value: vehicle.colorId,
                onChange: (value) => onColorChange(vehicle.id, value),
              }}
              rules={[{ required: true, message: "Vui lòng chọn màu xe!" }]}
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              label={
                <span>
                  <span style={{ color: "red" }}>* </span>
                  Số lượng
                </span>
              }
              name={`quantity_${vehicle.id}`}
              placeholder="Nhập số lượng"
              min={1}
              max={maxQuantity || 999}
              disabled={!vehicle.colorId}
              fieldProps={{
                precision: 0,
                value: vehicle.quantity,
                onChange: (value) => onQuantityChange(vehicle.id, value),
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
            {vehicle.colorId && maxQuantity > 0 && (
              <Alert
                message={
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold">
                      Còn <span className="text-blue-600 text-base">{maxQuantity}</span> xe trong kho đại lý
                    </span>
                  </div>
                }
                type="info"
                showIcon={false}
                className="mt-3 rounded-lg border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100"
              />
            )}
          </Col>
        </Row>

        {/* Thông số kỹ thuật */}
        {vehicle.versionId && (
          <>
            {loadingSpecs ? (
              <div className="text-center py-10">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">
                  Đang tải thông số kỹ thuật...
                </div>
              </div>
            ) : versionSpecs ? (
              <ProCard
                title={
                  <Title level={5} className="m-0 text-blue-600">
                    Thông số kỹ thuật
                  </Title>
                }
                bordered
                className="mt-6 bg-blue-50"
                bodyStyle={{ padding: "20px 24px" }}
              >
                <Row gutter={[24, 20]}>
                  {/* Công suất */}
                  <Col span={12}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        ⚡ Công suất
                      </Text>
                      <Tag color="orange" className="text-sm py-1.5 px-4 m-0 rounded-md">
                        {versionSpecs.motorPower} W
                      </Tag>
                    </Space>
                  </Col>

                  {/* Pin */}
                  <Col span={12}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        🔋 Pin
                      </Text>
                      <Tag color="green" className="text-sm py-1.5 px-4 m-0 rounded-md">
                        {versionSpecs.batteryCapacity} V
                      </Tag>
                    </Space>
                  </Col>

                  {/* Tốc độ */}
                  <Col span={12}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        🏁 Tốc độ
                      </Text>
                      <Tag color="red" className="text-sm py-1.5 px-4 m-0 rounded-md">
                        {versionSpecs.topSpeed} km/h
                      </Tag>
                    </Space>
                  </Col>

                  {/* Tầm hoạt động */}
                  <Col span={12}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        🔌 Tầm hoạt động
                      </Text>
                      <Tag color="blue" className="text-sm py-1.5 px-4 m-0 rounded-md">
                        {versionSpecs.rangePerCharge} km
                      </Tag>
                    </Space>
                  </Col>

                  {/* Trọng lượng */}
                  <Col span={12}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        ⚖️ Trọng lượng
                      </Text>
                      <div className="text-sm font-semibold text-gray-800">
                        {versionSpecs.weight} kg
                      </div>
                    </Space>
                  </Col>

                  {/* Chiều cao */}
                  <Col span={12}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        📏 Chiều cao
                      </Text>
                      <div className="text-sm font-semibold text-gray-800">
                        {versionSpecs.height} cm
                      </div>
                    </Space>
                  </Col>

                  {/* Năm sản xuất */}
                  <Col span={24}>
                    <Space direction="vertical" size={4} className="w-full">
                      <Text type="secondary" className="text-sm">
                        📅 Năm sản xuất
                      </Text>
                      <Tag color="purple" className="text-sm py-1.5 px-4 m-0 rounded-md">
                        {versionSpecs.productionYear}
                      </Tag>
                    </Space>
                  </Col>
                </Row>

                {/* Mô tả */}
                {versionSpecs.description && (
                  <>
                    <Divider className="my-5" />
                    <Space direction="vertical" size={8} className="w-full">
                      <Text type="secondary" className="text-sm">
                        📝 Mô tả:
                      </Text>
                      <Text className="text-sm italic text-gray-600 leading-relaxed">
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
  );
}
export default VehicleSelection;
