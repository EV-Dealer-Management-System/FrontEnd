import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    message,
    Tag,
    Space,
    Button,
    Tooltip,
    Layout
} from 'antd';
import {
    EyeOutlined,
    UserOutlined,
    PhoneOutlined,
    CalendarOutlined,
    CarOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { getAllEVBookings } from '../../../App/DealerManager/EVBooking/GetAllEVBooking';
import NavigationBar from '../../../Components/DealerManager/Components/NavigationBar';
import BookingStatsSection from './Components/BookingStatsSection';
import BookingSearchBar from './Components/BookingSearchBar';
import BookingDetailModal from './Components/BookingDetailModal';

const { Content } = Layout;

function GetAllEVBooking() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Xử lý responsive
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load danh sách booking khi component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    // Lấy danh sách booking từ API
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getAllEVBookings();

            if (response && response.isSuccess) {
                const data = response.result || response.data || [];
                const bookingsList = Array.isArray(data) ? data : [];

                // Map data để thêm thông tin từ bookingEVDetails
                const enhancedBookings = bookingsList.map(booking => {
                    // Tính tổng số lượng xe từ bookingEVDetails
                    const totalQuantity = booking.bookingEVDetails?.reduce(
                        (sum, detail) => sum + (detail.quantity || 0),
                        0
                    ) || booking.totalQuantity || 0;

                    return {
                        ...booking,
                        totalQuantity,
                        // Giữ nguyên bookingEVDetails để hiển thị chi tiết
                        bookingEVDetails: booking.bookingEVDetails || []
                    };
                });

                setBookings(enhancedBookings);
                message.success(`Đã tải ${enhancedBookings.length} booking thành công`);
            } else {
                message.error(response?.message || 'Không thể tải danh sách booking');
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            message.error('Có lỗi khi tải danh sách booking');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Xem chi tiết booking
    const handleViewDetail = (record) => {
        setSelectedBooking(record);
        setDetailModalVisible(true);
    };

    // Format ngày giờ
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Format tiền tệ
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Hiển thị trạng thái booking
    const getStatusTag = (status) => {
        // Xử lý status - có thể là số (0, 1, 2...) hoặc string
        let statusValue = '';
        if (status === null || status === undefined) {
            statusValue = '';
        } else if (typeof status === 'number') {
            // Nếu status là số, map sang string
            const numberStatusMap = {
                0: 'pending',
                1: 'confirmed',
                2: 'completed',
                3: 'cancelled',
                4: 'processing'
            };
            statusValue = numberStatusMap[status] || '';
        } else if (typeof status === 'string') {
            statusValue = status.toLowerCase();
        } else if (typeof status === 'object' && status.value !== undefined) {
            statusValue = String(status.value).toLowerCase();
        } else {
            statusValue = String(status).toLowerCase();
        }

        const statusMap = {
            'pending': { color: 'orange', text: 'Chờ xác nhận' },
            'confirmed': { color: 'blue', text: 'Đã xác nhận' },
            'completed': { color: 'green', text: 'Hoàn thành' },
            'cancelled': { color: 'red', text: 'Đã hủy' },
            'processing': { color: 'cyan', text: 'Đang xử lý' }
        };

        const statusInfo = statusMap[statusValue] || { color: 'default', text: status || 'Không xác định' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    // Lọc dữ liệu theo search
    const filteredBookings = bookings.filter(booking => {
        if (!searchText) return true;

        const searchLower = searchText.toLowerCase();

        // Helper để convert field sang string an toàn
        const toString = (value) => {
            if (!value) return '';
            if (typeof value === 'string') return value;
            if (typeof value === 'object' && value.value !== undefined) return String(value.value);
            return String(value);
        };

        return (
            toString(booking.id).toLowerCase().includes(searchLower) ||
            toString(booking.dealerId).toLowerCase().includes(searchLower) ||
            toString(booking.createdBy).toLowerCase().includes(searchLower) ||
            toString(booking.note).toLowerCase().includes(searchLower)
        );
    });

    // Cấu hình cột cho bảng
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Mã Booking',
            dataIndex: 'id',
            key: 'id',
            width: 200,
            render: (text) => (
                <Tooltip title={text}>
                    <strong className="text-blue-600">
                        {text ? text.substring(0, 13) + '...' : 'N/A'}
                    </strong>
                </Tooltip>
            )
        },
        {
            title: 'Dealer',
            dataIndex: 'dealerId',
            key: 'dealerId',
            width: 150,
            render: (text) => (
                <Tooltip title={text}>
                    <span className="text-gray-600 text-xs">
                        {text ? text.substring(0, 8) + '...' : 'N/A'}
                    </span>
                </Tooltip>
            )
        },
        {
            title: 'Số Lượng Xe',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            width: 120,
            align: 'center',
            render: (text) => (
                <Tag color="blue" className="font-semibold">
                    {text || 0} xe
                </Tag>
            )
        },
        {
            title: 'Ngày Đặt',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            width: 160,
            render: (text) => (
                <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-500" />
                    {formatDateTime(text)}
                </div>
            )
        },
        {
            title: 'Người Tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 140,
            render: (text) => (
                <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    {text || 'N/A'}
                </div>
            )
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Thao Tác',
            key: 'actions',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <NavigationBar
                collapsed={collapsed}
                onCollapse={setCollapsed}
                isMobile={isMobile}
            />
            <Layout
                style={{
                    marginLeft: isMobile ? 0 : (collapsed ? 64 : 280),
                    transition: 'all 0.2s ease',
                }}
            >
                <Content>
                    <PageContainer
                        title={
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                                Danh Sách Đặt Xe Điện
                            </span>
                        }
                        subTitle="Quản lý và theo dõi các booking xe điện"
                    >
                        {/* Thống kê tổng quan */}
                        <BookingStatsSection
                            bookings={bookings}
                        />

                        {/* Thanh tìm kiếm */}
                        <BookingSearchBar
                            searchText={searchText}
                            onSearch={setSearchText}
                            onReload={fetchBookings}
                            loading={loading}
                        />

                        {/* Bảng dữ liệu */}
                        <Card className="shadow-lg rounded-xl" bordered={false}>
                            <Table
                                columns={columns}
                                dataSource={filteredBookings}
                                loading={loading}
                                rowKey={(record) => record.id || record.bookingCode}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Tổng ${total} booking`,
                                    pageSizeOptions: ['10', '20', '50', '100'],
                                    className: 'px-4'
                                }}
                                scroll={{ x: 1200 }}
                                className="booking-table"
                            />
                        </Card>
                    </PageContainer>
                </Content>
            </Layout>

            {/* Modal chi tiết */}
            <BookingDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                booking={selectedBooking}
                formatDateTime={formatDateTime}
                formatCurrency={formatCurrency}
                getStatusTag={getStatusTag}
            />
        </Layout>
    );
}

export default GetAllEVBooking;
