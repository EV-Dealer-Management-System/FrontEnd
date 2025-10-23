import React from "react";
import { Image, Typography, Tag, Space, Button, Divider } from "antd";
import { ProCard } from "@ant-design/pro-components";
import {
  CarOutlined,
  EyeOutlined,
  DollarOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

function VehicleCard({ vehicle, formatPriceShort, onViewDetails }) {
  return (
    <ProCard
      hoverable
      className="rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
      bodyStyle={{ padding: 0 }}
    >
      {/* Ảnh */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {vehicle.imgUrl?.[0] ? (
          <Image
            src={vehicle.imgUrl[0]}
            alt={vehicle.modelName || vehicle.version?.modelName}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            preview={{ mask: "Xem ảnh" }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <CarOutlined className="text-6xl text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Tag
            icon={vehicle.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={vehicle.isActive ? "success" : "default"}
            className="px-2 py-1 text-xs font-medium shadow-sm"
          >
            {vehicle.isActive ? "Đang KD" : "Ngừng KD"}
          </Tag>
          <Tag
            color={vehicle.quantity > 0 ? "blue" : "red"}
            className="px-2 py-1 text-xs font-medium shadow-sm"
          >
            {vehicle.quantity > 0 ? `${vehicle.quantity} xe` : "Hết hàng"}
          </Tag>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-4">
        {/* Tên xe */}
        <div className="mb-3">
          <Title level={5} className="mb-1 text-gray-800">
            Mẫu xe: {vehicle.modelName || vehicle.version?.modelName}
          </Title>
          <Text type="secondary" className="text-sm">
            Phiên Bản: {vehicle.versionName || vehicle.version?.versionName}
          </Text>
        </div>

        <Divider className="my-3" />
        {/* Thông tin chi tiết */}
        <Space direction="vertical" size={8} className="w-full mb-3">
          {/* Giá bán */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-3 py-2 border border-green-100">
            <Space size={6}>
              <DollarOutlined className="text-green-600 text-base" />
            </Space>
            <Text strong className="text-green-600 text-base">
             Giá Bán: {formatPriceShort(vehicle.price)}
            </Text>
          </div>

          {/* Màu sắc */}
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-3 py-2 border border-purple-100">
            <Space size={6}>
              <BgColorsOutlined className="text-purple-600 text-base" />
            </Space>
            <Space size={6}>
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{
                  backgroundColor: vehicle.color?.colorCode || vehicle.colorCode || "#8b5cf6",
                }}
              />
              <Text strong className="text-purple-600 text-sm">
                Màu sắc: {vehicle.color?.colorName || vehicle.colorName}
              </Text>
            </Space>
          </div>
        </Space>

        {/* Nút xem chi tiết */}
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails && onViewDetails(vehicle.versionId)}
          className="w-full mt-2 h-9 font-medium shadow-sm hover:shadow-md"
          size="middle"
        >
          Xem thông số kỹ thuật
        </Button>
      </div>
    </ProCard>
  );
}

export default VehicleCard;
