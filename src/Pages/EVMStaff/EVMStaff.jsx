import React, { useMemo } from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Table, Tag, Progress, Button, Space } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    CarOutlined,
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import EVMStaffLayout from '../../Components/EVMStaff/EVMStaffLayout';

const { Statistic } = StatisticCard;

function EVMStaff() {
    // Mock data cho Dashboard - Thống kê tổng quan
    const overviewStats = useMemo(() => ({
        totalDealers: 45,
        activeDealers: 42,
        totalContracts: 38,
        pendingContracts: 7,
        totalVehicles: 1250,
        vehiclesInStock: 320,
        monthlyRevenue: 15750000000,
        revenueGrowth: 12.5
    }), []);

    // Mock data - Danh sách hợp đồng gần đây
    const recentContracts = useMemo(() => [
        {
            key: '1',
            contractId: 'CT2024001',
            dealerName: 'Đại lý ABC Hà Nội',
            signDate: '2024-10-15',
            value: 5000000000,
            status: 'active',
            vehicleTarget: 50
        },
        {
            key: '2',
            contractId: 'CT2024002',
            dealerName: 'Đại lý XYZ TP.HCM',
            signDate: '2024-10-12',
            value: 7500000000,
            status: 'pending',
            vehicleTarget: 75
        },
        {
            key: '3',
            contractId: 'CT2024003',
            dealerName: 'Đại lý DEF Đà Nẵng',
            signDate: '2024-10-10',
            value: 3500000000,
            status: 'active',
            vehicleTarget: 35
        },
        {
            key: '4',
            contractId: 'CT2024004',
            dealerName: 'Đại lý GHI Hải Phòng',
            signDate: '2024-10-08',
            value: 4200000000,
            status: 'pending',
            vehicleTarget: 42
        },
        {
            key: '5',
            contractId: 'CT2024005',
            dealerName: 'Đại lý JKL Cần Thơ',
            signDate: '2024-10-05',
            value: 2800000000,
            status: 'active',
            vehicleTarget: 28
        }
    ], []);

    // Mock data - Hiệu suất đại lý theo khu vực
    const dealerPerformance = useMemo(() => [
        {
            key: '1',
            region: 'Miền Bắc',
            dealers: 15,
            vehiclesSold: 450,
            target: 500,
            revenue: 6750000000,
            performance: 90
        },
        {
            key: '2',
            region: 'Miền Trung',
            dealers: 12,
            vehiclesSold: 320,
            target: 360,
            revenue: 4800000000,
            performance: 88.9
        },
        {
            key: '3',
            region: 'Miền Nam',
            dealers: 18,
            vehiclesSold: 580,
            target: 640,
            revenue: 8700000000,
            performance: 90.6
        }
    ], []);

    // Cột cho bảng hợp đồng
    const contractColumns = [
        {
            title: 'Mã HĐ',
            dataIndex: 'contractId',
            key: 'contractId',
            width: 120,
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>
        },
        {
            title: 'Tên Đại Lý',
            dataIndex: 'dealerName',
            key: 'dealerName',
            ellipsis: true
        },
        {
            title: 'Ngày Ký',
            dataIndex: 'signDate',
            key: 'signDate',
            width: 110
        },
        {
            title: 'Giá Trị HĐ',
            dataIndex: 'value',
            key: 'value',
            width: 150,
            render: (value) => (
                <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(value)}
                </span>
            )
        },
        {
            title: 'Mục Tiêu',
            dataIndex: 'vehicleTarget',
            key: 'vehicleTarget',
            width: 100,
            render: (target) => <span>{target} xe</span>
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'orange'}>
                    {status === 'active' ? 'Đang hoạt động' : 'Chờ duyệt'}
                </Tag>
            )
        }
    ];

    // Cột cho bảng hiệu suất
    const performanceColumns = [
        {
            title: 'Khu Vực',
            dataIndex: 'region',
            key: 'region',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Số Đại Lý',
            dataIndex: 'dealers',
            key: 'dealers',
            align: 'center'
        },
        {
            title: 'Xe Đã Bán',
            dataIndex: 'vehiclesSold',
            key: 'vehiclesSold',
            align: 'center',
            render: (sold, record) => (
                <span className="font-medium">
                    {sold}/{record.target}
                </span>
            )
        },
        {
            title: 'Doanh Thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => (
                <span className="font-medium text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        notation: 'compact',
                        maximumFractionDigits: 1
                    }).format(revenue)}
                </span>
            )
        },
        {
            title: 'Hiệu Suất',
            dataIndex: 'performance',
            key: 'performance',
            width: 200,
            render: (performance) => (
                <div className="flex items-center gap-2">
                    <Progress
                        percent={performance}
                        size="small"
                        status={performance >= 90 ? 'success' : performance >= 80 ? 'normal' : 'exception'}
                    />
                </div>
            )
        }
    ];

    return (
        <EVMStaffLayout>
            <PageContainer
                title="Dashboard - Nhân Viên Nhà Sản Xuất"
                subTitle="Tổng quan hoạt động kinh doanh và quản lý đại lý"
                className="bg-transparent"
            >
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <StatisticCard
                            statistic={{
                                title: 'Tổng Đại Lý',
                                value: overviewStats.totalDealers,
                                prefix: <UserOutlined className="text-blue-500" />,
                                description: (
                                    <Space size={4}>
                                        <span className="text-green-600 font-medium">
                                            {overviewStats.activeDealers} đang hoạt động
                                        </span>
                                    </Space>
                                )
                            }}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        />
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <StatisticCard
                            statistic={{
                                title: 'Hợp Đồng',
                                value: overviewStats.totalContracts,
                                prefix: <FileTextOutlined className="text-green-500" />,
                                description: (
                                    <Space size={4}>
                                        <span className="text-orange-600 font-medium">
                                            {overviewStats.pendingContracts} chờ xử lý
                                        </span>
                                    </Space>
                                )
                            }}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        />
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <StatisticCard
                            statistic={{
                                title: 'Xe Trong Kho',
                                value: overviewStats.vehiclesInStock,
                                suffix: `/ ${overviewStats.totalVehicles}`,
                                prefix: <CarOutlined className="text-purple-500" />,
                                description: (
                                    <Progress
                                        percent={Math.round((overviewStats.vehiclesInStock / overviewStats.totalVehicles) * 100)}
                                        size="small"
                                        showInfo={false}
                                    />
                                )
                            }}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        />
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <StatisticCard
                            statistic={{
                                title: 'Doanh Thu Tháng',
                                value: overviewStats.monthlyRevenue,
                                valueStyle: { color: '#3f8600' },
                                prefix: <DollarOutlined />,
                                suffix: 'VNĐ',
                                description: (
                                    <Space size={4}>
                                        <RiseOutlined className="text-green-600" />
                                        <span className="text-green-600 font-medium">
                                            +{overviewStats.revenueGrowth}%
                                        </span>
                                        <span className="text-gray-500">so với tháng trước</span>
                                    </Space>
                                )
                            }}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        />
                    </Col>
                </Row>

                {/* Bảng hợp đồng gần đây */}
                <ProCard
                    title="Hợp Đồng Gần Đây"
                    className="mb-6 shadow-sm"
                    extra={
                        <Button type="link" className="text-blue-600">
                            Xem tất cả →
                        </Button>
                    }
                >
                    <Table
                        columns={contractColumns}
                        dataSource={recentContracts}
                        pagination={{ pageSize: 5, showSizeChanger: false }}
                        scroll={{ x: 800 }}
                        className="rounded-lg"
                    />
                </ProCard>

                {/* Hiệu suất theo khu vực */}
                <ProCard
                    title="Hiệu Suất Đại Lý Theo Khu Vực"
                    className="shadow-sm"
                >
                    <Table
                        columns={performanceColumns}
                        dataSource={dealerPerformance}
                        pagination={false}
                        className="rounded-lg"
                    />

                    {/* Tổng kết */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Row gutter={[16, 16]} className="text-center">
                            <Col xs={24} md={8}>
                                <div className="text-gray-600 mb-1">Tổng Đại Lý</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {dealerPerformance.reduce((sum, item) => sum + item.dealers, 0)}
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="text-gray-600 mb-1">Tổng Xe Đã Bán</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {dealerPerformance.reduce((sum, item) => sum + item.vehiclesSold, 0)}
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="text-gray-600 mb-1">Tổng Doanh Thu</div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        notation: 'compact',
                                        maximumFractionDigits: 1
                                    }).format(dealerPerformance.reduce((sum, item) => sum + item.revenue, 0))}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </ProCard>
            </PageContainer>
        </EVMStaffLayout>
    );
}

export default EVMStaff;
