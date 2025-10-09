import React, { useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { Tag, Button, Tooltip, Space, message } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import EVBookingUpdateStatus from "../../../../App/DealerManager/EVBooking/EVBookingUpdateStatus";
import BookingReviewModal from "./BookingReviewModal";

function BookingTable({
  dataSource,
  loading,
  onViewDetail,
  formatDateTime,
  onStatusUpdate,
}) {
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [reviewModal, setReviewModal] = useState({
    visible: false,
    booking: null,
  });

  // Hiển thị modal duyệt đơn
  const showReviewModal = (booking) => {
    setReviewModal({
      visible: true,
      booking: booking,
    });
  };

  // Đóng modal
  const closeReviewModal = () => {
    setReviewModal({
      visible: false,
      booking: null,
    });
  };

  // Xử lý cập nhật trạng thái booking
  const handleUpdateStatus = async (bookingId, newStatus, statusText) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
    closeReviewModal(); // Đóng modal trước khi xử lý

    try {
      await EVBookingUpdateStatus(bookingId, newStatus);
      message.success(`Đã ${statusText.toLowerCase()} booking thành công!`);

      // Gọi callback để refresh data nếu có
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      message.error(
        `Không thể ${statusText.toLowerCase()} booking: ${error.message}`
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Hiển thị trạng thái booking
  const getStatusTag = (status) => {
    // Chuyển đổi status về dạng chuẩn
    let statusValue = "";
    if (typeof status === "number") {
      const numberStatusMap = {
        0: "pending",
        1: "approved",
        2: "rejected",
        3: "cancelled",
        4: "completed",
      };
      statusValue = numberStatusMap[status] || "";
    } else if (typeof status === "string") {
      statusValue = status.toLowerCase();
    } else {
      statusValue = "";
    }

    const statusMap = {
      pending: {
        color: "warning",
        text: "Chờ xác nhận",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "success",
        text: "Đã phê duyệt",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "error",
        text: "Đã từ chối",
        icon: <CloseCircleOutlined />,
      },
      cancelled: {
        color: "default",
        text: "Đã hủy",
        icon: <CloseCircleOutlined />,
      },
      completed: {
        color: "processing",
        text: "Hoàn thành",
        icon: <CheckCircleOutlined />,
      },
    };

    const statusInfo = statusMap[statusValue] || {
      color: "default",
      text: "Không xác định",
      icon: null,
    };

    return (
      <Tag icon={statusInfo.icon} color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      valueType: "indexBorder",
      width: 50,
      align: "center",
      fixed: "left",
    },
    {
      title: "Mã Booking",
      dataIndex: "id",
      key: "id",
      width: 180,
      copyable: true,
      ellipsis: true,
      fixed: "left",
      render: (text) => (
        <Tooltip title={text}>
          <span className="font-mono text-xs">{text || "N/A"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày Đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 140,
      sorter: (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
      render: (text) => <span className="text-xs">{formatDateTime(text)}</span>,
    },
    {
      title: "Số Lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 90,
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
      render: (text) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {text || 0} xe
        </Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Người Tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 140,
      ellipsis: true,
      render: (text) => <span className="text-xs">{text || "N/A"}</span>,
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const isUpdating = updatingStatus[record.id];
        const isPending = record.status === 0 || record.status === "pending";

        return (
          <Space size={4} wrap>
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail(record)}
                size="small"
              >
                Chi tiết
              </Button>
            </Tooltip>

            {isPending && (
              <Button
                type="primary"
                icon={<AuditOutlined />}
                onClick={() => showReviewModal(record)}
                loading={isUpdating}
                size="small"
              >
                Duyệt Đơn
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ProTable
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={(record) => record.id || record.bookingCode}
        search={false}
        dateFormatter="string"
        toolbar={{
          title: "Danh sách booking",
        }}
        options={{
          reload: false,
          density: false,
          fullScreen: false,
          setting: false,
        }}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} booking`,
          pageSizeOptions: ["10", "15", "20", "50"],
          size: "default",
        }}
        scroll={{ x: 1000 }}
        cardBordered={false}
        headerTitle={false}
        size="small"
        rowClassName={(record, index) =>
          index % 2 === 0 ? "bg-white" : "bg-gray-50"
        }
      />

      {/* Modal Duyệt Đơn */}
      <BookingReviewModal
        visible={reviewModal.visible}
        booking={reviewModal.booking}
        onClose={closeReviewModal}
        onApprove={() =>
          handleUpdateStatus(reviewModal.booking?.id, 1, "Phê duyệt")
        }
        onReject={() =>
          handleUpdateStatus(reviewModal.booking?.id, 2, "Từ chối")
        }
        loading={updatingStatus[reviewModal.booking?.id]}
      />
    </>
  );
}

export default BookingTable;
