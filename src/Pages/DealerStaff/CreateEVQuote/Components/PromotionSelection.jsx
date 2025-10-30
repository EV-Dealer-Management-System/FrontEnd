import React from "react";
import { ProCard } from "@ant-design/pro-components";
import {
  Tag,
  Empty,
  Spin,
  Typography,
  Select,
  Space,
  Row,
  Col,
  Divider,
  Collapse,
  Alert,
} from "antd";
import {
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

function PromotionSelection({
  promotions,
  loadingPromotions,
  vehicleList,
  onPromotionChange,
  inventory,
}) {
  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  // Lấy thông tin xe từ inventory
  const getVehicleInfo = (vehicle) => {
    const inventoryItem = inventory.find(
      (item) =>
        item.versionId === vehicle.versionId && item.colorId === vehicle.colorId
    );
    return inventoryItem || null;
  };

  // Lọc khuyến mãi cho từng xe
  const getPromotionsForVehicle = (vehicle) => {
    if (!vehicle.versionId) return [];

    const now = new Date();
    const validPromotions = promotions.filter((promotion) => {
      if (!promotion.isActive) return false;
      const start = new Date(promotion.startDate);
      const end = new Date(promotion.endDate);
      return now >= start && now <= end;
    });

    const vehicleInfo = getVehicleInfo(vehicle);
    if (!vehicleInfo) return [];

    // Lọc khuyến mãi theo quy tắc:
    // - Nếu promotion.modelId và promotion.versionId === null → áp dụng cho mọi xe
    // - Nếu có giá trị cụ thể → chỉ áp dụng cho xe khớp modelId và versionId
    return validPromotions.filter((promotion) => {
      const isGeneralPromotion =
        (promotion.modelId === null || promotion.modelId === undefined) &&
        (promotion.versionId === null || promotion.versionId === undefined);

      const isSpecificPromotion =
        promotion.modelId === vehicleInfo.modelId &&
        promotion.versionId === vehicleInfo.versionId;

      return isGeneralPromotion || isSpecificPromotion;
    });
  };

  if (loadingPromotions) {
    return (
      <ProCard>
        <div className="text-center py-10">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Đang tải khuyến mãi...</div>
        </div>
      </ProCard>
    );
  }

  const validVehicles = vehicleList.filter((v) => v.versionId && v.colorId);

  if (validVehicles.length === 0) {
    return (
      <ProCard
        title={
          <Space>
            <GiftOutlined style={{ color: "#fa8c16" }} />
            <Text strong>Chọn khuyến mãi</Text>
          </Space>
        }
        bordered
        headerBordered
      >
        <Alert
          message="Chưa có xe để áp dụng khuyến mãi"
          description="Vui lòng chọn xe và màu sắc ở bước trước"
          type="info"
          showIcon
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <Space>
          <GiftOutlined style={{ color: "#fa8c16" }} />
          <Text strong>Chọn khuyến mãi cho từng xe</Text>
        </Space>
      }
      bordered
      headerBordered
    >
      <Collapse defaultActiveKey={validVehicles.map((v) => v.id)}>
        {validVehicles.map((vehicle, index) => {
          const vehicleInfo = getVehicleInfo(vehicle);
          const availablePromotions = getPromotionsForVehicle(vehicle);
          const selectedPromotion = availablePromotions.find(
            (p) => p.id === vehicle.promotionId
          );

          return (
            <Panel
              key={vehicle.id}
              header={
                <Space>
                  <CarOutlined style={{ color: "#1890ff" }} />
                  <Text strong>
                    Xe #{index + 1}:{" "}
                    {vehicleInfo
                      ? `${vehicleInfo.modelName} - ${vehicleInfo.colorName}`
                      : "Chưa chọn xe"}
                  </Text>
                  {selectedPromotion && (
                    <Tag color="orange" icon={<GiftOutlined />}>
                      Có khuyến mãi
                    </Tag>
                  )}
                </Space>
              }
            >
              <Space direction="vertical" size="large" className="w-full">
                {/* Select dropdown */}
                <div>
                  <Select
                    placeholder="Chọn chương trình khuyến mãi (tùy chọn)"
                    value={vehicle.promotionId}
                    onChange={(value) => onPromotionChange(vehicle.id, value)}
                    allowClear
                    showSearch
                    size="large"
                    className="w-full"
                    filterOption={(input, option) =>
                      option.searchtext
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {availablePromotions.map((promotion) => (
                      <Option
                        key={promotion.id}
                        value={promotion.id}
                        searchtext={promotion.name}
                      >
                        <Space className="w-full justify-between">
                          <Text strong className="text-sm">
                            {promotion.name}
                          </Text>
                          {promotion.discountType === 0 ? (
                            <Tag color="green">
                              {formatCurrency(promotion.fixedAmount)}
                            </Tag>
                          ) : (
                            <Tag color="blue" icon={<PercentageOutlined />}>
                              {promotion.percentage}%
                            </Tag>
                          )}
                        </Space>
                      </Option>
                    ))}
                  </Select>

                  {availablePromotions.length === 0 && (
                    <div className="mt-2">
                      <Alert
                        message="Không có khuyến mãi"
                        description="Không có chương trình khuyến mãi nào áp dụng cho xe này"
                        type="warning"
                        showIcon
                        size="small"
                      />
                    </div>
                  )}
                </div>

                {/* Thông tin khuyến mãi đã chọn */}
                {selectedPromotion ? (
                  <>
                    <Divider className="my-0" />
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <Space
                        direction="vertical"
                        size="middle"
                        className="w-full"
                      >
                        {/* Tên khuyến mãi */}
                        <div>
                          <Space>
                            <CheckCircleOutlined className="text-green-500 text-base" />
                            <Text strong className="text-base text-orange-700">
                              Khuyến mãi được áp dụng
                            </Text>
                          </Space>
                        </div>

                        {/* Chi tiết */}
                        <Row gutter={[16, 12]}>
                          <Col span={24}>
                            <Space direction="vertical" size={2}>
                              <Text type="secondary" className="text-sm">
                                Tên chương trình
                              </Text>
                              <Text strong className="text-sm">
                                {selectedPromotion.name}
                              </Text>
                            </Space>
                          </Col>
                          <Col span={24}>
                            <Space direction="vertical" size={2}>
                              <Text type="secondary" className="text-sm">
                                Mô tả
                              </Text>
                              <Text className="text-sm">
                                {selectedPromotion.description}
                              </Text>
                            </Space>
                          </Col>
                          <Col span={24}>
                            <Space direction="vertical" size={2}>
                              <Text type="secondary" className="text-sm">
                                Giá trị giảm giá
                              </Text>
                              <div>
                                {selectedPromotion.discountType === 0 ? (
                                  <Tag
                                    color="green"
                                    icon={<DollarOutlined />}
                                    className="text-sm py-1.5 px-4 rounded-md"
                                  >
                                    Giảm{" "}
                                    {formatCurrency(selectedPromotion.fixedAmount)}
                                  </Tag>
                                ) : (
                                  <Tag
                                    color="blue"
                                    icon={<PercentageOutlined />}
                                    className="text-sm py-1.5 px-4 rounded-md"
                                  >
                                    Giảm {selectedPromotion.percentage}%
                                  </Tag>
                                )}
                              </div>
                            </Space>
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-gray-100 border border-dashed border-gray-300 rounded-lg text-center">
                    <Space direction="vertical" size={4}>
                      <CloseCircleOutlined className="text-2xl text-gray-400" />
                      <Text type="secondary" className="text-sm">
                        Chưa chọn khuyến mãi
                      </Text>
                      <Text type="secondary" className="text-xs">
                        Báo giá sẽ sử dụng giá gốc
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Panel>
          );
        })}
      </Collapse>
    </ProCard>
  );
}

export default PromotionSelection;
