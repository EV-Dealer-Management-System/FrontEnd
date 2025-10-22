import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Divider,
  Table,
  Space,
  Typography,
} from "antd";
import {
  CarOutlined,
  GiftOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function QuoteDetailModal({
  visible,
  quote,
  onClose,
  formatCurrency,
  formatDate,
  getQuoteStatus,
}) {
  if (!quote) return null;

  const statusInfo = getQuoteStatus(quote.status);

  // Columns for quote details table
  const columns = [
    {
      title: "Model xe",
      dataIndex: ["version", "modelName"],
      key: "modelName",
      render: (text, record) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-800">{text}</div>
          <div className="text-sm text-gray-500">
            {record.version.versionName}
          </div>
        </div>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: ["color", "colorName"],
      key: "colorName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Khuyến mãi",
      dataIndex: "promotion",
      key: "promotion",
      render: (promotion) => {
        if (promotion) {
          return (
            <Tag color="pink" icon={<GiftOutlined />}>
              {promotion.promotionName}
            </Tag>
          );
        }
        return <span className="text-gray-400">Không có</span>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (qty) => (
        <span className="font-semibold text-blue-600">{qty}</span>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (price) => (
        <span className="text-gray-700">{formatCurrency(price)}</span>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      render: (price) => (
        <span className="font-bold text-green-600">
          {formatCurrency(price)}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileTextOutlined className="text-xl text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">
              Chi tiết báo giá
            </div>
            <div className="text-xs text-gray-500">
              Thông tin đầy đủ về báo giá
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <div className="space-y-6 mt-4">
        {/* Quote Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item
              label={
                <Space className="text-gray-700">
                  <FileTextOutlined className="text-blue-500" />
                  <span className="font-medium">Mã báo giá</span>
                </Space>
              }
            >
              <Text code copyable className="text-blue-600 font-mono text-sm">
                {quote.id}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space className="text-gray-700">
                  <CalendarOutlined className="text-blue-500" />
                  <span className="font-medium">Ngày tạo</span>
                </Space>
              }
            >
              <Text className="text-gray-700">
                {formatDate(quote.createdAt)}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space className="text-gray-700">
                  <UserOutlined className="text-blue-500" />
                  <span className="font-medium">Người tạo</span>
                </Space>
              }
            >
              <Text code className="text-sm text-gray-600">
                {quote.createdBy}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="font-medium text-gray-700">Trạng thái</span>
              }
            >
              <Tag color={statusInfo.color} className="font-medium px-3 py-1">
                {statusInfo.text}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space className="text-gray-700">
                  <DollarOutlined className="text-green-500" />
                  <span className="font-medium">Tổng giá trị</span>
                </Space>
              }
              span={2}
            >
              <Text strong className="text-green-600 text-lg">
                {formatCurrency(quote.totalAmount)}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span className="font-medium text-gray-700">Ghi chú</span>}
              span={2}
            >
              <Text className="text-gray-700">
                {quote.note || "Không có ghi chú"}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider orientation="left" className="border-gray-300">
          <Space className="bg-white px-3">
            <CarOutlined className="text-blue-500 text-lg" />
            <span className="font-semibold text-gray-800 text-base">
              Chi tiết sản phẩm
            </span>
          </Space>
        </Divider>

        {/* Quote Details Table */}
        <Table
          columns={columns}
          dataSource={quote.quoteDetails}
          rowKey="id"
          pagination={false}
          bordered
          size="middle"
          className="shadow-sm"
          summary={(pageData) => {
            const totalQuantity = pageData.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            const totalPrice = pageData.reduce(
              (sum, item) => sum + item.totalPrice,
              0
            );

            return (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-blue-50">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong className="text-gray-800">
                      Tổng cộng
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <Text strong className="text-blue-600 text-base">
                      {totalQuantity}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <Text strong className="text-gray-500">
                      -
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong className="text-green-600 text-base">
                      {formatCurrency(totalPrice)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />

        {/* Promotion Details if any */}
        {quote.quoteDetails.some((detail) => detail.promotion) && (
          <>
            <Divider orientation="left" className="border-gray-300">
              <Space className="bg-white px-3">
                <GiftOutlined className="text-pink-500 text-lg" />
                <span className="font-semibold text-gray-800 text-base">
                  Thông tin khuyến mãi
                </span>
              </Space>
            </Divider>
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
              {quote.quoteDetails.map((detail, index) => {
                if (detail.promotion) {
                  const discount =
                    detail.unitPrice * detail.quantity - detail.totalPrice;
                  return (
                    <div
                      key={index}
                      className="space-y-2 p-3 bg-white rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <GiftOutlined className="text-pink-500" />
                        <Text strong className="text-gray-800 text-base">
                          {detail.promotion.promotionName}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2 pl-6">
                        <span className="text-sm text-gray-600">Giảm giá:</span>
                        <Text strong className="text-orange-600 text-base">
                          {formatCurrency(discount)}
                        </Text>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default QuoteDetailModal;
