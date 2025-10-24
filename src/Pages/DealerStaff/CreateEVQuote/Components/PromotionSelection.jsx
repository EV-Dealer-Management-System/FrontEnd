import React, { useMemo } from "react";
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
} from "antd";
import {
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

function PromotionSelection({
  promotions,
  loadingPromotions,
  selectedPromotionId,
  onPromotionChange,
}) {
  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  // Lọc khuyến mãi đang hoạt động
  const activePromotions = useMemo(() => {
    const now = new Date();

    return promotions.filter((promotion) => {
      if (!promotion.isActive) return false;

      const start = new Date(promotion.startDate);
      const end = new Date(promotion.endDate);

      return now >= start && now <= end;
    });
  }, [promotions]);

  // Khuyến mãi đã chọn
  const selectedPromotion = useMemo(() => {
    if (!selectedPromotionId) return null;
    return activePromotions.find((p) => p.id === selectedPromotionId);
  }, [activePromotions, selectedPromotionId]);

  if (loadingPromotions) {
    return (
      <ProCard>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: "#8c8c8c" }}>
            Đang tải khuyến mãi...
          </div>
        </div>
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <Space>
          <GiftOutlined style={{ color: "#fa8c16" }} />
          <Text strong>Chọn khuyến mãi</Text>
        </Space>
      }
      extra={<Tag color="blue">{activePromotions.length} chương trình</Tag>}
      bordered
      headerBordered
    >
      {activePromotions.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có khuyến mãi nào đang hoạt động"
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Select dropdown */}
          <div>
            <Select
              placeholder="Chọn chương trình khuyến mãi (tùy chọn)"
              value={selectedPromotionId}
              onChange={onPromotionChange}
              allowClear
              showSearch
              size="large"
              style={{ width: "100%" }}
              filterOption={(input, option) =>
                option.searchtext.toLowerCase().includes(input.toLowerCase())
              }
            >
              {activePromotions.map((promotion) => (
                <Option
                  key={promotion.id}
                  value={promotion.id}
                  searchtext={promotion.name}
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Text strong style={{ fontSize: 14 }}>
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
          </div>

          {/* Thông tin khuyến mãi đã chọn */}
          {selectedPromotion ? (
            <>
              <Divider style={{ margin: 0 }} />
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: 8,
                }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {/* Tên khuyến mãi */}
                  <div>
                    <Space>
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: 16 }}
                      />
                      <Text strong style={{ fontSize: 15, color: "#d46b08" }}>
                        Khuyến mãi được áp dụng
                      </Text>
                    </Space>
                  </div>

                  {/* Chi tiết */}
                  <Row gutter={[16, 12]}>
                    <Col span={24}>
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Tên chương trình
                        </Text>
                        <Text strong style={{ fontSize: 14 }}>
                          🎁 {selectedPromotion.name}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Mô tả
                        </Text>
                        <Text style={{ fontSize: 14 }}>
                          {selectedPromotion.description}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Giá trị giảm giá
                        </Text>
                        <div>
                          {selectedPromotion.discountType === 0 ? (
                            <Tag
                              color="green"
                              icon={<DollarOutlined />}
                              style={{
                                fontSize: 14,
                                padding: "6px 16px",
                                borderRadius: 6,
                              }}
                            >
                              Giảm{" "}
                              {formatCurrency(selectedPromotion.fixedAmount)}
                            </Tag>
                          ) : (
                            <Tag
                              color="blue"
                              icon={<PercentageOutlined />}
                              style={{
                                fontSize: 14,
                                padding: "6px 16px",
                                borderRadius: 6,
                              }}
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
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f5f5f5",
                border: "1px dashed #d9d9d9",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <Space direction="vertical" size={4}>
                <CloseCircleOutlined
                  style={{ fontSize: 24, color: "#bfbfbf" }}
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Chưa chọn khuyến mãi
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Báo giá sẽ sử dụng giá gốc
                </Text>
              </Space>
            </div>
          )}
        </Space>
      )}
    </ProCard>
  );
}

export default PromotionSelection;
