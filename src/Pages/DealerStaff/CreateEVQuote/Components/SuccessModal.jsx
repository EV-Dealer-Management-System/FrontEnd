import React from "react";
import { Modal, Typography, Space, Button, Row, Col, Divider, Tag } from "antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  CarOutlined,
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

function SuccessModal({
  visible,
  onClose,
  onViewQuotes,
  onCreateNew,
  quoteData,
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        {/* Success Icon */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "#f6ffed",
              border: "4px solid #52c41a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
          </div>
        </div>

        {/* Title */}
        <Title level={3} style={{ marginBottom: 8, color: "#262626" }}>
          Tạo báo giá thành công!
        </Title>

        <Text type="secondary" style={{ fontSize: 14 }}>
          Báo giá xe điện đã được lưu vào hệ thống
        </Text>

        {/* Quote Information */}
        {quoteData && (
          <div style={{ marginTop: 32, marginBottom: 32 }}>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fafafa",
                borderRadius: 8,
                border: "1px solid #e8e8e8",
                textAlign: "left",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {/* Vehicle Info */}
                <div>
                  <Space style={{ marginBottom: 8 }}>
                    <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                    <Text strong style={{ fontSize: 14 }}>
                      Thông tin xe điện
                    </Text>
                  </Space>
                  <Row gutter={[8, 8]} style={{ marginLeft: 24 }}>
                    <Col span={24}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Model & Phiên bản:
                        </Text>
                        <Text strong style={{ fontSize: 13 }}>
                          {quoteData.vehicleName}
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Màu sắc:
                        </Text>
                        <Text strong style={{ fontSize: 13 }}>
                          {quoteData.colorName}
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Số lượng:
                        </Text>
                        <Text strong style={{ fontSize: 14, color: "#52c41a" }}>
                          {quoteData.quantity} xe
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Promotion Info */}
                {quoteData.promotionName && (
                  <>
                    <Divider style={{ margin: 0 }} />
                    <div>
                      <Space style={{ marginBottom: 8 }}>
                        <GiftOutlined
                          style={{ color: "#fa8c16", fontSize: 16 }}
                        />
                        <Text strong style={{ fontSize: 14 }}>
                          Khuyến mãi
                        </Text>
                      </Space>
                      <div
                        style={{
                          marginLeft: 24,
                          padding: "12px",
                          backgroundColor: "#fff7e6",
                          border: "1px solid #ffd591",
                          borderRadius: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text
                            strong
                            style={{ fontSize: 14, color: "#d46b08" }}
                          >
                            🎁 {quoteData.promotionName}
                          </Text>
                          {quoteData.promotionValue && (
                            <div>
                              {quoteData.promotionType === 1 ? (
                                <Tag
                                  color="blue"
                                  icon={<PercentageOutlined />}
                                  style={{ fontSize: 13, padding: "4px 12px" }}
                                >
                                  Giảm {quoteData.promotionValue}%
                                </Tag>
                              ) : (
                                <Tag
                                  color="green"
                                  icon={<DollarOutlined />}
                                  style={{ fontSize: 13, padding: "4px 12px" }}
                                >
                                  Giảm{" "}
                                  {formatCurrency(quoteData.promotionValue)}
                                </Tag>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Price Info */}
                {quoteData.unitPrice && (
                  <>
                    <Divider style={{ margin: 0 }} />
                    <div>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        {/* Giá gốc */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Giá gốc:
                          </Text>
                          <Text strong style={{ fontSize: 14 }}>
                            {formatCurrency(
                              quoteData.unitPrice * quoteData.quantity
                            )}
                          </Text>
                        </div>

                        {/* Giảm giá */}
                        {quoteData.totalPrice <
                          quoteData.unitPrice * quoteData.quantity && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              Giảm giá:
                            </Text>
                            <Text
                              strong
                              style={{ fontSize: 14, color: "#fa8c16" }}
                            >
                              -
                              {formatCurrency(
                                quoteData.unitPrice * quoteData.quantity -
                                  quoteData.totalPrice
                              )}
                            </Text>
                          </div>
                        )}

                        {/* Divider */}
                        <Divider style={{ margin: "8px 0" }} />

                        {/* Tổng tiền */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px",
                            backgroundColor: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            borderRadius: 6,
                          }}
                        >
                          <Text strong style={{ fontSize: 15 }}>
                            Tổng tiền:
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: 16, color: "#52c41a" }}
                          >
                            {formatCurrency(quoteData.totalPrice)}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </>
                )}
              </Space>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <Space size="middle" style={{ marginTop: 24 }}>
          <Button
            size="large"
            icon={<FileTextOutlined />}
            onClick={onViewQuotes}
            style={{ minWidth: 180 }}
          >
            Xem danh sách báo giá
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
            style={{ minWidth: 180 }}
          >
            Tạo báo giá mới
          </Button>
        </Space>
      </div>
    </Modal>
  );
}

export default SuccessModal;
