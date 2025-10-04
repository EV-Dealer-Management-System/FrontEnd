import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Progress, 
  Tag, 
  Space, 
  Typography, 
  Divider,
  Badge,
  List,
  Alert
} from 'antd';
import { 
  PageContainer,
  StatisticCard,
  ProCard
} from '@ant-design/pro-components';
import {
  CarOutlined,
  ShopOutlined,
  DollarOutlined,
  UserOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined
} from '@ant-design/icons';
import NavigationBar from '../../Components/Admin/Components/NavigationBar';

const { Title, Text } = Typography;

function EVMAdmin() {
  const [collapsed, setCollapsed] = useState(false);

  // Mock data cho dashboard - thống kê tổng quan về xe điện
  const dashboardStats = useMemo(() => ({
    totalVehicles: 15420,
    totalDealers: 127,
    monthlyRevenue: 2400000000, // 2.4 tỷ VND
    activeContracts: 89,
    lowStockAlert: 12,
    pendingOrders: 45
  }), []);

  // Mock data cho xe điện phổ biến
  const popularVehicles = useMemo(() => [
    {
      key: '1',
      model: 'VinFast VF8',
      category: 'SUV Điện',
      sold: 1250,
      revenue: 875000000,
      growth: 15.2,
      status: 'Bán chạy'
    },
    {
      key: '2',
      model: 'VinFast VF9',
      category: 'SUV Cao cấp',
      sold: 890,
      revenue: 1230000000,
      growth: 23.1,
      status: 'Tăng trưởng'
    },
    {
      key: '3',
      model: 'VinFast VF6',
      category: 'Hatchback Điện',
      sold: 2100,
      revenue: 630000000,
      growth: -5.3,
      status: 'Giảm'
    },
    {
      key: '4',
      model: 'VinFast VF7',
      category: 'Sedan Điện',
      sold: 1680,
      revenue: 924000000,
      growth: 8.7,
      status: 'Ổn định'
    }
  ], []);

  // Mock data cho top đại lý
  const topDealers = useMemo(() => [
    {
      name: 'VinFast Hà Nội',
      location: 'Hà Nội',
      sales: 245,
      revenue: 340000000,
      performance: 98
    },
    {
      name: 'VinFast TP.HCM',
      location: 'TP. Hồ Chí Minh',
      sales: 312,
      revenue: 456000000,
      performance: 95
    },
    {
      name: 'VinFast Đà Nẵng',
      location: 'Đà Nẵng',
      sales: 189,
      revenue: 267000000,
      performance: 92
    },
    {
      name: 'VinFast Cần Thơ',
      location: 'Cần Thơ',
      sales: 156,
      revenue: 198000000,
      performance: 88
    }
  ], []);

  // Mock alerts - cảnh báo hệ thống
  const systemAlerts = useMemo(() => [
    {
      type: 'warning',
      message: '12 mẫu xe có tồn kho thấp dưới 50 chiếc',
      time: '2 giờ trước'
    },
    {
      type: 'info',
      message: 'Hợp đồng với đại lý Hải Phòng sắp hết hạn',
      time: '5 giờ trước'
    },
    {
      type: 'error',
      message: 'Lỗi đồng bộ dữ liệu tại kho Bắc Ninh',
      time: '1 ngày trước'
    }
  ], []);

  const vehicleColumns = [
    {
      title: 'Mẫu xe',
      dataIndex: 'model',
      key: 'model',
      render: (text, record) => (
        <Space>
          <CarOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{text}</div>
            <Text type="secondary" className="text-sm">{record.category}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
      render: (value) => <Statistic value={value} precision={0} className="text-sm" />,
    },
    {
      title: 'Doanh thu (VND)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => <Statistic value={value} precision={0} className="text-sm" />,
    },
    {
      title: 'Tăng trưởng',
      dataIndex: 'growth',
      key: 'growth',
      render: (value) => (
        <Space>
          {value > 0 ? <RiseOutlined className="text-green-500" /> : <FallOutlined className="text-red-500" />}
          <Text className={value > 0 ? 'text-green-600' : 'text-red-600'}>
            {value > 0 ? '+' : ''}{value}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'Bán chạy': 'success',
          'Tăng trưởng': 'processing',
          'Giảm': 'error',
          'Ổn định': 'default'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
      />
      
      {/* Main Content */}
      <div 
        className="flex-1 transition-all duration-200"
        style={{ 
          marginLeft: collapsed ? 64 : 280,
          minHeight: '100vh'
        }}
      >
        <PageContainer
          header={{
            title: 'Tổng quan quản lý xe điện',
            subTitle: 'Dashboard điều hành hệ thống EV Dealer Management',
            breadcrumb: {
              items: [
                { title: 'Trang chủ' },
                { title: 'Admin' },
                { title: 'Tổng quan' }
              ]
            }
          }}
          className="p-6"
        >
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <StatisticCard
                statistic={{
                  title: 'Tổng số xe',
                  value: dashboardStats.totalVehicles,
                  icon: <CarOutlined className="text-blue-500 text-2xl" />,
                  description: <Statistic title="Tăng trưởng" value={11.28} precision={2} suffix="%" className="text-sm" />
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatisticCard
                statistic={{
                  title: 'Tổng đại lý',
                  value: dashboardStats.totalDealers,
                  icon: <ShopOutlined className="text-green-500 text-2xl" />,
                  description: <Statistic title="Hoạt động" value={89} suffix="/127" className="text-sm" />
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatisticCard
                statistic={{
                  title: 'Doanh thu tháng',
                  value: dashboardStats.monthlyRevenue,
                  precision: 0,
                  suffix: ' VND',
                  icon: <DollarOutlined className="text-orange-500 text-2xl" />,
                  description: <Statistic title="So với tháng trước" value={9.3} precision={1} suffix="%" className="text-sm text-green-600" />
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatisticCard
                statistic={{
                  title: 'Hợp đồng đang hoạt động',
                  value: dashboardStats.activeContracts,
                  icon: <UserOutlined className="text-purple-500 text-2xl" />,
                  description: <Badge count={dashboardStats.pendingOrders} showZero className="text-sm">
                    <Text type="secondary">Đơn chờ xử lý</Text>
                  </Badge>
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
              />
            </Col>
          </Row>

          {/* Alerts */}
          {dashboardStats.lowStockAlert > 0 && (
            <Alert
              message={`Cảnh báo tồn kho thấp: ${dashboardStats.lowStockAlert} mẫu xe cần bổ sung`}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              closable
              className="mb-6"
              action={
                <Text className="text-blue-600 cursor-pointer hover:underline">
                  Xem chi tiết
                </Text>
              }
            />
          )}

          <Row gutter={[16, 16]}>
            {/* Popular Vehicles Table */}
            <Col xs={24} lg={16}>
              <ProCard
                title="Xe điện bán chạy nhất"
                extra={<Text type="secondary">Cập nhật: Hôm nay</Text>}
                className="shadow-sm"
              >
                <Table
                  columns={vehicleColumns}
                  dataSource={popularVehicles}
                  pagination={false}
                  size="small"
                  className="custom-table"
                />
              </ProCard>
            </Col>

            {/* Top Dealers & System Alerts */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="middle" className="w-full">
                {/* Top Dealers */}
                <ProCard 
                  title="Đại lý xuất sắc" 
                  extra={<TrophyOutlined className="text-yellow-500" />}
                  className="shadow-sm"
                >
                  <List
                    size="small"
                    dataSource={topDealers}
                    renderItem={(dealer, index) => (
                      <List.Item className="px-0">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            <Badge 
                              count={index + 1} 
                              style={{ backgroundColor: index === 0 ? '#faad14' : '#1890ff' }}
                            />
                            <div>
                              <div className="font-medium text-sm">{dealer.name}</div>
                              <Text type="secondary" className="text-xs">{dealer.location}</Text>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{dealer.sales} xe</div>
                            <Progress 
                              percent={dealer.performance} 
                              size="small" 
                              status={dealer.performance >= 95 ? 'success' : 'normal'}
                              className="w-16"
                            />
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </ProCard>

                {/* System Alerts */}
                <ProCard 
                  title="Thông báo hệ thống" 
                  extra={<SyncOutlined className="text-blue-500" />}
                  className="shadow-sm"
                >
                  <List
                    size="small"
                    dataSource={systemAlerts}
                    renderItem={(alert) => (
                      <List.Item className="px-0">
                        <div className="flex items-start gap-2 w-full">
                          <Badge 
                            status={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'processing'} 
                          />
                          <div className="flex-1">
                            <div className="text-sm">{alert.message}</div>
                            <Text type="secondary" className="text-xs">{alert.time}</Text>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </ProCard>
              </Space>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Divider orientation="left" className="my-6">
            <Text className="text-gray-600">Thao tác nhanh</Text>
          </Divider>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card 
                className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-blue-400"
                onClick={() => window.location.href = '/admin/dealer/create'}
              >
                <UserOutlined className="text-3xl text-blue-500 mb-2" />
                <Title level={5} className="mb-1">Tạo tài khoản đại lý</Title>
                <Text type="secondary">Thêm đại lý mới vào hệ thống</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-green-400"
                onClick={() => window.location.href = '/admin/vehicle/allocation'}
              >
                <CarOutlined className="text-3xl text-green-500 mb-2" />
                <Title level={5} className="mb-1">Phân bổ xe điện</Title>
                <Text type="secondary">Phân bổ xe cho các đại lý</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-orange-400"
                onClick={() => window.location.href = '/admin/reports/sales'}
              >
                <RiseOutlined className="text-3xl text-orange-500 mb-2" />
                <Title level={5} className="mb-1">Xem báo cáo</Title>
                <Text type="secondary">Phân tích dữ liệu bán hàng</Text>
              </Card>
            </Col>
          </Row>
        </PageContainer>
      </div>
    </div>
  );
}

export default EVMAdmin;
