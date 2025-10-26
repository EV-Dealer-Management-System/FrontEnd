import React, { useState } from "react";
import { Modal, Button, Row, Col, Statistic, Space, Tag } from "antd";
import { ProDescriptions } from "@ant-design/pro-components";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

/**
 * Component ApprovalModal - Popup xử lý duyệt/từ chối báo giá
 * @param {boolean} visible - Hiển thị modal
 * @param {object} quote - Thông tin báo giá được chọn
 * @param {function} onClose - Đóng modal
 * @param {function} onConfirm - Xác nhận duyệt/từ chối
 */
function ApprovalModal({ visible, quote, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  // Xử lý duyệt báo giá
  const handleApprove = async () => {
    setLoading(true);
    try {
      await onConfirm(quote.id, 1, "");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Xử lý từ chối báo giá
  const handleReject = async () => {
    setLoading(true);
    try {
      await onConfirm(quote.id, 2, "");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!quote) return null;

  // Tính tổng số lượng
  const totalQuantity = quote.quoteDetails?.reduce(
    (sum, detail) => sum + detail.quantity,
    0
  );

  // Lấy thông tin xe đầu tiên
  const firstVehicle = quote.quoteDetails?.[0];

  return (
    <Modal
      title="Xác nhận duyệt báo giá"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={null}
      centered
      destroyOnClose
    >
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Statistic
            title="Tổng giá trị"
            value={quote.totalAmount}
            prefix={<DollarOutlined />}
            suffix="đ"
            valueStyle={{ color: "#3f8600", fontSize: "20px" }}
            formatter={(value) => new Intl.NumberFormat("vi-VN").format(value)}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Số lượng"
            value={totalQuantity}
            prefix={<ShoppingOutlined />}
            valueStyle={{ color: "#1677ff", fontSize: "20px" }}
          />
        </Col>
      </Row>

      {/* Quote Details */}
      <ProDescriptions
        column={1}
        size="small"
        bordered
        dataSource={quote}
        columns={[
          {
            title: "Mã báo giá",
            dataIndex: "id",
            render: (id) => (
              <Tag color="blue" className="font-mono text-xs">
                {id}
              </Tag>
            ),
          },
          {
            title: "Xe",
            render: () => (
              <Space direction="vertical" size={2}>
                <span className="font-semibold">
                  {firstVehicle?.version?.modelName}
                </span>
                <span className="text-gray-600 text-sm">
                  {firstVehicle?.version?.versionName}
                </span>
                <Space size="small">
                  <Tag color="blue">{firstVehicle?.color?.colorName}</Tag>
                  {quote.quoteDetails?.length > 1 && (
                    <Tag color="purple">
                      +{quote.quoteDetails.length - 1} xe
                    </Tag>
                  )}
                </Space>
              </Space>
            ),
          },
          {
            title: "Khuyến mãi",
            render: () =>
              firstVehicle?.promotion ? (
                <Tag color="pink">{firstVehicle.promotion.promotionName}</Tag>
              ) : (
                <span className="text-gray-400">Không có</span>
              ),
          },
        ]}
      />

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        <Button
          danger
          size="large"
          icon={<CloseCircleOutlined />}
          onClick={handleReject}
          loading={loading}
          className="min-w-[140px]"
        >
          Từ chối
        </Button>

        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleApprove}
          loading={loading}
          className="bg-green-500 hover:bg-green-600 border-green-500 min-w-[140px]"
        >
          Chấp nhận
        </Button>
      </div>
    </Modal>
  );
}

export default ApprovalModal;
