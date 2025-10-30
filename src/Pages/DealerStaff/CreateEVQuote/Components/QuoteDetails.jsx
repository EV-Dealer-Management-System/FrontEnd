import React from "react";
import { ProCard } from "@ant-design/pro-components";
import {
  Input,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
  Table,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CarOutlined,
  GiftOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

function QuoteDetails({
  vehicleList,
  note,
  onNoteChange,
  inventory,
  promotions,
}) {
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

  // Tính tổng số lượng xe
  const totalQuantity = vehicleList.reduce(
    (sum, vehicle) => sum + (vehicle.quantity || 0),
    0
  );

  // Kiểm tra danh sách xe hợp lệ
  const hasValidVehicles = vehicleList.some(
    (v) => v.versionId && v.colorId && v.quantity > 0
  );

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
              {info.versionName} - {info.colorName}
            </Text>
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
        <Text strong className="text-blue-600">
          {record.quantity || 0} xe
        </Text>
      ),
    },
    {
      title: "Khuyến mãi",
      key: "promotion",
      render: (_, record) => {
        const promotion = getPromotionInfo(record.promotionId);
        if (!promotion) return <Text type="secondary">Không có</Text>;
        return (
          <Space direction="vertical" size={2}>
            <Text className="text-sm">🎁 {promotion.name}</Text>
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
          <Text strong>Chi tiết báo giá</Text>
        </Space>
      }
      bordered
      headerBordered
    >
      {hasValidVehicles ? (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Tổng quan */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Row gutter={24} align="middle">
              <Col span={12}>
                <Statistic
                  title={
                    <Text strong className="text-base">
                      Tổng số xe
                    </Text>
                  }
                  value={totalQuantity}
                  suffix="xe"
                  valueStyle={{ color: "#1890ff", fontSize: 24 }}
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <Text strong className="text-base">
                      Số loại xe
                    </Text>
                  }
                  value={vehicleList.filter((v) => v.versionId && v.colorId).length}
                  suffix="loại"
                  valueStyle={{ color: "#52c41a", fontSize: 24 }}
                />
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Bảng danh sách xe */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space>
                <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <Text strong style={{ fontSize: 15 }}>
                  Danh sách xe trong báo giá
                </Text>
              </Space>
            </div>
            <Table
              columns={columns}
              dataSource={vehicleList}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
              className="rounded-lg overflow-hidden"
            />
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Ghi chú */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space>
                <FileTextOutlined style={{ color: "#722ed1", fontSize: 16 }} />
                <Text strong style={{ fontSize: 15 }}>
                  Ghi chú
                </Text>
              </Space>
            </div>
            <TextArea
              placeholder="Nhập ghi chú cho báo giá (tùy chọn)&#10;VD: Yêu cầu giao hàng, thông tin liên hệ..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={4}
              showCount
              maxLength={300}
              style={{ resize: "none" }}
            />
          </div>
        </Space>
      ) : (
        <Alert
          message="Chưa có thông tin"
          description="Vui lòng chọn xe điện, màu sắc và số lượng ở bước trước để xem chi tiết báo giá."
          type="info"
          showIcon
        />
      )}
    </ProCard>
  );
}

export default QuoteDetails;
