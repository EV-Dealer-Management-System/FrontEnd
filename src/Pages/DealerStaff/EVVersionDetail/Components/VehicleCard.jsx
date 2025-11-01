import React from "react";
import { Typography, Tag, Button, Space } from "antd";
import { ProCard } from "@ant-design/pro-components";
import {
  CarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  BgColorsOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function VehicleCard({ vehicle, onViewDetails }) {
  // Format giá VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <ProCard
      hoverable
      bordered
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        height: "100%",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Ảnh xe */}
      <div
        style={{
          position: "relative",
          height: "200px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {vehicle.imgUrl?.[0] ? (
          <img
            src={vehicle.imgUrl[0]}
            alt={vehicle.modelName || vehicle.version?.modelName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <CarOutlined style={{ fontSize: "64px", color: "rgba(255,255,255,0.3)" }} />
        )}

        {/* Status badges */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "10px",
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Tag
            icon={vehicle.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={vehicle.isActive ? "success" : "default"}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "4px",
            }}
          >
            {vehicle.isActive ? "Còn Hàng" : "Ngừng Bán"}
          </Tag>
        </div>
      </div>

      {/* Nội dung */}
      <div style={{ padding: "16px" }}>
        {/* Tên xe */}
        <Title level={5} style={{ marginBottom: "2px", fontSize: "16px", fontWeight: 600 }}>
          {vehicle.modelName || vehicle.version?.modelName}
        </Title>
        <Text type="secondary" style={{ fontSize: "13px", display: "block", marginBottom: "12px" }}>
          {vehicle.versionName || vehicle.version?.versionName}
        </Text>

        {/* Giá bán */}
        <div
          style={{
            textAlign: "center",
            padding: "8px",
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #bbf7d0",
          }}
        >
          <Text type="secondary" style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>
            Giá Bán Lẻ
          </Text>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "3px" }}>
            <Text style={{ fontSize: "11px", color: "#059669" }}>₫</Text>
            <Text
              strong
              style={{
                fontSize: "20px",
                color: "#059669",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {formatPrice(vehicle.price)}
            </Text>
            <Text style={{ fontSize: "11px", color: "#059669" }}>₫</Text>
          </div>
        </div>

        {/* Thông tin chi tiết - 2 cột */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {/* Màu sắc */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "8px 6px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            <Text type="secondary" style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>
              Màu sắc
            </Text>
            <Text strong style={{ fontSize: "12px", display: "block" }}>
              {vehicle.color?.colorName || vehicle.colorName || "Đen"}
            </Text>
          </div>

          {/* Số lượng */}
          <div
            style={{
              textAlign: "center",
              padding: "8px 6px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "22px",
                display: "block",
                color: vehicle.quantity > 0 ? "#1890ff" : "#ff4d4f",
                lineHeight: 1,
                marginTop: "6px",
                marginBottom: "6px",
              }}
            >
              {vehicle.quantity}
            </Text>
            <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
              Số lượng
            </Text>
            <Text strong style={{ fontSize: "12px", display: "block", color: "#666" }}>
              xe
            </Text>
          </div>
        </div>

        {/* Nút xem chi tiết */}
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails && onViewDetails(vehicle.versionId)}
          block
          size="middle"
          style={{
            height: "36px",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "8px",
          }}
        >
          Xem Thông Số Kỹ Thuật
        </Button>
      </div>
    </ProCard>
  );
}

export default VehicleCard;
