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
            width: 50,
            align: "center",
            render: (text, record, index) => (
                <span style={{ fontWeight: 600, color: "#595959" }}>{index + 1}</span>
            ),
        },
        {
            title: "Người Tạo",
            dataIndex: "createdBy",
            key: "createdBy",
            width: 120,
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <div style={{ fontSize: 13, color: "#595959" }}>{text || "N/A"}</div>
                </Tooltip>
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
            title: "SL Xe",
            dataIndex: "totalQuantity",
            key: "totalQuantity",
            width: 80,
            align: "center",
            sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
            render: (text) => (
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        backgroundColor: "#e6f7ff",
                        borderRadius: 6,
                        border: "1px solid #91d5ff",
                    }}
                >
                    <CarOutlined style={{ color: "#1890ff", fontSize: 12 }} />
                    <span style={{ fontWeight: 600, color: "#1890ff", fontSize: 13 }}>
                        {text || 0}
                    </span>
                </div>
            ),
        },
        {
            title: "Ngày Đặt",
            dataIndex: "bookingDate",
            key: "bookingDate",
            width: 130,
            sorter: (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
            render: (text) => (
                <div style={{ fontSize: 12, color: "#595959" }}>
                    {formatDateTime(text)}
                </div>
            ),
        },
        {
            title: "E-Contract",
            dataIndex: "eContract",
            key: "eContract",
            width: 130,
            ellipsis: true,
            render: (eContract) => {
                if (!eContract) {
                    return (
                        <Tag color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                            Chưa có
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
                    text: "N/A",
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
                        <Tag
                            color={statusInfo.color}
                            icon={<AuditOutlined />}
                            style={{
                                borderRadius: 6,
                                fontSize: 11,
                                padding: "2px 8px",
                                fontWeight: 500,
                            }}
                        >
                            {statusInfo.text}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "Thao Tác",
            key: "actions",
            width: 240,
            align: "center",
            render: (_, record) => {
                const isUpdating = updatingStatus[record.id];
                const isPending = record.status === 1; // Status Pending = 1
                const isApproved = record.status === 2; // Status Approved = 2

                return (
                    <Space size={8} wrap>
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                onClick={() => onViewDetail(record)}
                                size="middle"
                                style={{
                                    borderRadius: 6,
                                    borderColor: "#d9d9d9",
                                }}
                            />
                        </Tooltip>

                        {isPending && (
                            <Tooltip title="Duyệt đơn">
                                <Button
                                    type="primary"
                                    icon={<AuditOutlined />}
                                    onClick={() => showReviewModal(record)}
                                    loading={isUpdating}
                                    size="middle"
                                    style={{
                                        borderRadius: 6,
                                        backgroundColor: "#1890ff",
                                        borderColor: "#1890ff",
                                    }}
                                />
                            </Tooltip>
                        )}

                        {isApproved && (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => {
                                    navigate(`/admin/booking/ready-booking-signing?bookingId=${record.id}`);
                                }}
                                size="middle"
                                style={{
                                    borderRadius: 6,
                                    backgroundColor: "#52c41a",
                                    borderColor: "#52c41a",
                                    fontWeight: 500,
                                }}
                            >
                                Ký Hợp Đồng
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
