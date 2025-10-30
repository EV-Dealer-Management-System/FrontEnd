import React, { useMemo } from 'react';
import { Table, Tag, Space, Tooltip } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { CalendarOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';

function BookingOverview({ bookingData, loading }) {

    // Tính toán dữ liệu booking
    const { bookingStats, recentBookings } = useMemo(() => {
        if (!bookingData || !Array.isArray(bookingData)) {
            return { bookingStats: [], recentBookings: [] };
        }

        // Thống kê theo trạng thái
        const statusStats = {};
        const statusMap = {
            0: 'Chờ xử lý',
            1: 'Đã duyệt',
            2: 'Đã ký hợp đồng',
            3: 'Đang giao',
            4: 'Đã giao',
            5: 'Hoàn thành'
        };

        bookingData.forEach(booking => {
            const status = statusMap[booking.status] || 'Không xác định';
            if (!statusStats[status]) {
                statusStats[status] = {
                    status,
                    count: 0,
                    totalQuantity: 0
                };
            }
            statusStats[status].count += 1;
            statusStats[status].totalQuantity += booking.totalQuantity;
        });

        const bookingStats = Object.values(statusStats).map((item, index) => ({
            key: index + 1,
            ...item
        }));

        // Booking gần đây (10 booking mới nhất)
        const recentBookings = bookingData
            .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
            .slice(0, 10)
            .map((booking, index) => ({
                key: index + 1,
                ...booking,
                statusText: statusMap[booking.status] || 'Không xác định',
                bookingDateFormatted: new Date(booking.bookingDate).toLocaleDateString('vi-VN'),
                dealerName: booking.createdBy || 'Không xác định'
            }));

        return { bookingStats, recentBookings };
    }, [bookingData]);

    // Cột cho bảng thống kê trạng thái
    const statusColumns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            width: 60,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colorMap = {
                    'Chờ xử lý': 'default',
                    'Đã duyệt': 'processing',
                    'Đã ký hợp đồng': 'warning',
                    'Đang giao': 'cyan',
                    'Đã giao': 'success',
                    'Hoàn thành': 'green'
                };
                return (
                    <Tag color={colorMap[status] || 'default'} className="font-medium">
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: 'Số đơn',
            dataIndex: 'count',
            key: 'count',
            align: 'center',
            render: (value) => <span className="font-medium">{value} đơn</span>
        },
        {
            title: 'Tổng xe',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            align: 'center',
            render: (value) => (
                <Tag color="blue">{value} xe</Tag>
            )
        }
    ];

    // Cột cho bảng booking gần đây
    const recentColumns = [
        {
            title: 'Ngày đặt',
            dataIndex: 'bookingDateFormatted',
            key: 'bookingDate',
            width: 100,
            render: (date) => (
                <Space>
                    <CalendarOutlined className="text-blue-500" />
                    <span className="text-sm">{date}</span>
                </Space>
            )
        },
        {
            title: 'Đại lý',
            dataIndex: 'dealerName',
            key: 'dealerName',
            render: (name) => (
                <Space>
                    <ShopOutlined className="text-green-500" />
                    <Tooltip title={name}>
                        <span className="font-medium truncate max-w-32">
                            {name.length > 15 ? `${name.substring(0, 15)}...` : name}
                        </span>
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            align: 'center',
            width: 80,
            render: (value) => <Tag color="blue">{value} xe</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusText',
            key: 'status',
            align: 'center',
            width: 120,
            render: (status) => {
                const colorMap = {
                    'Chờ xử lý': 'default',
                    'Đã duyệt': 'processing',
                    'Đã ký hợp đồng': 'warning',
                    'Đang giao': 'cyan',
                    'Đã giao': 'success',
                    'Hoàn thành': 'green'
                };
                return (
                    <Tag color={colorMap[status] || 'default'} className="text-xs">
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (note) => (
                <Tooltip title={note}>
                    <span className="text-gray-600 text-sm truncate max-w-24">
                        {note && note.length > 20 ? `${note.substring(0, 20)}...` : note || 'Không có'}
                    </span>
                </Tooltip>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Thống kê trạng thái booking */}
            <ProCard
                title="Thống Kê Trạng Thái Booking"
                className="shadow-sm"
                extra={
                    <Tag color="processing">
                        Tổng: {bookingStats.reduce((sum, item) => sum + item.count, 0)} đơn
                    </Tag>
                }
            >
                <Table
                    columns={statusColumns}
                    dataSource={bookingStats}
                    loading={loading}
                    pagination={false}
                    size="small"
                />
            </ProCard>

            {/* Booking gần đây */}
            <ProCard
                title="Booking Gần Đây"
                className="shadow-sm"
                extra={
                    <Tag color="green">
                        10 đơn mới nhất
                    </Tag>
                }
            >
                <Table
                    columns={recentColumns}
                    dataSource={recentBookings}
                    loading={loading}
                    pagination={false}
                    size="small"
                    scroll={{ x: 600 }}
                />
            </ProCard>
        </div>
    );
}

export default BookingOverview;