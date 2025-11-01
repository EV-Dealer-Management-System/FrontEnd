import React from "react";
import { Modal, Typography, Button, Tag, Space } from "antd";
import { ProCard, StatisticCard, ProTable } from "@ant-design/pro-components";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  CarOutlined,
  GiftOutlined,
  PercentageOutlined,
  ShoppingOutlined,
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={950}
      centered
      destroyOnClose
    >
      {quoteData && (
        <div className="p-6">
          {/* Header */}
          <div className="mb-5 text-center">
            <Title level={3} className="mb-2 text-green-600">
              Tạo Báo Giá Thành Công!
            </Title>
            <Text type="secondary" className="text-sm">
              Báo giá xe điện đã được lưu vào hệ thống
            </Text>
            <div className="mt-2 flex items-center justify-center gap-4">
              <Text strong>Mã báo giá: #{quoteData.quoteId || "N/A"}</Text>
              <Text type="secondary">| Tạo vào lúc: </Text>
              <Text type="secondary">
                {quoteData?.createdAt && formatDate(quoteData.createdAt)}
              </Text>
            </div>
          </div>

          {/* Summary Statistics */}
          <StatisticCard.Group className="mb-6">
            <StatisticCard
              statistic={{
                title: "Loại Xe",
                value: quoteData.totalVehicles || 0,
                suffix: "loại",
              }}
            />
            <StatisticCard
              statistic={{
                title: "Tổng Số Lượng",
                value: quoteData.totalQuantity || 0,
                suffix: "xe",
              }}
            />
            <StatisticCard
              statistic={{
                title: "Tổng Giá Trị",
                value: quoteData.totalAmount || 0,
                precision: 0,
                valueStyle: { color: "#52c41a", fontWeight: "bold" },
                formatter: (value) => formatCurrency(value),
              }}
            />
          </StatisticCard.Group>

          {/* Items Table - ProTable */}
          <ProTable
            headerTitle={
              <Space>
                <CarOutlined />
                <span className="font-semibold">Chi Tiết Sản Phẩm</span>
                <Tag color="blue">{quoteData.quoteDetails?.length || 0} mặt hàng</Tag>
              </Space>
            }
            dataSource={quoteData.quoteDetails?.map((detail, index) => ({
              ...detail,
              key: index,
              stt: index + 1,
              subtotal: (detail.unitPrice || 0) * (detail.quantity || 0),
              discount: (detail.unitPrice || 0) * (detail.quantity || 0) - (detail.totalPrice || 0),
              discountPercent: ((detail.unitPrice || 0) * (detail.quantity || 0) - (detail.totalPrice || 0)) > 0
                ? ((((detail.unitPrice || 0) * (detail.quantity || 0) - (detail.totalPrice || 0)) / ((detail.unitPrice || 0) * (detail.quantity || 0))) * 100).toFixed(1)
                : 0,
            }))}
            columns={[
              {
                title: "STT",
                dataIndex: "stt",
                width: 60,
                align: "center",
                render: (text) => (
                  <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center mx-auto">
                    <Text strong className="text-white text-sm">
                      {text}
                    </Text>
                  </div>
                ),
              },
              {
                title: "Sản Phẩm",
                dataIndex: "vehicleName",
                width: 250,
                render: (text) => (
                  <Text strong>{text || "N/A"}</Text>
                ),
              },
              {
                title: "Màu Sắc",
                dataIndex: "colorName",
                width: 120,
                align: "center",
                render: (text) => (
                  <Tag icon={<CarOutlined />} color="blue">
                    {text || "N/A"}
                  </Tag>
                ),
              },
              {
                title: "Số Lượng",
                dataIndex: "quantity",
                width: 100,
                align: "center",
                render: (text) => (
                  <Tag color="cyan" className="text-sm px-3 py-1">
                    {text || 0} xe
                  </Tag>
                ),
              },
              {
                title: "Khuyến Mãi",
                dataIndex: "promotionName",
                width: 180,
                render: (text) =>
                  text ? (
                    <Tag icon={<GiftOutlined />} color="orange" className="text-xs">
                      {text}
                    </Tag>
                  ) : (
                    <Text type="secondary" className="text-xs">-</Text>
                  ),
              },
              {
                title: "Đơn Giá",
                dataIndex: "unitPrice",
                width: 140,
                align: "right",
                render: (text) => <Text>{formatCurrency(text || 0)}</Text>,
              },
              {
                title: "Tạm Tính",
                dataIndex: "subtotal",
                width: 140,
                align: "right",
                render: (text) => <Text strong>{formatCurrency(text)}</Text>,
              },
              {
                title: "Giảm Giá",
                dataIndex: "discount",
                width: 140,
                align: "right",
                render: (text, record) =>
                  text > 0 ? (
                    <div>
                      <Tag color="orange" className="mb-1 text-xs">
                        {record.discountPercent}%
                      </Tag>
                      <br />
                      <Text strong className="text-orange-600 text-sm">
                        -{formatCurrency(text)}
                      </Text>
                    </div>
                  ) : (
                    <Text type="secondary">-</Text>
                  ),
              },
              {
                title: "Thành Tiền",
                dataIndex: "totalPrice",
                width: 150,
                align: "right",
                render: (text) => (
                  <Text strong className="text-green-600 text-base">
                    {formatCurrency(text || 0)}
                  </Text>
                ),
              },
            ]}
            pagination={false}
            search={false}
            options={false}
            bordered
            className="mb-4"
          />

          {/* Note */}
          {quoteData.note && (
            <ProCard
              size="small"
              className="mb-4 bg-blue-50 border border-blue-200"
            >
              <Space direction="vertical" size="small" className="w-full">
                <Space>
                  <FileTextOutlined className="text-blue-500" />
                  <Text strong className="text-blue-600">
                    Ghi chú
                  </Text>
                </Space>
                <Text className="text-gray-700">{quoteData.note}</Text>
              </Space>
            </ProCard>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
            <Button
              size="large"
              icon={<FileTextOutlined />}
              onClick={onViewQuotes}
              className="h-11 px-6"
            >
              Xem Danh Sách
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={onCreateNew}
              className="h-11 px-6"
            >
              Tạo Mới
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SuccessModal;
