import React, { useState, useEffect } from "react";
import {
    Drawer,
    Descriptions,
    Tag,
    Timeline,
    Empty,
    Divider,
    Card,
    Row,
    Col,
    Badge,
    Spin,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    CarOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { getEVModelById } from "../../../../App/DealerManager/EVBooking/Layouts/GetEVModelByID";
import { getEVVersionById } from "../../../../App/DealerManager/EVBooking/Layouts/GetEVVersionByID";
import { getEVColorById } from "../../../../App/DealerManager/EVBooking/Layouts/GetEVColorByID";

const BookingDetailDrawer = ({
    visible,
    onClose,
    booking,
    loading,
    formatDateTime,
    formatCurrency,
    getStatusTag,
}) => {
    // State để lưu thông tin chi tiết đã fetch
    const [detailsData, setDetailsData] = useState([]);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    // Fetch thông tin chi tiết khi booking thay đổi
    useEffect(() => {
        const fetchDetailsInfo = async () => {
            if (
                !booking ||
                !booking.bookingEVDetails ||
                booking.bookingEVDetails.length === 0
            ) {
                setDetailsData([]);
                return;
            }

            setFetchingDetails(true);
            try {
                const detailsWithNames = await Promise.all(
                    booking.bookingEVDetails.map(async (detail) => {
                        try {
                            // Fetch thông tin model, version, color song song
                            const [modelData, versionData, colorData] = await Promise.all([
                                detail.version?.modelId
                                    ? getEVModelById(detail.version.modelId).catch(() => null)
                                    : Promise.resolve(null),
                                detail.version?.versionId
                                    ? getEVVersionById(detail.version.versionId).catch(() => null)
                                    : Promise.resolve(null),
                                detail.colorId
                                    ? getEVColorById(detail.colorId).catch(() => null)
                                    : Promise.resolve(null),
                            ]);

                            return {
                                ...detail,
                                modelName:
                                    modelData?.result?.modelName || modelData?.modelName || "N/A",
                                versionName:
                                    versionData?.result?.versionName ||
                                    versionData?.versionName ||
                                    "N/A",
                                colorName:
                                    colorData?.result?.colorName || colorData?.colorName || "N/A",
                            };
                        } catch (error) {
                            console.error("Error fetching detail info:", error);
                            return {
                                ...detail,
                                modelName: "N/A",
                                versionName: "N/A",
                                colorName: "N/A",
                            };
                        }
                    })
                );

                setDetailsData(detailsWithNames);
            } catch (error) {
                console.error("Error fetching booking details info:", error);
                setDetailsData(booking.bookingEVDetails);
            } finally {
                setFetchingDetails(false);
            }
        };

        if (visible && booking) {
            fetchDetailsInfo();
        }
    }, [booking, visible]);

    // Helper function để lấy giá trị từ object hoặc string
    const getValue = (value) => {
        if (typeof value === "object" && value?.value) return String(value.value);
        return value ? String(value) : "N/A";
    };

    // Lấy icon cho status
    const getStatusIcon = (status) => {
        // Mapping theo BookingStatus enum: Draft=0, Pending=1, Approved=2, Rejected=3, Cancelled=4, Completed=5
        const iconMap = {
            0: <SyncOutlined style={{ color: "#8c8c8c" }} />,       // Draft
            1: <ClockCircleOutlined style={{ color: "#fa8c16" }} />, // Pending
            2: <CheckCircleOutlined style={{ color: "#52c41a" }} />, // Approved
            3: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />, // Rejected
            4: <CloseCircleOutlined style={{ color: "#8c8c8c" }} />, // Cancelled
            5: <CheckCircleOutlined style={{ color: "#1890ff" }} />, // Completed
        };

        return iconMap[status] || <ClockCircleOutlined />;
    };

    return (
        <Drawer
            title={
                <div className="flex items-center text-white">
                    <FileTextOutlined className="mr-2" />
                    <span className="text-lg font-semibold">Chi Tiết Booking</span>
                </div>
            }
            width={720}
            onClose={onClose}
            open={visible}
            bodyStyle={{ paddingBottom: 80, background: "#f9fafb" }}
            headerStyle={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderBottom: "none",
            }}
            closeIcon={<span className="text-white text-xl">×</span>}
        >
            {/* Loading state */}
            {loading && (
                <div
                    className="flex justify-center items-center"
                    style={{ minHeight: 400 }}
                >
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        tip="Đang tải chi tiết booking..."
                    />
                </div>
            )}

            {/* Content when not loading */}
            {!loading && booking && (
                <>
                    {/* Thông tin tổng quan */}
                    <Card
                        title={
                            <span className="flex items-center">
                                <Badge status="processing" />
                                <span className="ml-2 font-semibold">Thông Tin Chung</span>
                            </span>
                        }
                        className="mb-4 shadow-md rounded-xl border-0 transition-all duration-300 hover:shadow-lg"
                        bordered={false}
                    >
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item
                                label={
                                    <span className="font-semibold">
                                        <FileTextOutlined className="mr-2" />
                                        Mã Booking
                                    </span>
                                }
                            >
                                <span className="text-blue-600 font-mono text-sm">
                                    {getValue(booking.id)}
                                </span>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <span className="font-semibold">
                                        <CalendarOutlined className="mr-2" />
                                        Ngày Đặt
                                    </span>
                                }
                            >
                                {formatDateTime(booking.bookingDate)}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <span className="font-semibold">
                                        <UserOutlined className="mr-2" />
                                        Dealer ID
                                    </span>
                                }
                            >
                                {getValue(booking.dealerId)}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <span className="font-semibold">
                                        <UserOutlined className="mr-2" />
                                        Người Tạo
                                    </span>
                                }
                            >
                                {getValue(booking.createdBy)}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <span className="font-semibold">
                                        <CarOutlined className="mr-2" />
                                        Tổng Số Xe
                                    </span>
                                }
                            >
                                <Tag color="blue" className="font-semibold">
                                    {booking.totalQuantity || 0} xe
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <span className="font-semibold">
                                        {getStatusIcon(booking.status)}
                                        <span className="ml-2">Trạng Thái</span>
                                    </span>
                                }
                            >
                                {getStatusTag(booking.status)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Chi tiết xe đặt */}
                    {booking.bookingEVDetails && booking.bookingEVDetails.length > 0 && (
                        <Card
                            title={
                                <span className="flex items-center">
                                    <CarOutlined className="mr-2 text-green-600" />
                                    <span className="font-semibold">
                                        Chi Tiết Xe Đặt ({booking.bookingEVDetails.length} mẫu)
                                    </span>
                                </span>
                            }
                            className="mb-4 shadow-md rounded-xl border-0 transition-all duration-300 hover:shadow-lg"
                            bordered={false}
                        >
                            {fetchingDetails ? (
                                <div className="flex justify-center items-center py-8">
                                    <Spin
                                        indicator={
                                            <LoadingOutlined style={{ fontSize: 36 }} spin />
                                        }
                                        tip="Đang tải thông tin xe..."
                                    />
                                </div>
                            ) : (
                                <Row gutter={[16, 16]}>
                                    {detailsData.map((detail, index) => (
                                        <Col span={24} key={detail.id || index}>
                                            <Card
                                                size="small"
                                                className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-700">
                                                            Xe #{index + 1}
                                                        </span>
                                                        <Tag color="blue" className="font-bold">
                                                            {detail.quantity || 0} xe
                                                        </Tag>
                                                    </div>

                                                    <div className="text-sm">
                                                        <span className="text-gray-600 font-semibold">
                                                            Mẫu xe:{" "}
                                                        </span>
                                                        <span className="text-gray-800 font-medium">
                                                            {detail.modelName}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm">
                                                        <span className="text-gray-600 font-semibold">
                                                            Phiên bản:{" "}
                                                        </span>
                                                        <span className="text-gray-800">
                                                            {detail.versionName}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm">
                                                        <span className="text-gray-600 font-semibold">
                                                            Màu sắc:{" "}
                                                        </span>
                                                        <span className="text-gray-800">
                                                            {detail.colorName}
                                                        </span>
                                                    </div>

                                                    {detail.expectedDeliveryDate && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-600">
                                                                Ngày giao dự kiến:{" "}
                                                            </span>
                                                            <span className="font-semibold text-blue-600">
                                                                {formatDateTime(detail.expectedDeliveryDate)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {detail.price && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-600">Đơn giá: </span>
                                                            <span className="font-semibold text-green-600">
                                                                {formatCurrency(detail.price)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {detail.totalPrice && (
                                                        <div className="text-sm border-t pt-2 mt-2">
                                                            <span className="text-gray-600">
                                                                Thành tiền:{" "}
                                                            </span>
                                                            <span className="font-bold text-green-700 text-base">
                                                                {formatCurrency(detail.totalPrice)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {/* Tổng tiền */}
                            {booking.totalAmount && (
                                <div className="mt-4 pt-4 border-t-2 border-gray-300">
                                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                        <span className="text-lg font-semibold text-gray-700">
                                            Tổng Giá Trị Booking:
                                        </span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {formatCurrency(booking.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Ghi chú */}
                    {booking.note && (
                        <Card
                            title={
                                <span className="flex items-center">
                                    <FileTextOutlined className="mr-2 text-orange-600" />
                                    <span className="font-semibold">Ghi Chú</span>
                                </span>
                            }
                            className="mb-4 shadow-md rounded-xl border-0 transition-all duration-300 hover:shadow-lg"
                            bordered={false}
                        >
                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                                <p className="text-gray-700 m-0">{booking.note}</p>
                            </div>
                        </Card>
                    )}

                    {/* Timeline trạng thái */}
                    <Card
                        title={
                            <span className="flex items-center">
                                <ClockCircleOutlined className="mr-2 text-purple-600" />
                                <span className="font-semibold">Lịch Sử Thay Đổi</span>
                            </span>
                        }
                        className="shadow-md rounded-xl border-0 transition-all duration-300 hover:shadow-lg"
                        bordered={false}
                    >
                        <Timeline className="mt-4">
                            <Timeline.Item
                                color="green"
                                dot={<CheckCircleOutlined className="text-lg" />}
                                className="pb-5"
                            >
                                <p className="font-semibold text-gray-800">Booking được tạo</p>
                                <p className="text-gray-500 text-sm">
                                    {formatDateTime(booking.createdAt || booking.bookingDate)}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Bởi: {getValue(booking.createdBy)}
                                </p>
                            </Timeline.Item>

                            {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                                <Timeline.Item
                                    color="blue"
                                    dot={<SyncOutlined className="text-lg" />}
                                    className="pb-5"
                                >
                                    <p className="font-semibold text-gray-800">
                                        Cập nhật lần cuối
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        {formatDateTime(booking.updatedAt)}
                                    </p>
                                </Timeline.Item>
                            )}

                            <Timeline.Item dot={getStatusIcon(booking.status)}>
                                <p className="font-semibold text-gray-800">
                                    Trạng thái hiện tại
                                </p>
                                <div className="mt-2">{getStatusTag(booking.status)}</div>
                            </Timeline.Item>
                        </Timeline>
                    </Card>
                </>
            )}

            {/* Empty state when no booking and not loading */}
            {!loading && !booking && (
                <div
                    className="flex justify-center items-center"
                    style={{ minHeight: 400 }}
                >
                    <Empty description="Không có dữ liệu booking" />
                </div>
            )}
        </Drawer>
    );
};

export default BookingDetailDrawer;
