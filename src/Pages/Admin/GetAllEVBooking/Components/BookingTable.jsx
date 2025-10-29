import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";

function BookingTable({
    dataSource,
    loading,
    onViewDetail,
    formatDateTime,
    onStatusUpdate,
}) {
    const navigate = useNavigate();
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
            title: "Trạng Thái",
            dataIndex: "status",
            key: "status",
            width: 140,
            align: "center",
            render: (status) => getStatusTag(status),
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
            title: "Thao Tác",
            key: "actions",
            width: 280,
            align: "center",
            fixed: "right",
            render: (_, record) => {
                const isUpdating = updatingStatus[record.id];
                const isPending = record.status === 1; // Status Pending = 1
                const isApproved = record.status === 2; // Status Approved = 2

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

                        {isApproved && (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => {
                                    // Điều hướng đến trang ký hợp đồng với booking ID
                                    navigate(`/admin/booking/ready-booking-signing?bookingId=${record.id}`);
                                }}
                                size="middle"
                                style={{
                                    borderRadius: 6,
                                    fontWeight: 500,
                                    backgroundColor: "#52c41a",
                                    borderColor: "#52c41a",
                                }}
                            >
                                Kí Hợp Đồng
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <ConfigProvider locale={viVN}>
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
                        // showQuickJumper: true,
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
                        const isPending = record.status === 1; // Status Pending = 1
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
                        handleUpdateStatus(reviewModal.booking?.id, 2, "Đồng Ý")
                    }
                    onReject={() =>
                        handleUpdateStatus(reviewModal.booking?.id, 3, "Từ chối")
                    }
                    loading={updatingStatus[reviewModal.booking?.id]}
                />
            </>
        </ConfigProvider>
    );
}

export default BookingTable;
