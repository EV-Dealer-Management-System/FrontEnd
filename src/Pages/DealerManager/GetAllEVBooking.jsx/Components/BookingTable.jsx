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
import EContractSuccessModal from "./EContractSuccessModal";
import CancelBookingModal from "./CancelBookingModal";
import { EVBookingConfirmEContract } from "../../../../App/DealerManager/EVBooking/EVBookingConfirm";

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
  const [eContractModal, setEContractModal] = useState(false);
  const [cancelModal, setCancelModal] = useState({
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

  // Hiển thị modal hủy đơn
  const showCancelModal = (booking) => {
    setCancelModal({
      visible: true,
      booking: booking,
    });
  };

  // Đóng modal hủy đơn
  const closeCancelModal = () => {
    setCancelModal({
      visible: false,
      booking: null,
    });
  };

  // Xử lý hủy đơn booking
  const handleCancelBooking = async (bookingId) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
    closeCancelModal();

    try {
      await EVBookingUpdateStatus(bookingId, 4); // Status 4 = Cancelled
      message.success("Đã hủy booking thành công!");

      // Refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      message.error(`Không thể hủy booking: ${error.message}`);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // 
  const handleEVBookingConfirmEContract = async (bookingId) => {
    try {
      const response = await EVBookingConfirmEContract(bookingId);
      console.log("EV booking confirm e-contract created:", response);
      message.success("E-Contract xác nhận booking đã được tạo thành công!");
      return response;
    } catch (error) {
      console.error("Error creating EV booking confirm e-contract:", error);
      message.error(
        `Không thể tạo E-Contract xác nhận booking: ${error.message}`
      );
      throw error;
    }
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
    // Mapping theo BookingStatus enum: Draft=0, Pending=1, Approved=2, Rejected=3, Cancelled=4, Completed=5
    const statusMap = {
      0: {
        color: "#8c8c8c",
        bg: "#fafafa",
        text: "Bản Nháp",
        icon: <SyncOutlined />,
      },
      1: {
        color: "#fa8c16",
        bg: "#fff7e6",
        text: "Chờ Duyệt",
        icon: <ClockCircleOutlined />,
      },
      2: {
        color: "#52c41a",
        bg: "#f6ffed",
        text: "Đã Duyệt",
        icon: <CheckCircleOutlined />,
      },
      3: {
        color: "#ff4d4f",
        bg: "#fff1f0",
        text: "Đã Từ Chối",
        icon: <CloseCircleOutlined />,
      },
      4: {
        color: "#8c8c8c",
        bg: "#fafafa",
        text: "Đã Hủy",
        icon: <CloseCircleOutlined />,
      },
      5: {
        color: "#1890ff",
        bg: "#e6f7ff",
        text: "Đã Hoàn Thành",
        icon: <CheckCircleOutlined />,
      },
    };

    const statusInfo = statusMap[status] || {
      color: "#d9d9d9",
      bg: "#fafafa",
      text: "Unknown",
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
    // {
    //   title: "Mã Booking",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 100,
    //   copyable: true,
    //   ellipsis: true,
    //   fixed: "left",
    //   render: (text) => {
    //     const fullId = text || "N/A";
    //     const displayId =
    //       typeof fullId === "string"
    //         ? fullId.slice(0, 8) + "..."
    //         : fullId;

    //     return (
    //       <Tooltip title={fullId}>
    //         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    //           <Tag
    //             color="blue"
    //             style={{
    //               margin: 0,
    //               fontSize: 11,
    //               padding: "2px 8px",
    //               borderRadius: 4,
    //             }}
    //           >
    //             ID
    //           </Tag>
    //           <span
    //             style={{
    //               fontFamily: "monospace",
    //               fontSize: 12,
    //               color: "#1890ff",
    //               fontWeight: 600,
    //             }}
    //           >
    //             {displayId}
    //           </span>
    //         </div>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: "Ngày Đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 150,
      sorter: (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
      defaultSortOrder: "descend",
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
      title: "E-Contract",
      dataIndex: "eContract",
      key: "eContract",
      width: 200,
      ellipsis: true,
      render: (eContract) => {
        if (!eContract) {
          return (
            <Tag color="default" style={{ borderRadius: 6 }}>
              Chưa có hợp đồng
            </Tag>
          );
        }

        // Mapping trạng thái hợp đồng: Draft=0, Pending=1, Approved=2, Rejected=3
        const contractStatusMap = {
          0: { color: "default", text: "Bản Nháp" },
          1: { color: "orange", text: "Chờ Duyệt" },
          2: { color: "green", text: "Đã Duyệt" },
          3: { color: "red", text: "Từ Chối" },
        };

        const statusInfo = contractStatusMap[eContract.status] || {
          color: "default",
          text: "Không xác định",
        };

        return (
          <Tooltip
            title={
              <div className="space-y-1">
                <div><strong>Tên file:</strong> {eContract.name}</div>
                <div><strong>Trạng thái:</strong> {statusInfo.text}</div>
                <div><strong>Người tạo:</strong> {eContract.createdName || "N/A"}</div>
                <div><strong>Chủ sở hữu:</strong> {eContract.ownerName || "N/A"}</div>
                <div><strong>Ngày tạo:</strong> {formatDateTime(eContract.createdAt)}</div>
              </div>
            }
          >
            <div className="flex flex-col gap-1">
              <Tag
                color={statusInfo.color}
                icon={<AuditOutlined />}
                style={{
                  borderRadius: 6,
                  fontSize: 12,
                  padding: "4px 10px",
                  fontWeight: 500,
                }}
              >
                {statusInfo.text}
              </Tag>
              <div
                className="text-xs text-gray-500 truncate"
                style={{ maxWidth: 180 }}
              >
                {eContract.name}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const isUpdating = updatingStatus[record.id];
        const isDraft = record.status === 0; // Status Draft = 0
        const isPending = record.status === 1; // Status Pending = 1 (Chờ Duyệt)

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

            {isDraft && (
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showReviewModal(record)}
                loading={isUpdating}
                size="middle"
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                Xác Nhận
              </Button>
            )}

            {isPending && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showCancelModal(record)}
                loading={isUpdating}
                size="middle"
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                Hủy đơn
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <style>
        {`
          .booking-table .ant-table {
            table-layout: auto !important;
          }
          .booking-table .ant-table-cell {
            white-space: normal !important;
            word-break: break-word !important;
          }
        `}
      </style>
      <ProTable
        className="booking-table"
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
        cardBordered={false}
        headerTitle={false}
        size="middle"
        rowClassName={(record, index) => {
          const isDraft = record.status === 0; // Status Draft = 0
          if (isDraft) {
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
        onApprove={async () => {
          const bookingId = reviewModal.booking?.id;
          setUpdatingStatus((prev) => ({ ...prev, [bookingId]: true }));
          closeReviewModal();

          try {
            // Gọi đồng thời 2 API
            const [eContractResponse] = await Promise.all([
              handleEVBookingConfirmEContract(bookingId),
              // EVBookingUpdateStatus(bookingId, 1)
            ]);

            console.log("E-Contract Response:", eContractResponse);

            if (eContractResponse?.status === 201) {

              setEContractModal(true);
            } else {
              message.success("Đã cập nhật booking thành công!");
            }

            // Refresh data
            if (onStatusUpdate) {
              onStatusUpdate();
            }
          } catch (error) {
            message.error(`Không thể xử lý booking: ${error.message}`);
          } finally {
            setUpdatingStatus((prev) => ({ ...prev, [bookingId]: false }));
          }
        }}
        onReject={() =>
          handleUpdateStatus(reviewModal.booking?.id, 4, "Từ chối")
        }
        loading={updatingStatus[reviewModal.booking?.id]}
      />

      <EContractSuccessModal
        visible={eContractModal}
        onClose={() => setEContractModal(false)}
      />

      {/* Modal Hủy Đơn */}
      <CancelBookingModal
        visible={cancelModal.visible}
        booking={cancelModal.booking}
        onClose={closeCancelModal}
        onConfirm={() => handleCancelBooking(cancelModal.booking?.id)}
        loading={updatingStatus[cancelModal.booking?.id]}
      />
    </>
  );
}

export default BookingTable;
