import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Typography, Row, Col, Space, Divider, Alert, Tag, Table } from "antd";
import {
  CheckCircleOutlined,
  CarOutlined,
  GiftOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

function ConfirmationStep({
  vehicleList,
  inventory,
  promotions,
  note,
  dashboardStats,
  validationErrors,
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  // Lấy thông tin chi tiết xe từ inventory
  const getVehicleInfo = (vehicle) => {
    const inventoryItem = inventory.find(
      (item) =>
        item.versionId === vehicle.versionId && item.colorId === vehicle.colorId
    );
    return inventoryItem || null;
  };

  // Lấy thông tin khuyến mãi
  const getPromotionInfo = (promotionId) => {
    if (!promotionId) return null;
    return promotions.find((p) => p.id === promotionId);
  };

  // Columns cho bảng danh sách xe
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Thông tin xe",
      key: "vehicle",
      render: (_, record) => {
        const info = getVehicleInfo(record);
        if (!info) return <Text type="secondary">Chưa chọn xe</Text>;
        return (
          <Space direction="vertical" size={2}>
            <Text strong>{info.modelName}</Text>
            <Text type="secondary" className="text-sm">
              {info.versionName}
            </Text>
            <Tag color="blue" className="mt-1">
              {info.colorName}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Text strong className="text-green-600 text-base">
          {record.quantity || 0} xe
        </Text>
      ),
    },
    {
      title: "Khuyến mãi",
      key: "promotion",
      width: 200,
      render: (_, record) => {
        const promotion = getPromotionInfo(record.promotionId);
        if (!promotion) return <Text type="secondary">Không có</Text>;
        return (
          <Space direction="vertical" size={2}>
            <Text className="text-sm">🎁 {promotion.name}</Text>
            {promotion.discountType === 0 ? (
              <Tag color="green" className="text-xs">
                Giảm {formatCurrency(promotion.fixedAmount)}
              </Tag>
            ) : (
              <Tag color="blue" className="text-xs">
                Giảm {promotion.percentage}%
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

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
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert
            message="Vui lòng kiểm tra lại thông tin"
            description={
              <ul className="mb-0 pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            }
            type="error"
            showIcon
          />
        )}

        {/* Bảng danh sách xe */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <Space>
              <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
              <Text strong style={{ fontSize: 15 }}>
                Danh sách xe điện ({vehicleList.filter((v) => v.versionId && v.colorId).length} loại)
              </Text>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={vehicleList.filter((v) => v.versionId && v.colorId)}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            className="rounded-lg overflow-hidden"
          />
        </div>

        <Divider style={{ margin: 0 }} />

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
      </Space>
    </ProCard>
  );
}

export default ConfirmationStep;
