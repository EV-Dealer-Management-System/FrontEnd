import React from "react";
import { Modal, Button } from "antd";
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

function BookingReviewModal({
  visible,
  booking,
  onClose,
  onApprove,
  onReject,
  loading,
}) {
  return (
    <Modal
      title={
        <div className="flex items-center">
          <AuditOutlined className="mr-2 text-blue-500" />
          <span className="font-semibold">Hủy Đơn Booking</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={450}
      centered
    >
      <div className="py-6">
        <p className="text-lg mb-8 text-center text-gray-700">
          Bạn có chắc chắn muốn hủy đơn booking này không?
        </p>

        <div className="flex gap-3">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onApprove}
            loading={loading}
            size="large"
            className="flex-1"
            style={{ height: 48 }}
          >
            <span className="font-semibold">Đồng Ý</span>
          </Button>

          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={onReject}
            loading={loading}
            size="large"
            className="flex-1"
            style={{ height: 48 }}
          >
            <span className="font-semibold">Từ Chối</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BookingReviewModal;
