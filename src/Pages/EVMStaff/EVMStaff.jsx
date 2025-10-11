import React, { useState, useMemo, useEffect } from "react";
import { PageContainer, ProCard, StatisticCard } from "@ant-design/pro-components";
import { Row, Col, Card, Typography, Space, Button, Table, Tag, Progress } from "antd";
import {
    FileTextOutlined,
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    TrophyOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import NavigationBar from "../../Components/EVMStaff/Components/NavigationBar";

const { Title, Text } = Typography;

function EVMStaff() {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle responsive design
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mock data cho dashboard EVM Staff
    const dashboardData = useMemo(() => ({
        contractStats: {
            total: 156,
            pending: 23,
            approved: 118,
            rejected: 15,
        },
        dealerStats: {
            total: 45,
            active: 38,
            inactive: 7,
            topPerformer: "Đại lý Miền Nam",
        },
        recentContracts: [
            {
                id: 1,
                contractNumber: "HD001234",
                dealerName: "Đại lý Hà Nội",
                type: "Hợp đồng phân phối",
                status: "pending",
                createdDate: "2024-10-10",
                value: "2,500,000,000",
            },
            {
                id: 2,
                contractNumber: "HD001235",
                dealerName: "Đại lý TP.HCM",
                type: "Hợp đồng bảo hành",
                status: "approved",
                createdDate: "2024-10-09",
                value: "1,800,000,000",
            },
            {
                id: 3,
                contractNumber: "HD001236",
                dealerName: "Đại lý Đà Nẵng",
                type: "Hợp đồng phân phối",
                status: "pending",
                createdDate: "2024-10-08",
                value: "3,200,000,000",
            },
            {
                id: 4,
                contractNumber: "HD001237",
                dealerName: "Đại lý Cần Thơ",
                type: "Hợp đồng dịch vụ",
                status: "approved",
                createdDate: "2024-10-07",
                value: "950,000,000",
            },
        ],
        topDealers: [
            {
                id: 1,
                name: "Đại lý Miền Nam",
                location: "TP.HCM",
                performance: 95,
                revenue: "15,500,000,000",
                contracts: 12,
            },
            {
                id: 2,
                name: "Đại lý Miền Bắc",
                location: "Hà Nội",
                performance: 88,
                revenue: "12,800,000,000",
                contracts: 10,
            },
            {
                id: 3,
                name: "Đại lý Miền Trung",
                location: "Đà Nẵng",
                performance: 82,
                revenue: "9,200,000,000",
                contracts: 8,
            },
        ],
    }), []);

    // Columns cho bảng hợp đồng gần đây
    const contractColumns = [
        {
            title: "Số hợp đồng",
            dataIndex: "contractNumber",
            key: "contractNumber",
            render: (text) => <Text strong className="text-blue-600">{text}</Text>,
        },
        {
            title: "Đại lý",
            dataIndex: "dealerName",
            key: "dealerName",
        },
        {
            title: "Loại hợp đồng",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const statusConfig = {
                    pending: { color: "orange", text: "Chờ xử lý", icon: <ClockCircleOutlined /> },
                    approved: { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> },
                    rejected: { color: "red", text: "Từ chối", icon: <ExclamationCircleOutlined /> },
                };
                const config = statusConfig[status];
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: "Giá trị (VND)",
            dataIndex: "value",
            key: "value",
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdDate",
            key: "createdDate",
        },
    ];

    // Columns cho bảng đại lý hàng đầu
    const dealerColumns = [
        {
            title: "Tên đại lý",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Địa điểm",
            dataIndex: "location",
            key: "location",
        },
        {
            title: "Hiệu suất",
            dataIndex: "performance",
            key: "performance",
            render: (performance) => (
                <div className="flex items-center gap-2">
                    <Progress
                        percent={performance}
                        size="small"
                        strokeColor={performance >= 90 ? "#52c41a" : performance >= 70 ? "#faad14" : "#ff4d4f"}
                    />
                    <Text>{performance}%</Text>
                </div>
            ),
        },
        {
            title: "Doanh thu (VND)",
            dataIndex: "revenue",
            key: "revenue",
        },
        {
            title: "Số hợp đồng",
            dataIndex: "contracts",
            key: "contracts",
            render: (contracts) => <Tag color="blue">{contracts}</Tag>,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <NavigationBar
                collapsed={collapsed}
                onCollapse={setCollapsed}
                isMobile={isMobile}
            />

            <div
                style={{
                    marginLeft: collapsed ? 64 : 280,
                    transition: "all 0.2s ease",
                    padding: 0,
                }}
            >
                <PageContainer
                    header={{
                        title: "Dashboard EVM Staff",
                        breadcrumb: {
                            items: [
                                {
                                    title: "Trang chủ",
                                },
                                {
                                    title: "Dashboard",
                                },
                            ],
                        },
                    }}
                    className="bg-white"
                >
                    {/* Thống kê tổng quan */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                            <StatisticCard
                                statistic={{
                                    title: "Tổng hợp đồng",
                                    value: dashboardData.contractStats.total,
                                    icon: <FileTextOutlined className="text-blue-500" />,
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <StatisticCard
                                statistic={{
                                    title: "Chờ xử lý",
                                    value: dashboardData.contractStats.pending,
                                    icon: <ClockCircleOutlined className="text-orange-500" />,
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <StatisticCard
                                statistic={{
                                    title: "Đã duyệt",
                                    value: dashboardData.contractStats.approved,
                                    icon: <CheckCircleOutlined className="text-green-500" />,
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <StatisticCard
                                statistic={{
                                    title: "Tổng đại lý",
                                    value: dashboardData.dealerStats.total,
                                    icon: <BankOutlined className="text-purple-500" />,
                                }}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            />
                        </Col>
                    </Row>

                    {/* Hợp đồng gần đây */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col span={24}>
                            <ProCard
                                title={
                                    <Space>
                                        <FileTextOutlined className="text-blue-500" />
                                        <span>Hợp đồng gần đây</span>
                                    </Space>
                                }
                                extra={
                                    <Button type="primary" ghost>
                                        Xem tất cả
                                    </Button>
                                }
                                className="shadow-sm"
                            >
                                <Table
                                    columns={contractColumns}
                                    dataSource={dashboardData.recentContracts}
                                    pagination={false}
                                    rowKey="id"
                                    size="middle"
                                />
                            </ProCard>
                        </Col>
                    </Row>

                    {/* Đại lý hàng đầu */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <ProCard
                                title={
                                    <Space>
                                        <TrophyOutlined className="text-yellow-500" />
                                        <span>Đại lý hiệu suất cao</span>
                                    </Space>
                                }
                                extra={
                                    <Button type="primary" ghost>
                                        Xem báo cáo chi tiết
                                    </Button>
                                }
                                className="shadow-sm"
                            >
                                <Table
                                    columns={dealerColumns}
                                    dataSource={dashboardData.topDealers}
                                    pagination={false}
                                    rowKey="id"
                                    size="middle"
                                />
                            </ProCard>
                        </Col>
                    </Row>

                    {/* Quick Actions */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24} md={8}>
                            <Card
                                hoverable
                                className="text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => console.log("Navigate to create contract")}
                            >
                                <div className="p-4">
                                    <FileTextOutlined className="text-4xl text-blue-500 mb-4" />
                                    <Title level={4} className="mb-2">Tạo hợp đồng mới</Title>
                                    <Text className="text-gray-600">
                                        Tạo hợp đồng phân phối cho đại lý mới
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card
                                hoverable
                                className="text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => console.log("Navigate to verify contracts")}
                            >
                                <div className="p-4">
                                    <CheckCircleOutlined className="text-4xl text-green-500 mb-4" />
                                    <Title level={4} className="mb-2">Xác nhận hợp đồng</Title>
                                    <Text className="text-gray-600">
                                        Xem và xác nhận các hợp đồng chờ duyệt
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card
                                hoverable
                                className="text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => console.log("Navigate to dealer management")}
                            >
                                <div className="p-4">
                                    <TeamOutlined className="text-4xl text-purple-500 mb-4" />
                                    <Title level={4} className="mb-2">Quản lý đại lý</Title>
                                    <Text className="text-gray-600">
                                        Theo dõi hiệu suất và quản lý đại lý
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </PageContainer>
            </div>
        </div>
    );
}

export default EVMStaff;
