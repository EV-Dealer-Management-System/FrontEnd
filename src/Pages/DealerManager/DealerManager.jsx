import React, { useMemo } from "react";
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
  Alert,
  Button,
} from "antd";
import {
  PageContainer,
  StatisticCard,
  ProCard,
} from "@ant-design/pro-components";
import {
  CarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DealerManagerLayout from "../../Components/DealerManager/DealerManagerLayout";

const { Title, Text } = Typography;

function DealerManager() {
  const navigate = useNavigate();

  // Mock data cho dashboard - thống kê của đại lý
  const dashboardStats = useMemo(
    () => ({
      totalSales: 245,
      monthlyRevenue: 3400000000, // 3.4 tỷ VND
      inventoryCount: 87,
      pendingOrders: 12,
      customers: 189,
      growthRate: 15.8,
    }),
    []
  );

  // Mock data cho xe trong kho
  const inventoryVehicles = useMemo(
    () => [
      {
        key: "1",
        model: "VinFast VF8",
        category: "SUV Điện",
        quantity: 23,
        price: 700000000,
        status: "Còn hàng",
        sold_this_month: 12,
      },
      {
        key: "2",
        model: "VinFast VF9",
        category: "SUV Cao cấp",
        quantity: 8,
        price: 1380000000,
        status: "Sắp hết",
        sold_this_month: 7,
      },
      {
        key: "3",
        model: "VinFast VF6",
        category: "Hatchback Điện",
        quantity: 34,
        price: 300000000,
        status: "Còn hàng",
        sold_this_month: 18,
      },
      {
        key: "4",
        model: "VinFast VF7",
        category: "Sedan Điện",
        quantity: 15,
        price: 550000000,
        status: "Còn hàng",
        sold_this_month: 9,
      },
      {
        key: "5",
        model: "VinFast VF5",
        category: "Crossover Mini",
        quantity: 7,
        price: 458000000,
        status: "Sắp hết",
        sold_this_month: 15,
      },
    ],
    []
  );

  // Mock data cho đơn hàng gần đây
  const recentOrders = useMemo(
    () => [
      {
        id: "ORD-001",
        customer: "Nguyễn Văn A",
        vehicle: "VinFast VF8",
        status: "pending",
        value: 700000000,
        date: "2024-10-08",
      },
      {
        id: "ORD-002",
        customer: "Trần Thị B",
        vehicle: "VinFast VF9",
        status: "processing",
        value: 1380000000,
        date: "2024-10-07",
      },
      {
        id: "ORD-003",
        customer: "Lê Văn C",
        vehicle: "VinFast VF6",
        status: "completed",
        value: 300000000,
        date: "2024-10-06",
      },
      {
        id: "ORD-004",
        customer: "Phạm Thị D",
        vehicle: "VinFast VF7",
        status: "pending",
        value: 550000000,
        date: "2024-10-08",
      },
    ],
    []
  );

  // Mock data cho nhân viên xuất sắc
  const topStaff = useMemo(
    () => [
      {
        name: "Nguyễn Thành Long",
        role: "Tư vấn viên",
        sales: 45,
        revenue: 620000000,
        performance: 96,
      },
      {
        name: "Trần Minh Quân",
        role: "Tư vấn viên",
        sales: 38,
        revenue: 534000000,
        performance: 92,
      },
      {
        name: "Lê Thị Hương",
        role: "Tư vấn viên",
        sales: 32,
        revenue: 445000000,
        performance: 88,
      },
    ],
    []
  );

  const inventoryColumns = [
    {
      title: "Mẫu xe",
      dataIndex: "model",
      key: "model",
      render: (text, record) => (
        <Space>
          <CarOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{text}</div>
            <Text type="secondary" className="text-sm">
              {record.category}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      render: (value) => (
        <Space>
          <Badge
            count={value}
            showZero
            style={{ backgroundColor: value < 10 ? "#f5222d" : "#52c41a" }}
          />
          <Text>xe</Text>
        </Space>
      ),
    },
    {
      title: "Đã bán tháng này",
      dataIndex: "sold_this_month",
      key: "sold_this_month",
      render: (value) => (
        <Statistic value={value} suffix="xe" className="text-sm" />
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (value) => (
        <Text className="font-medium">{value.toLocaleString("vi-VN")} VND</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          "Còn hàng": "success",
          "Sắp hết": "warning",
          "Hết hàng": "error",
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
  ];

  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Text strong className="text-blue-600">
          {text}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Xe",
      dataIndex: "vehicle",
      key: "vehicle",
      render: (text) => (
        <Space>
          <CarOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value) => (
        <Text className="font-medium">{(value / 1000000).toFixed(0)}M VND</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          pending: {
            color: "orange",
            text: "Chờ xử lý",
            icon: <ClockCircleOutlined />,
          },
          processing: {
            color: "blue",
            text: "Đang xử lý",
            icon: <ClockCircleOutlined />,
          },
          completed: {
            color: "green",
            text: "Hoàn thành",
            icon: <CheckCircleOutlined />,
          },
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
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <DealerManagerLayout>
      <PageContainer
        header={{
          title: "Tổng quan đại lý",
          subTitle: "Dashboard quản lý bán hàng và kho xe",
          breadcrumb: {
            items: [
              { title: "Trang chủ" },
              { title: "Đại lý" },
              { title: "Tổng quan" },
            ],
          },
        }}
      >
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: "Doanh số tháng này",
                value: dashboardStats.totalSales,
                suffix: "xe",
                icon: (
                  <ShoppingCartOutlined className="text-blue-500 text-2xl" />
                ),
                description: (
                  <Space>
                    <RiseOutlined className="text-green-500" />
                    <Text className="text-green-600">
                      +{dashboardStats.growthRate}%
                    </Text>
                  </Space>
                ),
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: "Doanh thu tháng",
                value: dashboardStats.monthlyRevenue / 1000000000,
                precision: 1,
                suffix: " tỷ VND",
                icon: <DollarOutlined className="text-green-500 text-2xl" />,
                description: <Text type="secondary">Mục tiêu: 4.0 tỷ</Text>,
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: "Xe trong kho",
                value: dashboardStats.inventoryCount,
                suffix: "xe",
                icon: <CarOutlined className="text-orange-500 text-2xl" />,
                description: <Text type="secondary">5 mẫu xe khả dụng</Text>,
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: "Đơn chờ xử lý",
                value: dashboardStats.pendingOrders,
                icon: (
                  <ClockCircleOutlined className="text-purple-500 text-2xl" />
                ),
                description: (
                  <Badge count={dashboardStats.customers} showZero>
                    <Text type="secondary">Khách hàng</Text>
                  </Badge>
                ),
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </Col>
        </Row>

        {/* Low Stock Alert */}
        <Alert
          message="Cảnh báo tồn kho"
          description="2 mẫu xe sắp hết hàng (VinFast VF9, VinFast VF5). Vui lòng liên hệ để đặt thêm."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          className="mb-6"
          action={
            <Button size="small" type="primary">
              Đặt hàng thêm
            </Button>
          }
        />

        <Row gutter={[16, 16]}>
          {/* Inventory Table */}
          <Col xs={24} xl={14}>
            <ProCard
              title="Kho xe hiện tại"
              extra={<Text type="secondary">Cập nhật: Hôm nay</Text>}
              className="shadow-sm mb-4"
            >
              <Table
                columns={inventoryColumns}
                dataSource={inventoryVehicles}
                pagination={false}
                size="small"
                className="custom-table"
              />
            </ProCard>
          </Col>

          {/* Top Staff */}
          <Col xs={24} xl={10}>
            <ProCard
              title="Nhân viên xuất sắc tháng này"
              extra={<TrophyOutlined className="text-yellow-500" />}
              className="shadow-sm mb-4"
            >
              <List
                size="small"
                dataSource={topStaff}
                renderItem={(staff, index) => (
                  <List.Item className="px-0">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor:
                              index === 0 ? "#faad14" : "#1890ff",
                          }}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {staff.name}
                          </div>
                          <Text type="secondary" className="text-xs">
                            {staff.role}
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {staff.sales} xe
                        </div>
                        <Progress
                          percent={staff.performance}
                          size="small"
                          status={
                            staff.performance >= 95 ? "success" : "normal"
                          }
                          className="w-16"
                        />
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </ProCard>
          </Col>
        </Row>

        {/* Recent Orders */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <ProCard
              title="Đơn hàng gần đây"
              extra={
                <Button type="link" onClick={() => navigate("/dealer/orders")}>
                  Xem tất cả
                </Button>
              }
              className="shadow-sm"
            >
              <Table
                columns={orderColumns}
                dataSource={recentOrders}
                pagination={false}
                size="small"
                className="custom-table"
              />
            </ProCard>
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
              onClick={() => navigate("/dealer/customer/create")}
            >
              <UserAddOutlined className="text-3xl text-blue-500 mb-2" />
              <Title level={5} className="mb-1">
                Thêm khách hàng
              </Title>
              <Text type="secondary">Tạo hồ sơ khách hàng mới</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-green-400"
              onClick={() => navigate("/dealer/order/create")}
            >
              <FileTextOutlined className="text-3xl text-green-500 mb-2" />
              <Title level={5} className="mb-1">
                Tạo đơn hàng
              </Title>
              <Text type="secondary">Khởi tạo đơn bán xe mới</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              className="text-center cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-orange-400"
              onClick={() => navigate("/dealer/reports")}
            >
              <BarChartOutlined className="text-3xl text-orange-500 mb-2" />
              <Title level={5} className="mb-1">
                Báo cáo bán hàng
              </Title>
              <Text type="secondary">Xem thống kê chi tiết</Text>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </DealerManagerLayout>
  );
}

export default DealerManager;
