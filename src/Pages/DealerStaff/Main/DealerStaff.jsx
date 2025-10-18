import React, { useState, useMemo } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Button,
    Space,
    Progress,
    Typography,
    Avatar,
    Badge
} from 'antd';
import {
    PageContainer,
    ProCard,
    StatisticCard
} from '@ant-design/pro-components';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    CarOutlined,
    RiseOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    FileTextOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import DealerStaffLayout from '../../../Components/DealerStaff/DealerStaffLayout';

const { Title, Text } = Typography;
const { Statistic: AntStatistic } = StatisticCard;

function DealerStaff() {
    const [loading] = useState(false);

    // Mock data cho dashboard - Dữ liệu mẫu về xe điện và đại lý
    const statisticsData = useMemo(() => ({
        totalRevenue: 2850000000, // 2.85 tỷ VNĐ
        revenueGrowth: 12.5,
        totalOrders: 47,
        ordersGrowth: 8.3,
        totalCustomers: 156,
        customersGrowth: 15.2,
        vehiclesInStock: 23,
        stockGrowth: -5.4
    }), []);

    // Mock data biểu đồ doanh thu theo tháng
    const chartData = useMemo(() => [
        { month: 'T1', revenue: 180 },
        { month: 'T2', revenue: 220 },
        { month: 'T3', revenue: 195 },
        { month: 'T4', revenue: 285 },
        { month: 'T5', revenue: 310 },
        { month: 'T6', revenue: 285 }
    ], []);

    // Mock data đơn hàng gần đây
    const recentOrders = useMemo(() => [
        {
            key: '1',
            orderId: 'DH001',
            customerName: 'Nguyễn Văn An',
            vehicle: 'VinFast VF8 Plus',
            amount: 1200000000,
            status: 'completed',
            date: '2025-10-15'
        },
        {
            key: '2',
            orderId: 'DH002',
            customerName: 'Trần Thị Bình',
            vehicle: 'VinFast VF9',
            amount: 1500000000,
            status: 'pending',
            date: '2025-10-17'
        },
        {
            key: '3',
            orderId: 'DH003',
            customerName: 'Lê Văn Cường',
            vehicle: 'Tesla Model 3',
            amount: 950000000,
            status: 'processing',
            date: '2025-10-18'
        },
        {
            key: '4',
            orderId: 'DH004',
            customerName: 'Phạm Thị Dung',
            vehicle: 'VinFast VFe34',
            amount: 680000000,
            status: 'completed',
            date: '2025-10-18'
        },
        {
            key: '5',
            orderId: 'DH005',
            customerName: 'Hoàng Văn Em',
            vehicle: 'Hyundai Ioniq 5',
            amount: 1150000000,
            status: 'pending',
            date: '2025-10-19'
        }
    ], []);

    // Cấu hình biểu đồ cột
    const chartConfig = {
        data: chartData,
        xField: 'month',
        yField: 'revenue',
        label: {
            position: 'top',
            style: {
                fill: '#1890ff',
                opacity: 0.8,
            },
        },
        columnStyle: {
            radius: [8, 8, 0, 0],
        },
        color: '#1890ff',
        meta: {
            revenue: {
                alias: 'Doanh thu (triệu VNĐ)',
            },
        },
    };

    // Columns cho bảng đơn hàng
    const orderColumns = [
        {
            title: 'Mã ĐH',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text) => <Text strong className="text-blue-600">{text}</Text>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#1890ff' }}>
                        {text.charAt(0)}
                    </Avatar>
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Xe điện',
            dataIndex: 'vehicle',
            key: 'vehicle',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Text strong className="text-green-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    completed: { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
                    pending: { color: 'warning', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
                    processing: { color: 'processing', text: 'Đang xử lý', icon: <ClockCircleOutlined /> }
                };
                const config = statusConfig[status];
                return (
                    <Tag icon={config.icon} color={config.color}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: () => (
                <Button type="link" icon={<EyeOutlined />}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <DealerStaffLayout>
            <PageContainer
                header={{
                    title: 'Dashboard - Nhân Viên Đại Lý',
                    subTitle: 'Tổng quan hoạt động bán hàng xe điện',
                    breadcrumb: {
                        items: [
                            { title: 'Trang chủ' },
                            { title: 'Dashboard' }
                        ]
                    }
                }}
            >
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <ProCard className="hover:shadow-lg transition-shadow">
                            <Statistic
                                title={<span className="text-gray-600">Tổng Doanh Thu</span>}
                                value={statisticsData.totalRevenue}
                                precision={0}
                                valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                                prefix={<DollarOutlined />}
                                suffix="VNĐ"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <Tag color={statisticsData.revenueGrowth > 0 ? 'success' : 'error'} icon={statisticsData.revenueGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
                                    {Math.abs(statisticsData.revenueGrowth)}%
                                </Tag>
                                <Text type="secondary" className="text-xs">So với tháng trước</Text>
                            </div>
                        </ProCard>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <ProCard className="hover:shadow-lg transition-shadow">
                            <Statistic
                                title={<span className="text-gray-600">Tổng Đơn Hàng</span>}
                                value={statisticsData.totalOrders}
                                valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                                prefix={<ShoppingCartOutlined />}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <Tag color={statisticsData.ordersGrowth > 0 ? 'success' : 'error'} icon={statisticsData.ordersGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
                                    {Math.abs(statisticsData.ordersGrowth)}%
                                </Tag>
                                <Text type="secondary" className="text-xs">So với tháng trước</Text>
                            </div>
                        </ProCard>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <ProCard className="hover:shadow-lg transition-shadow">
                            <Statistic
                                title={<span className="text-gray-600">Khách Hàng</span>}
                                value={statisticsData.totalCustomers}
                                valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
                                prefix={<TeamOutlined />}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <Tag color={statisticsData.customersGrowth > 0 ? 'success' : 'error'} icon={statisticsData.customersGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
                                    {Math.abs(statisticsData.customersGrowth)}%
                                </Tag>
                                <Text type="secondary" className="text-xs">So với tháng trước</Text>
                            </div>
                        </ProCard>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <ProCard className="hover:shadow-lg transition-shadow">
                            <Statistic
                                title={<span className="text-gray-600">Xe Trong Kho</span>}
                                value={statisticsData.vehiclesInStock}
                                valueStyle={{ color: '#f5222d', fontSize: '24px', fontWeight: 'bold' }}
                                prefix={<CarOutlined />}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <Tag color={statisticsData.stockGrowth > 0 ? 'success' : 'error'} icon={statisticsData.stockGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
                                    {Math.abs(statisticsData.stockGrowth)}%
                                </Tag>
                                <Text type="secondary" className="text-xs">So với tháng trước</Text>
                            </div>
                        </ProCard>
                    </Col>
                </Row>

                {/* Biểu đồ và Tác vụ nhanh */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} lg={16}>
                        <ProCard title="Doanh Thu 6 Tháng Gần Nhất" className="h-full">
                            <Column {...chartConfig} height={300} />
                        </ProCard>
                    </Col>

                    <Col xs={24} lg={8}>
                        <ProCard title="Tác Vụ Nhanh" className="h-full">
                            <Space direction="vertical" className="w-full" size="middle">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    block
                                    className="h-12 flex items-center justify-center gap-2"
                                >
                                    Tạo Đơn Hàng Mới
                                </Button>

                                <Button
                                    icon={<UserAddOutlined />}
                                    size="large"
                                    block
                                    className="h-12 flex items-center justify-center gap-2"
                                >
                                    Thêm Khách Hàng
                                </Button>

                                <Button
                                    icon={<FileTextOutlined />}
                                    size="large"
                                    block
                                    className="h-12 flex items-center justify-center gap-2"
                                >
                                    Tạo Báo Giá
                                </Button>

                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <Text strong className="text-blue-600">Mục tiêu tháng này</Text>
                                    <div className="mt-2">
                                        <Progress
                                            percent={68}
                                            strokeColor="#1890ff"
                                            status="active"
                                        />
                                        <Text type="secondary" className="text-xs mt-1 block">
                                            32/47 đơn hàng đã hoàn thành
                                        </Text>
                                    </div>
                                </div>
                            </Space>
                        </ProCard>
                    </Col>
                </Row>

                {/* Bảng đơn hàng gần đây */}
                <ProCard
                    title="Đơn Hàng Gần Đây"
                    extra={
                        <Button type="link">Xem tất cả</Button>
                    }
                >
                    <Table
                        columns={orderColumns}
                        dataSource={recentOrders}
                        loading={loading}
                        pagination={false}
                        scroll={{ x: 800 }}
                        className="custom-table"
                    />
                </ProCard>
            </PageContainer>
        </DealerStaffLayout>
    );
}

export default DealerStaff;