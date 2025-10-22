import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Typography, Row, Col, Space, Divider, Alert, Tag } from "antd";
import {
  CheckCircleOutlined,
  CarOutlined,
  GiftOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

function ConfirmationStep({
  selectedVehicle,
  quantity,
  selectedPromotion,
  note,
  dashboardStats,
  validationErrors,
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  return (
    <ProCard
      title={
        <Space>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <Text strong>Xác nhận thông tin báo giá</Text>
        </Space>
      }
      bordered
      headerBordered
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Thông tin xe */}
        {selectedVehicle && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space>
                <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <Text strong style={{ fontSize: 15 }}>
                  Thông tin xe điện
                </Text>
              </Space>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#e6f7ff",
                border: "1px solid #91d5ff",
                borderRadius: 8,
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Model
                    </Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {selectedVehicle.modelName}
                    </Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Phiên bản
                    </Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {selectedVehicle.versionName}
                    </Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Màu sắc
                    </Text>
                    <Text strong style={{ fontSize: 14 }}>
                      {selectedVehicle.colorName}
                    </Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Số lượng
                    </Text>
                    <Text strong style={{ fontSize: 16, color: "#52c41a" }}>
                      {quantity} xe
                    </Text>
                  </Space>
                </Col>
              </Row>
            </div>
          </div>
        )}

        <Divider style={{ margin: 0 }} />

        {/* Khuyến mãi */}
        {selectedPromotion ? (
          <>
            <div>
              <div style={{ marginBottom: 12 }}>
                <Space>
                  <GiftOutlined style={{ color: "#fa8c16", fontSize: 16 }} />
                  <Text strong style={{ fontSize: 15 }}>
                    Khuyến mãi áp dụng
                  </Text>
                </Space>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: "#d46b08" }}>
                  🎁 {selectedPromotion.name}
                </Text>
              </div>
            </div>
            <Divider style={{ margin: 0 }} />
          </>
        ) : (
          <>
            <div>
              <div style={{ marginBottom: 12 }}>
                <Space>
                  <GiftOutlined style={{ color: "#bfbfbf", fontSize: 16 }} />
                  <Text type="secondary" style={{ fontSize: 15 }}>
                    Khuyến mãi
                  </Text>
                </Space>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f5f5f5",
                  border: "1px dashed #d9d9d9",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Không áp dụng khuyến mãi
                </Text>
              </div>
            </div>
            <Divider style={{ margin: 0 }} />
          </>
        )}

        {/* Ghi chú */}
        {note && (
          <>
            <div>
              <div style={{ marginBottom: 12 }}>
                <Space>
                  <FileTextOutlined
                    style={{ color: "#722ed1", fontSize: 16 }}
                  />
                  <Text strong style={{ fontSize: 15 }}>
                    Ghi chú
                  </Text>
                </Space>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f9f0ff",
                  border: "1px solid #d3adf7",
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 14 }}>{note}</Text>
              </div>
            </div>
            <Divider style={{ margin: 0 }} />
          </>
        )}

        {/* Tổng giá */}
        {/* <div>
          <div style={{ marginBottom: 12 }}>
            <Space>
              <DollarOutlined style={{ color: "#52c41a", fontSize: 16 }} />
              <Text strong style={{ fontSize: 15 }}>
                Chi tiết thanh toán
              </Text>
            </Space>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Giá gốc:</Text>
                <Text strong style={{ fontSize: 15 }}>
                  {formatCurrency(dashboardStats.currentQuoteValue)}
                </Text>
              </div>
              {dashboardStats.discountAmount > 0 && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text type="secondary">Giảm giá:</Text>
                  <Text strong style={{ fontSize: 15, color: "#fa8c16" }}>
                    -{formatCurrency(dashboardStats.discountAmount)}
                  </Text>
                </div>
              )}
              <Divider style={{ margin: 0 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 16 }}>
                  Tổng cộng:
                </Text>
                <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                  {formatCurrency(dashboardStats.finalValue)}
                </Text>
              </div>
            </Space>
          </div>
        </div> */}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert
            message="Vui lòng kiểm tra lại thông tin"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            type="error"
            showIcon
          />
        )}
      </Space>
    </ProCard>
  );
}

export default ConfirmationStep;
