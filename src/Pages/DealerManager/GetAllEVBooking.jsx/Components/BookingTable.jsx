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
  CarOutlined,
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

  // Hiển thị trạng thái booking với style nâng cao
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
        color: "#fa8c16",
        bg: "#fff7e6",
        text: "Chờ Duyệt",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "#52c41a",
        bg: "#f6ffed",
        text: "Đã Duyệt",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "#ff4d4f",
        bg: "#fff1f0",
        text: "Từ Chối",
        icon: <CloseCircleOutlined />,
      },
      cancelled: {
        color: "#8c8c8c",
        bg: "#fafafa",
        text: "Đã Hủy",
        icon: <CloseCircleOutlined />,
      },
      completed: {
        color: "#1890ff",
        bg: "#e6f7ff",
        text: "Hoàn Thành",
        icon: <CheckCircleOutlined />,
      },
    };

    const statusInfo = statusMap[statusValue] || {
      color: "#d9d9d9",
      bg: "#fafafa",
      text: "N/A",
      icon: null,
    };

    return (
      <Tag
        icon={statusInfo.icon}
        style={{
          color: statusInfo.color,
          backgroundColor: statusInfo.bg,
          borderColor: statusInfo.color,
          padding: "4px 12px",
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 6,
        }}
      >
        {statusInfo.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      valueType: "indexBorder",
      width: 60,
      align: "center",
      fixed: "left",
      render: (text, record, index) => (
        <span style={{ fontWeight: 600, color: "#595959" }}>{index + 1}</span>
      ),
    },
    {
      title: "Mã Booking",
      dataIndex: "id",
      key: "id",
      width: 220,
      copyable: true,
      ellipsis: true,
      fixed: "left",
      render: (text) => {
        const displayId =
          text && typeof text === "string" ? text.split("-")[0] : text || "N/A";

        return (
          <Tooltip title={text || "N/A"}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag
                color="blue"
                style={{
                  margin: 0,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                ID
              </Tag>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#1890ff",
                  fontWeight: 600,
                }}
              >
                {displayId}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngày Đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 150,
      sorter: (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
      render: (text) => (
        <div style={{ fontSize: 13, color: "#595959" }}>
          {formatDateTime(text)}
        </div>
      ),
    },
    {
      title: "Số Lượng Xe",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 110,
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
      render: (text) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            backgroundColor: "#e6f7ff",
            borderRadius: 8,
            border: "1px solid #91d5ff",
          }}
        >
          <CarOutlined style={{ color: "#1890ff", fontSize: 14 }} />
          <span style={{ fontWeight: 600, color: "#1890ff", fontSize: 14 }}>
            {text || 0}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Người Tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 150,
      ellipsis: true,
      render: (text) => (
        <div style={{ fontSize: 13, color: "#595959" }}>{text || "N/A"}</div>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 240,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const isUpdating = updatingStatus[record.id];
        const isPending = record.status === 0 || record.status === "pending";

        return (
          <Space size={8}>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record)}
              size="middle"
              style={{
                borderRadius: 6,
                fontWeight: 500,
                borderColor: "#d9d9d9",
              }}
            >
              Chi tiết
            </Button>

            {isPending && (
              <Button
                type="primary"
                icon={<AuditOutlined />}
                onClick={() => showReviewModal(record)}
                loading={isUpdating}
                size="middle"
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
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
        toolbar={false}
        options={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (
            <span style={{ fontSize: 13, color: "#595959" }}>
              Hiển thị{" "}
              <strong>
                {range[0]}-{range[1]}
              </strong>{" "}
              trong tổng số <strong>{total}</strong> booking
            </span>
          ),
          pageSizeOptions: ["5", "10", "20", "50", "100"],
          size: "default",
          style: { marginTop: 16 },
        }}
        scroll={{ x: 1100 }}
        cardBordered={false}
        headerTitle={false}
        size="middle"
        rowClassName={(record, index) => {
          const isPending = record.status === 0 || record.status === "pending";
          if (isPending) {
            return "highlight-pending-row";
          }
          return index % 2 === 0 ? "table-row-even" : "table-row-odd";
        }}
        style={{
          borderRadius: 8,
        }}
        tableStyle={{
          borderRadius: 8,
        }}
      />

      {/* Modal Duyệt Đơn */}
      <BookingReviewModal
        visible={reviewModal.visible}
        booking={reviewModal.booking}
        onClose={closeReviewModal}
        onApprove={() =>
          handleUpdateStatus(reviewModal.booking?.id, 1, "Đồng Ý")
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
